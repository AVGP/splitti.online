const fs = require('fs');
const path = require('path');

const dir = 'C:/Users/mravg/.gemini/antigravity/brain/41eb0ccd-0a81-4cc3-9495-4818568d38e8/.user_uploaded';
const files = [
  'media_1790502540466.jpg',
  'media_1790502540468.jpg',
  'media_1790502540496.jpg',
  'media_1790502540499.jpg',
  'media_1790502540538.jpg'
];

for (const file of files) {
  const filePath = path.join(dir, file);
  const buf = fs.readFileSync(filePath);
  console.log(`=== ${file} (${buf.length} bytes) ===`);
  
  // Find JPEG APP markers
  let pos = 2; // Skip SOI 0xFFD8
  while (pos < buf.length - 4) {
    if (buf[pos] === 0xFF) {
      const marker = buf[pos + 1];
      const len = buf.readUInt16BE(pos + 2);
      const name = marker === 0xE0 ? 'APP0 (JFIF)' :
                   marker === 0xE1 ? 'APP1 (EXIF/XMP)' :
                   marker === 0xE2 ? 'APP2 (ICC)' :
                   marker === 0xED ? 'APP13 (IPTC)' :
                   marker === 0xEE ? 'APP14 (Adobe)' :
                   marker === 0xDB ? 'DQT (Quantization Table)' :
                   marker === 0xC0 ? 'SOF0 (Baseline DCT)' :
                   `Marker 0xFF${marker.toString(16).toUpperCase()}`;
      
      console.log(`  Pos ${pos.toString(16)}: ${name} len=${len}`);
      if (marker === 0xE1) {
        const header = buf.slice(pos + 4, pos + 20).toString('ascii').replace(/[^\x20-\x7E]/g, '.');
        console.log(`    APP1 Data header: "${header}"`);
      }
      pos += 2 + len;
      if (marker === 0xDA) break; // Start of Scan
    } else {
      pos++;
    }
  }
}
