#!/usr/bin/env node

/**
 * Generate favicons from SVG source
 * Requires: sharp library
 * Usage: node scripts/generate-favicons.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SOURCE_SVG = path.join(__dirname, '../public/favicon.svg');
const OUTPUT_DIR = path.join(__dirname, '../public');

// Favicon sizes for different platforms
const SIZES = {
  ico: [16, 32, 48], // For .ico file
  png: [16, 32, 48, 64, 96, 128, 192, 256, 512], // For various uses
  apple: [180], // Apple touch icon
  android: [192, 512], // Android icons
};

async function generateFavicons() {
  console.log('🎨 Generating favicons from SVG...\n');

  try {
    // Check if source SVG exists
    if (!fs.existsSync(SOURCE_SVG)) {
      throw new Error(`Source SVG not found: ${SOURCE_SVG}`);
    }

    // Read SVG
    const svgBuffer = fs.readFileSync(SOURCE_SVG);

    // Generate PNG files
    console.log('📸 Generating PNG files...');
    for (const size of SIZES.png) {
      const outputPath = path.join(OUTPUT_DIR, `favicon-${size}x${size}.png`);

      await sharp(svgBuffer)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toFile(outputPath);

      console.log(`  ✓ Generated ${size}x${size} PNG`);
    }

    // Generate Apple Touch Icon (180x180 with padding)
    console.log('\n🍎 Generating Apple Touch Icon...');
    const appleTouchPath = path.join(OUTPUT_DIR, 'apple-touch-icon.png');
    await sharp(svgBuffer)
      .resize(180, 180, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(appleTouchPath);
    console.log('  ✓ Generated apple-touch-icon.png (180x180)');

    // Generate Android icons
    console.log('\n🤖 Generating Android Chrome icons...');
    for (const size of SIZES.android) {
      const outputPath = path.join(OUTPUT_DIR, `android-chrome-${size}x${size}.png`);

      await sharp(svgBuffer)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toFile(outputPath);

      console.log(`  ✓ Generated android-chrome-${size}x${size}.png`);
    }

    // Note about ICO generation
    console.log('\n💡 ICO Generation Note:');
    console.log('   Multi-size ICO files require special libraries.');
    console.log('   Recommended: Use online tool like https://realfavicongenerator.net');
    console.log('   Or install: npm install --save-dev to-ico');
    console.log('   Then generate 16x16, 32x32, 48x48 combined ICO file');

    console.log('\n✅ Favicon generation complete!');
    console.log('\nGenerated files:');
    console.log('  - favicon-{16,32,48,64,96,128,192,256,512}x{size}.png');
    console.log('  - apple-touch-icon.png');
    console.log('  - android-chrome-{192,512}x{size}.png');

  } catch (error) {
    console.error('❌ Error generating favicons:', error.message);
    process.exit(1);
  }
}

// Run the script
generateFavicons();
