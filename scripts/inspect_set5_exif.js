const path = require('path');
const exifr = require('exifr');

const files = [
  'C:/Users/mravg/.gemini/antigravity/brain/26a865a3-bcbd-4d4d-8d17-469f2e54f1a7/.user_uploaded/media_1790709381344.jpg',
  'C:/Users/mravg/.gemini/antigravity/brain/26a865a3-bcbd-4d4d-8d17-469f2e54f1a7/.user_uploaded/media_1790709381343.jpg',
  'C:/Users/mravg/.gemini/antigravity/brain/26a865a3-bcbd-4d4d-8d17-469f2e54f1a7/.user_uploaded/media_1790709381345.jpg',
  'C:/Users/mravg/.gemini/antigravity/brain/26a865a3-bcbd-4d4d-8d17-469f2e54f1a7/.user_uploaded/media_1790709381402.jpg',
  'C:/Users/mravg/.gemini/antigravity/brain/26a865a3-bcbd-4d4d-8d17-469f2e54f1a7/.user_uploaded/media_1790709381407.jpg'
];

async function main() {
  for (const file of files) {
    console.log(`\n=================== ${path.basename(file)} ===================`);
    try {
      const data = await exifr.parse(file, {
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
