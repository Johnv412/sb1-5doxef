const fs = require('fs');
const path = require('path');

// Create necessary directories
const dirs = [
  'app/App_Resources',
  'app/assets',
  'app/views',
  'app/services',
  'app/utils'
];

dirs.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

// Ensure App_Resources has platform folders
const platformDirs = ['Android', 'iOS'].map(platform => 
  path.join(__dirname, 'app/App_Resources', platform)
);

platformDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

console.log('NativeScript project structure setup complete');