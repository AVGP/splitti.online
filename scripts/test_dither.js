const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sampleInput = path.join(__dirname, '..', 'src', 'assets', 'images', 'photo_lugano.jpg');
const sampleOutputPng = path.join(__dirname, '..', 'scratch', 'test_lugano_8bit.png');
const sampleOutputJpg = path.join(__dirname, '..', 'scratch', 'test_lugano_8bit.jpg');

async function testDither() {
  const scratchDir = path.join(__dirname, '..', 'scratch');
  if (!fs.existsSync(scratchDir)) {
    fs.mkdirSync(scratchDir, { recursive: true });
  }

  // 1. Sharp PNG 256-color palette dither (Floyd-Steinberg imagequant)
  await sharp(sampleInput)
    .resize({ width: 640 })
    .png({ palette: true, colors: 256, dither: 1.0 })
    .toFile(sampleOutputPng);

  // 2. Convert 256-color dithered PNG to JPEG (or keep as PNG/JPEG)
  await sharp(sampleOutputPng)
    .jpeg({ quality: 90 })
    .toFile(sampleOutputJpg);

  console.log('Test dither complete. Generated files in scratch/');
}

testDither().catch(console.error);
