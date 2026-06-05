const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, 'dist/employeemanagerapp/browser');
const dest = path.join(__dirname, 'dist/employeemanagerapp');

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

try {
  if (fs.existsSync(src)) {
    copyRecursiveSync(src, dest);
    console.log('Successfully copied build files from /browser to root of dist folder.');
  } else {
    console.log('Source browser directory does not exist yet.');
  }
} catch (e) {
  console.error('Error copying build files:', e);
}
