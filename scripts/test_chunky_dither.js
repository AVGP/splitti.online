const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// 90s Web-safe / Windows 98 palette quantization (3-3-2 RGB or custom 64-128 color palette)
function quantizeChunky8Bit(r, g, b) {
  // 6 levels for R (0, 51, 102, 153, 204, 255), 6 for G, 6 for B = 216 web-safe colors
  const rq = Math.round(r / 51) * 51;
  const gq = Math.round(g / 51) * 51;
  const bq = Math.round(b / 51) * 51;
  return [
    Math.min(255, Math.max(0, rq)),
    Math.min(255, Math.max(0, gq)),
    Math.min(255, Math.max(0, bq))
  ];
}

async function testChunkyDither(inputPath, outputPath, lowWidth = 320) {
  const image = sharp(inputPath);
  const metadata = await image.metadata();

  // 1. Downscale to low resolution so dither dots are large and chunky
  const lowRes = await image
    .resize({ width: lowWidth })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data, info } = lowRes;
  const w = info.width;
  const h = info.height;

  const buf = new Float32Array(w * h * 3);
  for (let i = 0; i < w * h; i++) {
    buf[i * 3] = data[i * 3];
    buf[i * 3 + 1] = data[i * 3 + 1];
    buf[i * 3 + 2] = data[i * 3 + 2];
  }

  const outputBuf = Buffer.alloc(w * h * 3);

  // Floyd-Steinberg Error Diffusion Dithering on 216-color Web-Safe / Win98 Palette
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 3;
      const oldR = buf[idx];
      const oldG = buf[idx + 1];
      const oldB = buf[idx + 2];

      const [newR, newG, newB] = quantizeChunky8Bit(oldR, oldG, oldB);

      outputBuf[idx] = newR;
      outputBuf[idx + 1] = newG;
      outputBuf[idx + 2] = newB;

      const errR = oldR - newR;
      const errG = oldG - newG;
      const errB = oldB - newB;

      const distributeError = (nx, ny, weight) => {
        if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
          const nIdx = (ny * w + nx) * 3;
          buf[nIdx] += errR * weight;
          buf[nIdx + 1] += errG * weight;
          buf[nIdx + 2] += errB * weight;
        }
      };

      distributeError(x + 1, y, 7 / 16);
      distributeError(x - 1, y + 1, 3 / 16);
      distributeError(x, y + 1, 5 / 16);
      distributeError(x + 1, y + 1, 1 / 16);
    }
  }

  // 2. Upscale with NEAREST NEIGHBOR (pixelated, no blur) back to 640px so dither pixels are crisp 2x2 blocks!
  await sharp(outputBuf, {
    raw: { width: w, height: h, channels: 3 }
  })
    .resize({ width: w * 2, kernel: sharp.kernel.nearest })
    .jpeg({ quality: 85 })
    .toFile(outputPath);

  console.log(`Chunky 90s dither saved to: ${outputPath}`);
}

const sampleInput = path.join(__dirname, '..', 'src', 'assets', 'images', 'photo_lugano.jpg');
const sampleOutput = path.join(__dirname, '..', 'scratch', 'test_chunky_lugano.jpg');

testChunkyDither(sampleInput, sampleOutput).catch(console.error);
