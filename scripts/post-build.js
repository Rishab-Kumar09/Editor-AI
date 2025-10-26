const fs = require('fs');
const path = require('path');

// Copy directory recursively
function copyDirSync(src, dest) {
  if (!fs.existsSync(src)) {
    console.error(`❌ Source not found: ${src}`);
    return;
  }
  
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('\n📦 POST-BUILD: Copying required files for Next.js standalone...\n');

const standalonePath = path.join(__dirname, '..', '.next', 'standalone');
const staticSource = path.join(__dirname, '..', '.next', 'static');
const staticDest = path.join(standalonePath, '.next', 'static');
const publicSource = path.join(__dirname, '..', 'public');
const publicDest = path.join(standalonePath, 'public');

// Copy .next/static
console.log('Copying .next/static...');
console.log(`  From: ${staticSource}`);
console.log(`  To: ${staticDest}`);
if (fs.existsSync(staticSource)) {
  copyDirSync(staticSource, staticDest);
  console.log('  ✓ Copied successfully\n');
} else {
  console.error('  ❌ Source not found!\n');
  process.exit(1);
}

// Copy public
console.log('Copying public...');
console.log(`  From: ${publicSource}`);
console.log(`  To: ${publicDest}`);
if (fs.existsSync(publicSource)) {
  copyDirSync(publicSource, publicDest);
  console.log('  ✓ Copied successfully\n');
} else {
  console.error('  ❌ Source not found!\n');
  process.exit(1);
}

console.log('✅ POST-BUILD COMPLETE!\n');

