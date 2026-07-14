import fs from 'fs';
import path from 'path';
import { put } from '@vercel/blob';

const inputDir = '/home/user/cropped-images';

const files = [
  'tshirt-black-island-2002-black.png',
  'tshirt-black-island-2003-white.png',
  'tshirt-black-island-2003-antra.png',
  'tshirt-black-island-cherub-white.png',
  'tshirt-black-island-cherub-brown.png',
  'tshirt-black-island-cherub-beige.png'
];

async function uploadFiles() {
  for (const filename of files) {
    const filePath = path.join(inputDir, filename);
    
    if (fs.existsSync(filePath)) {
      const buffer = fs.readFileSync(filePath);
      const base64 = buffer.toString('base64');
      
      console.log(`\n=== ${filename} ===`);
      console.log(`data:image/png;base64,${base64.substring(0, 100)}...`);
      console.log(`Full base64 length: ${base64.length} chars`);
      
      // Output as data URL for use in v0 Write tool
      console.log(`\nDATA_URL_${filename.replace(/[-.]/g, '_').toUpperCase()}:`);
      console.log(`data:image/png;base64,${base64}`);
    } else {
      console.log(`File not found: ${filePath}`);
    }
  }
}

uploadFiles();
