const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      const replacements = [
        { from: /blue-650/g, to: 'blue-600' },
        { from: /slate-650/g, to: 'slate-600' },
        { from: /slate-150/g, to: 'slate-200' },
        { from: /slate-450/g, to: 'slate-400' },
        { from: /slate-905/g, to: 'slate-900' },
        { from: /blue-750/g, to: 'blue-800' },
        { from: /fuchsia-750/g, to: 'fuchsia-800' },
        { from: /indigo-150/g, to: 'indigo-200' },
        { from: /emerald-150/g, to: 'emerald-200' }
      ];

      let original = content;
      for (const r of replacements) {
        content = content.replace(r.from, r.to);
      }
      
      if (original !== content) {
        console.log('Fixed', fullPath);
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}

processDir(path.join(__dirname, 'src'));
