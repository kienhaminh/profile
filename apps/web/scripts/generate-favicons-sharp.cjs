#!/usr/bin/env node

/**
 * Generate all favicon formats for SEO best practices
 * Uses: sharp library for image processing
 * Install: npm install --save-dev sharp to-ico
 */

const fs = require('fs');
const path = require('path');

async function generateFavicons() {
  console.log('🎨 Generating favicons for optimal SEO...\n');

  try {
    // Check for sharp
    let sharp;
    try {
      sharp = require('sharp');
    } catch (e) {
      console.error('❌ sharp not installed. Installing now...');
      require('child_process').execSync('npm install --save-dev sharp', { stdio: 'inherit' });
      sharp = require('sharp');
    }

    const SOURCE_SVG = path.join(__dirname, '../public/favicon.svg');
    const OUTPUT_DIR = path.join(__dirname, '../public');

    if (!fs.existsSync(SOURCE_SVG)) {
      throw new Error(`Source SVG not found: ${SOURCE_SVG}`);
    }

    const svgBuffer = fs.readFileSync(SOURCE_SVG);

    // Favicon sizes for SEO and platform support
    const sizes = {
      // Standard favicons
      standard: [16, 32, 48],
      // Additional PNG sizes for various uses
      extended: [64, 96, 128, 180, 192, 256, 512],
    };

    // 1. Generate standard favicon PNGs
    console.log('📸 Generating standard favicon PNGs...');
    for (const size of sizes.standard) {
      await sharp(svgBuffer)
        .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toFile(path.join(OUTPUT_DIR, `favicon-${size}x${size}.png`));
      console.log(`  ✓ favicon-${size}x${size}.png`);
    }

    // 2. Generate extended sizes
    console.log('\n📱 Generating platform-specific icons...');

    // Apple Touch Icon (180x180 is standard)
    await sharp(svgBuffer)
      .resize(180, 180, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(path.join(OUTPUT_DIR, 'apple-touch-icon.png'));
    console.log('  ✓ apple-touch-icon.png (180x180)');

    // Android Chrome icons
    for (const size of [192, 512]) {
      await sharp(svgBuffer)
        .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toFile(path.join(OUTPUT_DIR, `android-chrome-${size}x${size}.png`));
      console.log(`  ✓ android-chrome-${size}x${size}.png`);
    }

    // Additional sizes for comprehensive coverage
    for (const size of [64, 96, 128, 256]) {
      await sharp(svgBuffer)
        .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toFile(path.join(OUTPUT_DIR, `favicon-${size}x${size}.png`));
      console.log(`  ✓ favicon-${size}x${size}.png`);
    }

    // 3. Generate ICO file (multi-size)
    console.log('\n🎯 Generating favicon.ico...');
    try {
      const toIco = require('to-ico');

      const icoFiles = await Promise.all([
        sharp(svgBuffer).resize(16, 16, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer(),
        sharp(svgBuffer).resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer(),
        sharp(svgBuffer).resize(48, 48, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer(),
      ]);

      const ico = await toIco(icoFiles);
      fs.writeFileSync(path.join(OUTPUT_DIR, 'favicon.ico'), ico);
      console.log('  ✓ favicon.ico (16x16, 32x32, 48x48)');
    } catch (e) {
      console.log('  ⚠️  to-ico not installed. Installing...');
      require('child_process').execSync('npm install --save-dev to-ico', { stdio: 'inherit' });
      const toIco = require('to-ico');

      const icoFiles = await Promise.all([
        sharp(svgBuffer).resize(16, 16, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer(),
        sharp(svgBuffer).resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer(),
        sharp(svgBuffer).resize(48, 48, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer(),
      ]);

      const ico = await toIco(icoFiles);
      fs.writeFileSync(path.join(OUTPUT_DIR, 'favicon.ico'), ico);
      console.log('  ✓ favicon.ico (16x16, 32x32, 48x48)');
    }

    console.log('\n✅ All favicons generated successfully!');
    console.log('\nGenerated files:');
    console.log('  📄 favicon.svg (original, modern browsers)');
    console.log('  📄 favicon.ico (multi-size: 16x16, 32x32, 48x48)');
    console.log('  📄 favicon-{16,32,48,64,96,128,256}x{size}.png');
    console.log('  📄 apple-touch-icon.png (180x180)');
    console.log('  📄 android-chrome-{192,512}x{size}.png');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

generateFavicons();
