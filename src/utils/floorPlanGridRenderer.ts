import { VASTU_16_ZONES, VASTU_32_PADAS, FIVE_ELEMENTS } from '../constants/vastuData';

export interface GridRenderOptions {
  rotation: number; // In degrees (-180 to 180 or 0 to 360)
  centerX: number; // percentage (0 to 100)
  centerY: number; // percentage (0 to 100)
  radiusScale: number; // 0.5 to 2.5
  themeStyle?: 'architectural' | 'modernDark' | 'colorZones'; // 'architectural' matches exact blueprint style of reference image
  showZones: boolean;
  showZoneFills: boolean;
  showPadas: boolean;
  showDegreeRing: boolean;
  showBrahmasthan: boolean;
  showLabels: boolean;
  showDefectMarkers: boolean;
  showBuildingBoundary?: boolean;
  zoneOpacity: number; // 0.1 to 0.8
  houseName?: string;
  defects?: { zone: string; defect: string; severity?: string }[];
  mainEntrancePada?: string;
}

export const DEFAULT_GRID_OPTIONS: GridRenderOptions = {
  rotation: 0,
  centerX: 50,
  centerY: 50,
  radiusScale: 1.05,
  themeStyle: 'architectural',
  showZones: true,
  showZoneFills: false,
  showPadas: true,
  showDegreeRing: true,
  showBrahmasthan: true,
  showLabels: true,
  showDefectMarkers: true,
  showBuildingBoundary: true,
  zoneOpacity: 0.18,
  houseName: 'Floor Plan Vastu Mapping',
  defects: [],
};

export function renderShaktiChakraToCanvas(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement | null,
  options: GridRenderOptions
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  // 1. Draw floor plan image if provided
  if (image && image.complete && image.naturalWidth > 0) {
    ctx.save();
    // Maintain aspect ratio centered
    const imgAspect = image.naturalWidth / image.naturalHeight;
    const canvasAspect = width / height;
    let drawW = width;
    let drawH = height;
    let drawX = 0;
    let drawY = 0;

    if (imgAspect > canvasAspect) {
      drawH = width / imgAspect;
      drawY = (height - drawH) / 2;
    } else {
      drawW = height * imgAspect;
      drawX = (width - drawW) / 2;
    }

    ctx.drawImage(image, drawX, drawY, drawW, drawH);
    ctx.restore();
  } else {
    // Blueprint style background if no image
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    const step = 40;
    for (let x = 0; x < width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }

  // Calculate center coordinates and radius
  const cx = (options.centerX / 100) * width;
  const cy = (options.centerY / 100) * height;
  const minDim = Math.min(width, height);
  const baseRadius = (minDim * 0.40) * options.radiusScale;
  const padaInnerRadius = baseRadius * 0.98;
  const padaOuterRadius = baseRadius * 1.14;
  const degreeRingRadius = baseRadius * 1.28;

  const isArchStyle = options.themeStyle !== 'modernDark';
  const rayColor = isArchStyle ? 'rgba(217, 70, 239, 0.82)' : 'rgba(255, 255, 255, 0.45)';
  const dialColor = isArchStyle ? '#d946ef' : '#fbbf24';

  // 1b. Draw Blue Building Boundary Outline if enabled
  if (options.showBuildingBoundary) {
    ctx.save();
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 3.5;
    const boxW = baseRadius * 1.48;
    const boxH = baseRadius * 1.15;
    const boxX = cx - boxW / 2;
    const boxY = cy - boxH / 2;
    ctx.strokeRect(boxX, boxY, boxW, boxH);
    ctx.restore();
  }

  // 2. Draw 16 Directional Zones & Radial Rays
  if (options.showZones) {
    VASTU_16_ZONES.forEach((zone, idx) => {
      const startDeg = options.rotation + (idx * 22.5) - 11.25;
      const endDeg = startDeg + 22.5;
      const midDeg = startDeg + 11.25;

      const r1 = (startDeg * Math.PI) / 180;
      const r2 = (endDeg * Math.PI) / 180;
      const midRad = (midDeg * Math.PI) / 180;

      const reachR = degreeRingRadius;
      const p1x = cx + Math.sin(r1) * reachR;
      const p1y = cy - Math.cos(r1) * reachR;
      const p2x = cx + Math.sin(r2) * reachR;
      const p2y = cy - Math.cos(r2) * reachR;

      ctx.save();

      // Zone Wedge Fill (if enabled)
      if (options.showZoneFills) {
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(p1x, p1y);
        ctx.arc(cx, cy, reachR, -Math.PI / 2 + r1, -Math.PI / 2 + r2, false);
        ctx.closePath();
        ctx.fillStyle = hexToRgba(zone.elementColor, options.zoneOpacity);
        ctx.fill();
      }

      // Magenta / Violet Radial Separating Ray (Signature MahaVastu Shakti Chakra look)
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(p1x, p1y);
      ctx.strokeStyle = rayColor;
      ctx.lineWidth = 1.4;
      ctx.stroke();

      ctx.restore();

      // 16 Direction Name Labels (Large Architectural style matching reference image)
      if (options.showLabels) {
        ctx.save();
        const labelR = isArchStyle ? (baseRadius * 0.82) : (baseRadius * 0.74);
        const lx = cx + Math.sin(midRad) * labelR;
        const ly = cy - Math.cos(midRad) * labelR;

        if (isArchStyle) {
          // Architectural Clean Text in Cardinal Elemental Colors:
          // North & NNW/NNE/NE: Blue
          // East & ENE/ESE: Green
          // South & SE/SSE: Red
          // SW & SSW: Yellow/Olive
          // West & WSW/WNW/NW: Slate/Charcoal
          let dirColor = '#1e293b';
          const zId = zone.id;
          if (['n', 'nne', 'ne', 'nnw'].includes(zId)) dirColor = '#2563eb';
          else if (['ene', 'e', 'ese'].includes(zId)) dirColor = '#16a34a';
          else if (['se', 'sse', 's'].includes(zId)) dirColor = '#dc2626';
          else if (['ssw', 'sw'].includes(zId)) dirColor = '#ca8a04';
          else dirColor = '#1e293b';

          const isCardinal = ['n', 'e', 's', 'w'].includes(zId);
          ctx.font = isCardinal ? 'bold 18px "Trebuchet MS", system-ui, sans-serif' : 'bold 12px "Trebuchet MS", system-ui, sans-serif';
          ctx.fillStyle = dirColor;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          const labelText = isCardinal 
            ? (zId === 'n' ? 'NORTH' : zId === 'e' ? 'EAST' : zId === 's' ? 'SOUTH' : 'WEST')
            : zone.shortName;
          
          ctx.fillText(labelText, lx, ly);
        } else {
          // Pill HUD style
          const labelText = zone.shortName;
          ctx.font = 'bold 14px system-ui, sans-serif';
          const textMetrics = ctx.measureText(labelText);
          const pillW = textMetrics.width + 16;
          const pillH = 22;

          ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
          ctx.strokeStyle = zone.elementColor;
          ctx.lineWidth = 1.5;
          roundRect(ctx, lx - pillW / 2, ly - pillH / 2, pillW, pillH, 6);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(labelText, lx, ly);
        }

        ctx.restore();
      }
    });
  }

  // 3. Draw 32 Entrance Padas (E1-E8, S1-S8, W1-W8, N1-N8)
  if (options.showPadas) {
    const padaWidthDeg = 360 / 32; // 11.25 degrees each
    const innerR = padaInnerRadius;
    const outerR = padaOuterRadius;

    // Draw concentric boundary circles for the pada ring
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
    ctx.strokeStyle = isArchStyle ? 'rgba(217, 70, 239, 0.7)' : '#334155';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
    ctx.strokeStyle = isArchStyle ? 'rgba(217, 70, 239, 0.7)' : '#334155';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    VASTU_32_PADAS.forEach((pada, i) => {
      const startDeg = options.rotation + (i * padaWidthDeg);
      const endDeg = startDeg + padaWidthDeg;
      const midDeg = startDeg + padaWidthDeg / 2;

      const r1 = (startDeg * Math.PI) / 180;
      const r2 = (endDeg * Math.PI) / 180;
      const midRad = (midDeg * Math.PI) / 180;

      const isAuspicious = pada.status === 'Auspicious';
      const isSelected = options.mainEntrancePada === pada.code;

      ctx.save();

      // Divider line between padas
      const lineX1 = cx + Math.sin(r1) * innerR;
      const lineY1 = cy - Math.cos(r1) * innerR;
      const lineX2 = cx + Math.sin(r1) * outerR;
      const lineY2 = cy - Math.cos(r1) * outerR;
      ctx.beginPath();
      ctx.moveTo(lineX1, lineY1);
      ctx.lineTo(lineX2, lineY2);
      ctx.strokeStyle = isArchStyle ? 'rgba(217, 70, 239, 0.75)' : '#475569';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Highlight selected entrance or auspicious sector
      if (isSelected) {
        ctx.beginPath();
        ctx.arc(cx, cy, outerR, -Math.PI / 2 + r1, -Math.PI / 2 + r2, false);
        ctx.arc(cx, cy, innerR, -Math.PI / 2 + r2, -Math.PI / 2 + r1, true);
        ctx.closePath();
        ctx.fillStyle = 'rgba(245, 158, 11, 0.45)';
        ctx.fill();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Text for Pada Code (e.g., N1-N8, E1-E8, S1-S8, W1-W8)
      const textR = (innerR + outerR) / 2;
      const tx = cx + Math.sin(midRad) * textR;
      const ty = cy - Math.cos(midRad) * textR;

      ctx.font = isSelected ? 'bold 12px system-ui' : (isAuspicious ? 'bold 11px system-ui' : '10px system-ui');
      if (isSelected) {
        ctx.fillStyle = '#b45309';
      } else if (isAuspicious) {
        ctx.fillStyle = '#16a34a'; // Auspicious Green
      } else {
        ctx.fillStyle = isArchStyle ? '#475569' : '#94a3b8';
      }

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(pada.code, tx, ty);

      ctx.restore();
    });
  }

  // 4. Draw 360-Degree Dial & Calibrated Ring (Full 0° - 350° outer numbers)
  if (options.showDegreeRing) {
    ctx.save();
    const ringR = degreeRingRadius;

    // Circumference line
    ctx.beginPath();
    ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
    ctx.strokeStyle = dialColor;
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // Degree tick marks (every 1°, 5°, and 10°)
    for (let deg = 0; deg < 360; deg += 1) {
      const isMajor = deg % 10 === 0;
      const isMedium = deg % 5 === 0;

      const angleDeg = options.rotation + deg;
      const rad = (angleDeg * Math.PI) / 180;

      const tickLen = isMajor ? 12 : isMedium ? 8 : 4;
      const startR = ringR;
      const endR = ringR + tickLen;

      const x1 = cx + Math.sin(rad) * startR;
      const y1 = cy - Math.cos(rad) * startR;
      const x2 = cx + Math.sin(rad) * endR;
      const y2 = cy - Math.cos(rad) * endR;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = isMajor ? dialColor : isMedium ? 'rgba(217, 70, 239, 0.7)' : 'rgba(217, 70, 239, 0.35)';
      ctx.lineWidth = isMajor ? 1.5 : isMedium ? 1.0 : 0.6;
      ctx.stroke();

      // Degree Numbers for every 10 degrees (0, 10, 20, 30... 350)
      if (isMajor) {
        const numR = ringR + 20;
        const nx = cx + Math.sin(rad) * numR;
        const ny = cy - Math.cos(rad) * numR;
        
        ctx.save();
        ctx.translate(nx, ny);
        // Rotate text to follow circular arc nicely
        ctx.rotate(-rad + Math.PI / 2);
        ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = isArchStyle ? '#0f172a' : '#fbbf24';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${deg}`, 0, 0);
        ctx.restore();
      }
    }
    ctx.restore();
  }

  // 5. Draw Brahmasthan Center (Sacred Core with green/teal energy ripples)
  if (options.showBrahmasthan) {
    ctx.save();
    const brahmaRadius = baseRadius * 0.16;

    // Green / Teal concentric energy ripple rings (as seen in architectural MahaVastu drawings)
    [0.4, 0.7, 1.0, 1.3].forEach((scale, rIdx) => {
      ctx.beginPath();
      ctx.arc(cx, cy, brahmaRadius * scale, 0, Math.PI * 2);
      ctx.strokeStyle = rIdx % 2 === 0 ? 'rgba(16, 185, 129, 0.6)' : 'rgba(52, 211, 153, 0.4)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    });

    // Central core circle
    ctx.beginPath();
    ctx.arc(cx, cy, brahmaRadius * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(16, 185, 129, 0.18)';
    ctx.fill();

    // Sacred center crosshair
    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - brahmaRadius * 0.6, cy);
    ctx.lineTo(cx + brahmaRadius * 0.6, cy);
    ctx.moveTo(cx, cy - brahmaRadius * 0.6);
    ctx.lineTo(cx, cy + brahmaRadius * 0.6);
    ctx.stroke();

    // Center Golden Bead
    ctx.beginPath();
    ctx.arc(cx, cy, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = '#f59e0b';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();
  }

  // 6. Draw Defect / Dosha Markers
  if (options.showDefectMarkers && options.defects && options.defects.length > 0) {
    options.defects.forEach((d) => {
      const zoneObj = VASTU_16_ZONES.find(
        (z) => z.id.toLowerCase() === d.zone.toLowerCase() || z.name.toLowerCase() === d.zone.toLowerCase()
      );
      if (!zoneObj) return;

      const angleDeg = options.rotation + zoneObj.centerDegree;
      const rad = (angleDeg * Math.PI) / 180;
      const markerR = baseRadius * 0.45;
      const mx = cx + Math.sin(rad) * markerR;
      const my = cy - Math.cos(rad) * markerR;

      ctx.save();
      // Pulsing red alert pin
      ctx.beginPath();
      ctx.arc(mx, my, 12, 0, Math.PI * 2);
      ctx.fillStyle = '#dc2626';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Warning sign !
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('!', mx, my);

      // Defect Title Callout box
      ctx.font = 'bold 10px system-ui';
      const textW = ctx.measureText(d.defect.slice(0, 24)).width;
      const boxW = Math.max(textW + 16, 70);
      const boxH = 18;
      const bx = mx - boxW / 2;
      const by = my + 16;

      ctx.fillStyle = 'rgba(185, 28, 28, 0.95)';
      ctx.strokeStyle = '#f87171';
      ctx.lineWidth = 1;
      roundRect(ctx, bx, by, boxW, boxH, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(d.defect.slice(0, 24), mx, by + boxH / 2);

      ctx.restore();
    });
  }

  // 7. Top Banner & Watermark
  ctx.save();
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  roundRect(ctx, 16, 16, 360, 48, 8);
  ctx.fill();
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('VASTU SHAKTI CHAKRA GRID MAP', 28, 36);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '10px system-ui, sans-serif';
  ctx.fillText(`16 Zones • 32 Padas • North = ${options.rotation.toFixed(1)}°`, 28, 52);

  // Five Elements Legend Bottom Right
  const legX = width - 290;
  const legY = height - 58;
  ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
  roundRect(ctx, legX, legY, 274, 46, 8);
  ctx.fill();
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#cbd5e1';
  ctx.font = 'bold 9px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('PANCHTATTVA 5-ELEMENT PALETTE:', legX + 10, legY + 16);

  FIVE_ELEMENTS.forEach((elem, eIdx) => {
    const itemX = legX + 10 + eIdx * 52;
    const itemY = legY + 28;
    ctx.beginPath();
    ctx.arc(itemX + 5, itemY, 4, 0, Math.PI * 2);
    ctx.fillStyle = elem.color;
    ctx.fill();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px system-ui, sans-serif';
    ctx.fillText(elem.name.split(' ')[0], itemX + 12, itemY + 3);
  });

  ctx.restore();
}

/** Helper to draw rounded rectangle */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Helper to convert hex to rgba */
function hexToRgba(hex: string, alpha: number): string {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Generates a high-definition composite PNG data URL of the floor plan with Shakti Chakra grid
 */
export async function generateShaktiChakraImage(
  imageSrc: string,
  options: Partial<GridRenderOptions> = {}
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      // High resolution export
      const targetW = Math.max(1600, img.naturalWidth || 1600);
      const targetH = Math.max(1200, img.naturalHeight || 1200);
      canvas.width = targetW;
      canvas.height = targetH;

      const mergedOptions: GridRenderOptions = {
        ...DEFAULT_GRID_OPTIONS,
        ...options,
      };

      renderShaktiChakraToCanvas(canvas, img, mergedOptions);
      resolve(canvas.toDataURL('image/png', 0.95));
    };
    img.onerror = () => {
      // Fallback with empty blueprint
      const canvas = document.createElement('canvas');
      canvas.width = 1600;
      canvas.height = 1200;
      const mergedOptions: GridRenderOptions = {
        ...DEFAULT_GRID_OPTIONS,
        ...options,
      };
      renderShaktiChakraToCanvas(canvas, null, mergedOptions);
      resolve(canvas.toDataURL('image/png', 0.95));
    };
    img.src = imageSrc;
  });
}
