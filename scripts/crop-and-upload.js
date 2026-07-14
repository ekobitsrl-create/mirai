import sharp from 'sharp';
import { put } from '@vercel/blob';

const imageUrl = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-4OTB68UX3e6aSzpFLTPSNVWOe6zxOj.png';

const products = [
  // Row 1
  { name: 'tshirt-1691-white.png', col: 0, row: 0 },
  { name: 'tshirt-2009-white.png', col: 1, row: 0 },
  { name: 'tshirt-2009-black.png', col: 2, row: 0 },
  // Row 2
  { name: 'tshirt-1989-antra.png', col: 0, row: 1 },
  { name: 'tshirt-1989-black.png', col: 1, row: 1 },
  { name: 'tshirt-1989-beige.png', col: 2, row: 1 },
];

async function cropAndUpload() {
  const response = await fetch(imageUrl);
  const buffer = Buffer.from(await response.arrayBuffer());
  const metadata = await sharp(buffer).metadata();
  
  console.log(`Image: ${metadata.width}x${metadata.height}`);
  
  const cols = 3;
  const rows = 2;
  const colWidth = Math.floor(metadata.width / cols);
  const rowHeight = Math.floor(metadata.height / rows);
  const cropHeight = Math.floor(rowHeight * 0.55);
  
  console.log(`Col width: ${colWidth}, Row height: ${rowHeight}, Crop height: ${cropHeight}`);
  
  const urls = [];
  
  for (const product of products) {
    const left = product.col * colWidth;
    const top = product.row * rowHeight;
    
    const cropped = await sharp(buffer)
      .extract({ left, top, width: colWidth, height: cropHeight })
      .png()
      .toBuffer();
    
    const blob = await put(`products/${product.name}`, cropped, { access: 'public' });
    console.log(`Uploaded: ${product.name} -> ${blob.url}`);
    urls.push({ name: product.name, url: blob.url });
  }
  
  console.log('\nAll URLs:');
  urls.forEach(u => console.log(`${u.name}: ${u.url}`));
}

cropAndUpload().catch(console.error);
