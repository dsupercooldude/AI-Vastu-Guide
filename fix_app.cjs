const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// The issue was I removed a closing div somewhere else. Let's just append one to the end before the closing tag.
content = content.replace(
  `        </main>
      </div>
    </div>
  );
}`,
  `        </main>
      </div>
    </div>
    </div>
  );
}`
);

fs.writeFileSync('src/App.tsx', content);
