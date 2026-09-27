const fs = require('fs');
const path = require('path');
const exifr = require('exifr');

const dir = 'C:/Users/mravg/.gemini/antigravity/brain/41eb0ccd-0a81-4cc3-9495-4818568d38e8/.user_uploaded';

async function main() {
  const files = [
    'media_1790501801062.jpg',
    'media_1790501801064.jpg',
    'media_1790501801066.jpg',
    'media_1790501801068.jpg'
  ];

  for (const file of files) {
    const filePath = path.join(dir, file);
    console.log(`\n=================== ${file} ===================`);
    try {
      const output = await exifr.parse(filePath, {
        tiff: true,
        exif: true,
        gps: true,
        xmp: true,
        icc: true,
        iptc: true,
        reviveValues: true
      });
      console.log(JSON.stringify(output, null, 2));
    } catch (e) {
      console.log('Error:', e.message);
    }
  }
}

main();
