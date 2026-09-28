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

async function ditherImage(filePath) {
  console.log(`Processing 8-bit dither for: ${path.basename(filePath)}...`);
  const image = sharp(filePath);
  const metadata = await image.metadata();

  const isPng = filePath.endsWith('.png');
  const targetWidth = isPng ? metadata.width : 800; // photos resized to 800px width max for crisp 8bit stippling
  const width = Math.min(targetWidth, metadata.width || targetWidth);

  const resized = await image.resize({ width }).raw().toBuffer({ resolveWithObject: true });
  const { data, info } = resized;
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

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const pIdx = y * w + x;
      const idx3 = pIdx * 3;
      const idxC = pIdx * channels;

      const oldR = buf[idx3];
      const oldG = buf[idx3 + 1];
      const oldB = buf[idx3 + 2];

      const [newR, newG, newB] = quantize8Bit(oldR, oldG, oldB);

      outputBuf[idxC] = newR;
      outputBuf[idxC + 1] = newG;
      outputBuf[idxC + 2] = newB;

      if (channels === 4) {
        outputBuf[idxC + 3] = data[idxC + 3]; // preserve alpha
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

  const tmpPath = filePath + '.tmp';

  let pipeline = sharp(outputBuf, {
    raw: {
      width: w,
      height: h,
      channels
    }
  }).withMetadata();

  if (isPng) {
    await pipeline.png({ palette: true, colors: 256, dither: 1.0 }).toFile(tmpPath);
  } else {
    await pipeline.jpeg({ quality: 90, chromaSubsampling: '4:2:0' }).toFile(tmpPath);
  }

  fs.renameSync(tmpPath, filePath);
  console.log(`Finished 8-bit dither for: ${path.basename(filePath)}`);
}

async function main() {
  const imagesDir = path.join(__dirname, '..', 'src', 'assets', 'images');
  const files = fs.readdirSync(imagesDir).filter(f => f.endsWith('.jpg') || f.endsWith('.png'));

  for (const file of files) {
    const filePath = path.join(imagesDir, file);
    await ditherImage(filePath);
  }

  console.log('All images successfully converted to 8-bit dithered versions!');
}

main().catch(console.error);
