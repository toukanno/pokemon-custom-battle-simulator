const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');
const targets = ['index.html', 'illustrations'];

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

function copyRecursive(source, destination) {
  const stats = fs.statSync(source);
  if (stats.isDirectory()) {
    fs.mkdirSync(destination, { recursive: true });
    for (const entry of fs.readdirSync(source)) {
      copyRecursive(path.join(source, entry), path.join(destination, entry));
    }
    return;
  }

  fs.copyFileSync(source, destination);
}

for (const target of targets) {
  const source = path.join(root, target);
  if (!fs.existsSync(source)) {
    throw new Error(`Missing required build target: ${target}`);
  }
  copyRecursive(source, path.join(dist, target));
}

console.log('Build complete:', dist);
