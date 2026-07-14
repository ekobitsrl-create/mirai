import fs from 'fs';
import path from 'path';
import { put } from '@vercel/blob';

const inputDir = '/home/user/cropped-images';

const files = [
  { filename: 'tshirt-black-island-2002-black.png', productName: 'Black Island Cherub T-Shirt 2002 - Black' },
  { filename: 'tshirt-black-island-2003-white.png', productName: 'Black Island Boxer T-Shirt 2003 - White' },
  { filename: 'tshirt-black-island-2003-antra.png', productName: 'Black Island Boxer T-Shirt 2003 - Antra' },
  { filename: 'tshirt-black-island-cherub-white.png', productName: 'Black Island Cherub T-Shirt - White' },
  { filename: 'tshirt-black-island-cherub-brown.png', productName: 'Black Island Cherub T-Shirt - Brown' },
  { filename: 'tshirt-black-island-cherub-beige.png', productName: 'Black Island Cherub T-Shirt - Beige' }
];

async function uploadFiles() {
  const results = [];
  
  for (const { filename, productName } of files) {
    const filePath = path.join(inputDir, filename);
    
    if (fs.existsSync(filePath)) {
      try {
        const buffer = fs.readFileSync(filePath);
        
        const blob = await put(`products/${filename}`, buffer, {
          access: 'public',
          contentType: 'image/png'
        });
        
        console.log(`Uploaded ${filename}`);
        console.log(`URL: ${blob.url}`);
        
        results.push({
          productName,
          filename,
          url: blob.url
        });
      } catch (error) {
        console.error(`Error uploading ${filename}:`, error.message);
      }
    } else {
      console.log(`File not found: ${filePath}`);
    }
  }
  
  console.log('\n=== Upload Results ===');
  console.log(JSON.stringify(results, null, 2));
  
  console.log('\n=== SQL to update products ===');
  for (const result of results) {
    console.log(`UPDATE products SET image_url = '${result.url}' WHERE name = '${result.productName}';`);
  }
}

uploadFiles();
