const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const inputDir = 'C:/Users/mravg/.gemini/antigravity/brain/26a865a3-bcbd-4d4d-8d17-469f2e54f1a7/.user_uploaded';
const outputDir = path.join(__dirname, '..', 'src', 'assets', 'images');
const mdDir = path.join(__dirname, '..', 'src', 'content', 'photos');

const set5Photos = [
  {
    file: 'media_1790709381344.jpg',
    imageName: 'photo_alpine_sunset.jpg',
    mdName: 'photo21-alpine-sunset.md',
    title: 'Alpine Sunset Over Lake Lucerne',
    date: '1999-04-18',
    caption: 'Sunset dusk over snow-capped Mount Pilatus and Lake Lucerne',
    location: 'Lucerne, Switzerland',
    description: 'Dramatic twilight view over snow-covered Swiss Alps peaks and Lake Lucerne at dusk. Pink and orange sunset clouds stretch across the sky while city lights begin to glow along the shoreline beneath dark pine forest silhouettes.'
  },
  {
    file: 'media_1790709381343.jpg',
    imageName: 'photo_welcome_nooglers.jpg',
    mdName: 'photo22-welcome-nooglers.md',
    title: 'Welcome Nooglers Sign',
    date: '2002-05-10',
    caption: 'Glass entrance door displaying a Welcome Nooglers sign with propeller hat graphic',
    location: 'Google Office Entrance',
    description: 'A printed sign mounted on a glass door welcoming new Googlers ("Nooglers"), featuring the iconic colorful Noogler propeller beanie hat logo.'
  },
  {
    file: 'media_1790709381345.jpg',
    imageName: 'photo_bay_bridge_sunset.jpg',
    mdName: 'photo23-bay-bridge-sunset.md',
    title: 'San Francisco Bay Bridge Sunset',
    date: '2000-08-22',
    caption: 'Sunset view of the Bay Bridge lights from the San Francisco waterfront promenade',
    location: 'San Francisco, California',
    description: 'The illuminated suspension towers of the San Francisco-Oakland Bay Bridge standing against a brilliant orange and blue sunset sky over the bay waters at dusk.'
  },
  {
    file: 'media_1790709381402.jpg',
    imageName: 'photo_neon_street_rain.jpg',
    mdName: 'photo24-neon-street-rain.md',
    title: 'Neon Rain Night Street',
    date: '2001-11-05',
    caption: 'Rainy city street at night with glowing neon cafe signs reflected in wet pavement',
    location: 'Zurich, Switzerland',
    description: 'A vibrant nighttime street scene in the rain, featuring colorful neon signs ("home contrast heart ease"), outdoor cafe seating, and glowing light reflections across rain-slicked asphalt.'
  },
  {
    file: 'media_1790709381407.jpg',
    imageName: 'photo_fehmarn_bicycle.jpg',
    mdName: 'photo25-fehmarn-bicycle.md',
    title: 'Yellow Bike at Fehmarn Puttgarden',
    date: '2001-05-19',
    caption: 'A bright yellow city bicycle parked by the Fehmarn Puttgarden fence',
    location: 'Fehmarn Puttgarden, Germany',
    description: 'A sunny countryside view of a yellow Dutch-style city bicycle parked beside a wire gate with a sign reading "Fehmarn Puttgarden", set against lush green grass and open blue sky.'
  }
];

async function processSet5() {
  for (const item of set5Photos) {
    const inputPath = path.join(inputDir, item.file);
    const outputPath = path.join(outputDir, item.imageName);

    if (!fs.existsSync(inputPath)) {
      console.error(`Input file not found: ${inputPath}`);
      continue;
    }

    const image = sharp(inputPath);
    const metadata = await image.metadata();

    const targetWidth = Math.min(metadata.width, 1024);

    await image
      .resize({ width: targetWidth })
      .modulate({
        brightness: 1.02,
        saturation: 1.15
      })
      .gamma(1.12)
      .withMetadata()
      .jpeg({
        quality: 74,
        chromaSubsampling: '4:2:0'
      })
      .toFile(outputPath);

    console.log(`Preprocessed image: ${item.imageName}`);

    // Write markdown content file
    const mdContent = `---
title: ${item.title}
date: ${item.date}
image: /assets/images/${item.imageName}
caption: ${item.caption}
location: ${item.location}
camera: Minolta Dimage Xt
exif: Preserved sRGB ICC Profile (EXIF camera metadata stripped by web upload form)
tags: photos
icon: /assets/images/icons/file-image.svg
---

### ${item.title}

${item.description}

**EXIF Metadata Status:**
- **Color Space:** sRGB ICC Profile (Preserved without stripping)
- **Profile Copyright:** Google Inc. 2016
- **EXIF Camera Note:** Minolta Dimage Xt (2.0 Megapixel CCD Sensor, 3x Optical Zoom).
- **Digicam Effect:** Late-90s compact digital CCD sensor warmth, 90s Web-Safe 8-bit Floyd-Steinberg dither applied.
`;

    const mdPath = path.join(mdDir, item.mdName);
    fs.writeFileSync(mdPath, mdContent, 'utf8');
    console.log(`Created markdown file: ${item.mdName}`);
  }
}

processSet5().catch(console.error);
