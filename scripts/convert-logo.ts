import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file path and directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function convertSvgToPng() {
  const svgPath = path.join(__dirname, '../public/ksrtc-logo.svg');
  const pngPath = path.join(__dirname, '../public/ksrtc-logo.png');
  
  try {
    const svgBuffer = fs.readFileSync(svgPath);
    
    await sharp(svgBuffer)
      .resize(200, 200)
      .png()
      .toFile(pngPath);
    
    console.log('SVG successfully converted to PNG!');
  } catch (error) {
    console.error('Error converting SVG to PNG:', error);
  }
}

// Execute the conversion
convertSvgToPng();