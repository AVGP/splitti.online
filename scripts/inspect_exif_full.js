const fs = require('fs');
const path = require('path');
const exifr = require('exifr');

const dir = 'C:/Users/mravg/.gemini/antigravity/brain/41eb0ccd-0a81-4cc3-9495-4818568d38e8/.user_uploaded';

async function main() {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    try {
      const data = await exifr.parse(filePath, {
        tiff: true,
        exif: true,
        gps: true,
        xmp: true,
        iptc: true
      });
      console.log(`=== ${file} ===`);
      console.log(data);
    } catch (err) {
      console.log(`Error reading ${file}:`, err.message);
    }
  }
}

main();
