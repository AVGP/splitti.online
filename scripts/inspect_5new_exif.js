const fs = require('fs');
const path = require('path');
const exifr = require('exifr');

const dir = 'C:/Users/mravg/.gemini/antigravity/brain/41eb0ccd-0a81-4cc3-9495-4818568d38e8/.user_uploaded';

const files = [
  'media_1790503089315.jpg',
  'media_1790503089316.jpg',
  'media_1790503089421.jpg',
  'media_1790503089423.jpg',
  'media_1790503089426.jpg'
];

async function main() {
  for (const file of files) {
    const filePath = path.join(dir, file);
    console.log(`\n=================== ${file} ===================`);
    try {
      const data = await exifr.parse(filePath, {
        tiff: true,
        exif: true,
        gps: true,
        xmp: true,
        iptc: true
      });
      console.log(JSON.stringify(data, null, 2));
    } catch (e) {
      console.log('Error:', e.message);
    }
  }
}

main();
