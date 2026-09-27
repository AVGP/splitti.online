const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const inputDir = 'C:/Users/mravg/.gemini/antigravity/brain/41eb0ccd-0a81-4cc3-9495-4818568d38e8/.user_uploaded';
const outputDir = 'src/assets/images';

const newPhotos = [
  { file: 'media_1790502540466.jpg', name: 'photo_lugano.jpg' },
  { file: 'media_1790502540468.jpg', name: 'photo_kyiv_arch.jpg' },
  { file: 'media_1790502540496.jpg', name: 'photo_tropical_beach.jpg' },
  { file: 'media_1790502540499.jpg', name: 'photo_moscow_museum.jpg' },
  { file: 'media_1790502540538.jpg', name: 'photo_zurich_lindenhof.jpg' }
];

async function processLate90sPhotos() {
  for (const item of newPhotos) {
    const inputPath = path.join(inputDir, item.file);
    const outputPath = path.join(outputDir, item.name);

    if (!fs.existsSync(inputPath)) {
      console.error(`Input file not found: ${inputPath}`);
      continue;
    }

    const image = sharp(inputPath);
    const metadata = await image.metadata();

    // Late 90s digital camera resolution scaling (max 1024px width)
    const targetWidth = Math.min(metadata.width, 1024);

    await image
      .resize({ width: targetWidth })
      .modulate({
        brightness: 1.02,
        saturation: 1.15
      })
      .gamma(1.12)
      .withMetadata() // PRESERVE ALL ORIGINAL METADATA & ICC PROFILES
      .jpeg({
        quality: 74, // Late-90s digicam JPEG compression
        chromaSubsampling: '4:2:0'
      })
      .toFile(outputPath);

    console.log(`Processed late 90s style image: ${item.name}`);
  }
}

processLate90sPhotos().catch(console.error);
