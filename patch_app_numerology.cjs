const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  `                <VastuPlacementGuide />
                  </div>
                  <div>
                    <VastuChecklist checkedItems={checkedItems} onToggle={toggleCheck} />`,
  `                <VastuPlacementGuide />
                <div className="mt-8"></div>
                <HouseNumerology />
                  </div>
                  <div>
                    <VastuChecklist checkedItems={checkedItems} onToggle={toggleCheck} />`
);

fs.writeFileSync('src/App.tsx', code);
