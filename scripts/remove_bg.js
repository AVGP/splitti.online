const fs = require('fs');
const { PNG } = require('pngjs');

const inputPath = 'src/assets/images/start-avatar.png';
const outputPath = 'src/assets/images/start-avatar.png';

fs.createReadStream(inputPath)
  .pipe(new PNG({ filterType: 4 }))
  .on('parsed', function() {
    const width = this.width;
    const height = this.height;
    const data = this.data;

    // Helper to get pixel index
    function getIdx(x, y) {
      return (y * width + x) * 4;
    }

    // Helper to check if pixel is near-white
    function isNearWhite(x, y) {
      const idx = getIdx(x, y);
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];

      // Consider white/near white if RGB are all > 235 and alpha > 0
      return a > 0 && r > 235 && g > 235 && b > 235;
    }

    const visited = new Uint8Array(width * height);
    const queue = [];

    // Push border pixels that are near-white into queue
    for (let x = 0; x < width; x++) {
      if (isNearWhite(x, 0)) { queue.push(x, 0); visited[0 * width + x] = 1; }
      if (isNearWhite(x, height - 1)) { queue.push(x, height - 1); visited[(height - 1) * width + x] = 1; }
    }
    for (let y = 0; y < height; y++) {
      if (isNearWhite(0, y)) { queue.push(0, y); visited[y * width + 0] = 1; }
      if (isNearWhite(width - 1, y)) { queue.push(width - 1, y); visited[y * width + (width - 1)] = 1; }
    }

    // BFS Flood Fill from edges
    let head = 0;
    while (head < queue.length) {
      const cx = queue[head++];
      const cy = queue[head++];

      const idx = getIdx(cx, cy);
      // Set alpha to 0 (transparent)
      data[idx + 3] = 0;

      // Check 4 neighbors
      const neighbors = [
        [cx + 1, cy],
        [cx - 1, cy],
        [cx, cy + 1],
        [cx, cy - 1]
      ];

      for (const [nx, ny] of neighbors) {
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const nPos = ny * width + nx;
          if (!visited[nPos] && isNearWhite(nx, ny)) {
            visited[nPos] = 1;
            queue.push(nx, ny);
          }
        }
      }
    }

    this.pack().pipe(fs.createWriteStream(outputPath)).on('finish', () => {
      console.log('Successfully removed white background!');
    });
  });
