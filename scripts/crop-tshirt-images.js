import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Blob URLs for the source images
const BOXER_URL = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-5oLJzmLHIfcLl8jGEkZfbkr1HlXmCF.png';
const CHERUB_URL = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-FSxlKGxwYey6xnkpb6ct5mix5PfGV1.png';

// Use home directory for output (accessible for writing)
const outputDir = '/home/user/cropped-images';

async function downloadAndCrop(url, outputConfigs, imageSetName) {
  console.log(`Processing ${imageSetName}...`);
  console.log(`Downloading from: ${url}`);
  
  try {
    // Download the image
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download: ${response.status}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    console.log(`Downloaded ${buffer.length} bytes`);
    
    // Get image metadata
    const metadata = await sharp(buffer).metadata();
    const width = metadata.width;
    const height = metadata.height;
    
    console.log(`Image dimensions: ${width}x${height}`);
    
    // Calculate crop dimensions - only the model photos (top ~65% of image)
    const photoHeight = Math.floor(height * 0.65);
    const sectionWidth = Math.floor(width / 3);
    
    console.log(`Each section: ${sectionWidth}x${photoHeight}`);
    
    // Crop each section
    for (let i = 0; i < outputConfigs.length; i++) {
      const config = outputConfigs[i];
      const left = i === 2 ? sectionWidth * 2 : sectionWidth * i;
      const cropWidth = i === 2 ? width - (sectionWidth * 2) : sectionWidth;
      
      const croppedBuffer = await sharp(buffer)
        .extract({ left, top: 0, width: cropWidth, height: photoHeight })
        .png()
        .toBuffer();
      
      // Save to accessible directory
      fs.writeFileSync(path.join(outputDir, config.filename), croppedBuffer);
      
      // Also output base64 for easy copying
      console.log(`\n=== ${config.filename} ===`);
      console.log(`File saved to: ${path.join(outputDir, config.filename)}`);
      console.log(`Size: ${croppedBuffer.length} bytes`);
    }
    
    console.log(`${imageSetName} cropped successfully!`);
  } catch (error) {
    console.error(`Error processing ${imageSetName}:`, error);
  }
}

async function main() {
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Crop boxer t-shirt images (model 2002/2003)
  await downloadAndCrop(BOXER_URL, [
    { filename: 'tshirt-black-island-2002-black.png' },
    { filename: 'tshirt-black-island-2003-white.png' },
    { filename: 'tshirt-black-island-2003-antra.png' }
  ], 'Boxer T-Shirts');
  
  // Crop cherub t-shirt images
  await downloadAndCrop(CHERUB_URL, [
    { filename: 'tshirt-black-island-cherub-white.png' },
    { filename: 'tshirt-black-island-cherub-brown.png' },
    { filename: 'tshirt-black-island-cherub-beige.png' }
  ], 'Cherub T-Shirts');
  
  console.log('All images processed!');
}

main();
