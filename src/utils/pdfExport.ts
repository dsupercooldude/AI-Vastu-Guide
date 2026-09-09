import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const exportToPDF = async (elementId: string, filename: string = 'Vastu_Report.pdf') => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return;
  }

  // To prevent scrolling issues, we might need to temporarily style the element to fit its content
  const originalMaxHeight = element.style.maxHeight;
  const originalOverflow = element.style.overflowY;
  
  element.style.maxHeight = 'none';
  element.style.overflowY = 'visible';

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });
    
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(filename);
  } catch (err) {
    console.error('Error generating PDF', err);
  } finally {
    // Restore original styles
    element.style.maxHeight = originalMaxHeight;
    element.style.overflowY = originalOverflow;
  }
};
