const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const inputDir = 'C:/Users/mravg/.gemini/antigravity/brain/41eb0ccd-0a81-4cc3-9495-4818568d38e8/.user_uploaded';
const outputDir = 'src/assets/images';

const photos = [
  { file: 'media_1790501801062.jpg', name: 'photo1_conference.jpg' },
  { file: 'media_1790501801064.jpg', name: 'photo2_swim.jpg' },
  { file: 'media_1790501801066.jpg', name: 'photo3_presentation.jpg' },
  { file: 'media_1790501801068.jpg', name: 'photo4_view.jpg' }
];

async function processPhotos() {
  for (const item of photos) {
    const inputPath = path.join(inputDir, item.file);
    const outputPath = path.join(outputDir, item.name);

    if (!fs.existsSync(inputPath)) {
      console.log(`File missing: ${inputPath}`);
      continue;
    }

    const image = sharp(inputPath);
    const metadata = await image.metadata();

    // Resize to authentic 1997-2003 digicam resolution max 1280px width
    const targetWidth = Math.min(metadata.width, 1280);

    await image
      .resize({ width: targetWidth })
      .modulate({
        brightness: 1.03,
        saturation: 1.12
      })
      // Subtle color warmth & vintage digicam contrast
      .gamma(1.1)
      .jpeg({
        quality: 78, // Retro digicam JPEG compression artifacting
        chromaSubsampling: '4:2:0'
      })
      .toFile(outputPath);

    console.log(`Processed: ${item.name}`);
  }
}

processPhotos().catch(console.error);
