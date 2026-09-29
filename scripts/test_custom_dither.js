const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

function quantize8Bit(r, g, b) {
  const rq = Math.round((r / 255) * 7) / 7 * 255;
  const gq = Math.round((g / 255) * 7) / 7 * 255;
  const bq = Math.round((b / 255) * 3) / 3 * 255;
  return [
    Math.min(255, Math.max(0, Math.round(rq))),
    Math.min(255, Math.max(0, Math.round(gq))),
    Math.min(255, Math.max(0, Math.round(bq)))
  ];
}

async function processImage8BitDither(inputPath, outputPath, targetWidth = 640) {
  const image = sharp(inputPath);
  const metadata = await image.metadata();

  const width = Math.min(targetWidth, metadata.width || targetWidth);
  const resized = await image.resize({ width }).raw().toBuffer({ resolveWithObject: true });

  const { data, info } = resized;
  const w = info.width;
  const h = info.height;
  const channels = info.channels;

  // Float array for error diffusion
  const buf = new Float32Array(w * h * 3);
  for (let i = 0; i < w * h; i++) {
    buf[i * 3] = data[i * channels];
    buf[i * 3 + 1] = data[i * channels + 1];
    buf[i * 3 + 2] = data[i * channels + 2];
  }

  const outputBuf = Buffer.alloc(w * h * 3);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 3;
      const oldR = buf[idx];
      const oldG = buf[idx + 1];
      const oldB = buf[idx + 2];

      const [newR, newG, newB] = quantize8Bit(oldR, oldG, oldB);

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

  // Preserve EXIF metadata if present in original
  let pipeline = sharp(outputBuf, {
    raw: {
      width: w,
      height: h,
      channels: 3
    }
  }).withMetadata();

  if (inputPath.endsWith('.png')) {
    await pipeline.png({ palette: true, colors: 256 }).toFile(outputPath);
  } else {
    await pipeline.jpeg({ quality: 85, chromaSubsampling: '4:2:0' }).toFile(outputPath);
  }
}

const sampleInput = path.join(__dirname, '..', 'src', 'assets', 'images', 'photo_lugano.jpg');
const sampleOutput = path.join(__dirname, '..', 'scratch', 'test_custom_8bit_lugano.jpg');

processImage8BitDither(sampleInput, sampleOutput)
  .then(() => console.log('Custom 8-bit Floyd-Steinberg dither complete!'))
  .catch(console.error);
