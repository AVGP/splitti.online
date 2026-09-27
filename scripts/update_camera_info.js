const fs = require('fs');
const path = require('path');

const photosDir = path.join(__dirname, '..', 'src', 'content', 'photos');
const files = fs.readdirSync(photosDir).filter(f => f.endsWith('.md'));

let updatedCount = 0;

files.forEach(file => {
  const filePath = path.join(photosDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace camera field in frontmatter
  content = content.replace(/camera:\s*.*$/m, 'camera: Minolta Dimage Xt');

  // Replace body EXIF Camera Note if present
  content = content.replace(
    /- \*\*EXIF Camera Note:\*\*.*$/m,
    '- **EXIF Camera Note:** Minolta Dimage Xt (2.0 Megapixel CCD Sensor, 3x Optical Zoom).'
  );

  fs.writeFileSync(filePath, content, 'utf8');
  updatedCount++;
});

console.log(`Successfully updated camera info to "Minolta Dimage Xt" in ${updatedCount} photo files.`);
