const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// import
content = content.replace(
  /import \{ ImageOverlayModal \} from '\.\/components\/ImageOverlayModal';/,
  "import { ImageOverlayModal } from './components/ImageOverlayModal';\nimport { PWAInstallButton } from './components/PWAInstallButton';"
);

// place after </nav>
content = content.replace(
  /<\/nav>/,
  "</nav>\n\n          <div className=\"mt-4 flex justify-center\">\n            <PWAInstallButton />\n          </div>"
);

fs.writeFileSync('src/App.tsx', content);
