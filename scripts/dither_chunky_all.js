const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// 90s Web-safe / Windows 98 216-color palette quantization
function quantizeChunky8Bit(r, g, b) {
  const rq = Math.round(r / 51) * 51;
  const gq = Math.round(g / 51) * 51;
  const bq = Math.round(b / 51) * 51;
  return [
    Math.min(255, Math.max(0, rq)),
    Math.min(255, Math.max(0, gq)),
    Math.min(255, Math.max(0, bq))
  ];
}

async function ditherImageChunky(filePath) {
  console.log(`Processing chunky 90s dither for: ${path.basename(filePath)}...`);
  const image = sharp(filePath);
  const metadata = await image.metadata();

  const isPng = filePath.endsWith('.png');
  const targetLowWidth = isPng ? Math.min(128, metadata.width) : 340;
  const wTarget = Math.min(targetLowWidth, metadata.width || targetLowWidth);

  // 1. Downscale to low resolution
  const lowRes = await image
    .resize({ width: wTarget })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data, info } = lowRes;
  const w = info.width;
  const h = info.height;
  const channels = info.channels;

  const buf = new Float32Array(w * h * 3);
  for (let i = 0; i < w * h; i++) {
    buf[i * 3] = data[i * channels];
    buf[i * 3 + 1] = data[i * channels + 1];
    buf[i * 3 + 2] = data[i * channels + 2];
  }

  const outputBuf = Buffer.alloc(w * h * channels);

  // 2. Floyd-Steinberg Dithering
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const pIdx = y * w + x;
      const idx3 = pIdx * 3;
      const idxC = pIdx * channels;

      const oldR = buf[idx3];
      const oldG = buf[idx3 + 1];
      const oldB = buf[idx3 + 2];

      const [newR, newG, newB] = quantizeChunky8Bit(oldR, oldG, oldB);

      outputBuf[idxC] = newR;
      outputBuf[idxC + 1] = newG;
      outputBuf[idxC + 2] = newB;

      if (channels === 4) {
        outputBuf[idxC + 3] = data[idxC + 3];
      }

      const errR = oldR - newR;
      const errG = oldG - newG;
      const errB = oldB - newB;

      const distributeError = (nx, ny, weight) => {
        if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
          const nIdx3 = (ny * w + nx) * 3;
          buf[nIdx3] += errR * weight;
          buf[nIdx3 + 1] += errG * weight;
          buf[nIdx3 + 2] += errB * weight;
        }
      };

      distributeError(x + 1, y, 7 / 16);
      distributeError(x - 1, y + 1, 3 / 16);
      distributeError(x, y + 1, 5 / 16);
      distributeError(x + 1, y + 1, 1 / 16);
    }
  }

  // 3. Upscale using Nearest Neighbor to double size so dither pixels are crisp 2x2 blocks
  const scaleFactor = isPng ? 1 : 2;
  const outWidth = w * scaleFactor;

  const tmpPath = filePath + '.chunky.tmp';

  let pipeline = sharp(outputBuf, {
    raw: { width: w, height: h, channels }
  })
    .resize({ width: outWidth, kernel: sharp.kernel.nearest })
    .withMetadata();

  if (isPng) {
    await pipeline.png({ palette: true, colors: 256 }).toFile(tmpPath);
  } else {
    await pipeline.jpeg({ quality: 85, chromaSubsampling: '4:2:0' }).toFile(tmpPath);
  }

  fs.renameSync(tmpPath, filePath);
  console.log(`Finished chunky 90s dither: ${path.basename(filePath)}`);
}

async function main() {
  const imagesDir = path.join(__dirname, '..', 'src', 'assets', 'images');
  const files = fs.readdirSync(imagesDir).filter(f => f.endsWith('.jpg') || f.endsWith('.png'));

  for (const file of files) {
    const filePath = path.join(imagesDir, file);
    await ditherImageChunky(filePath);
  }

  console.log('All images successfully converted to chunky 90s 8-bit dithered versions!');
}

main().catch(console.error);
