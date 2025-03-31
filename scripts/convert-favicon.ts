
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function convertFaviconToPng() {
  const svgPath = path.join(__dirname, '../public/favicon.svg');
  const pngPath = path.join(__dirname, '../public/favicon.png');
  
  try {
    if (!fs.existsSync(svgPath)) {
      console.error('Error: favicon.svg not found at:', svgPath);
      return;
    }
    
    const svgBuffer = fs.readFileSync(svgPath);
    
    await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toFile(pngPath);
    
    console.log('Favicon successfully converted to PNG!');
  } catch (error) {
    console.error('Error converting favicon to PNG:', error);
    console.error('Full error:', error.stack);
  }
}

convertFaviconToPng();
