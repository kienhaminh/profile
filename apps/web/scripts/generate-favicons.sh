#!/bin/bash

# Generate favicons from SVG source
# Uses: rsvg-convert (librsvg) and ImageMagick

SOURCE_SVG="../public/favicon.svg"
OUTPUT_DIR="../public"

echo "🎨 Generating favicons from SVG..."
echo ""

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

cd "$(dirname "$0")"

# Check if we have required tools
if ! command -v rsvg-convert &> /dev/null && ! command -v convert &> /dev/null; then
    echo "❌ Error: Neither rsvg-convert nor ImageMagick convert found"
    echo ""
    echo "Please install one of the following:"
    echo "  - librsvg: brew install librsvg (macOS)"
    echo "  - ImageMagick: brew install imagemagick (macOS)"
    exit 1
fi

# Generate PNG files at different sizes
echo "📸 Generating PNG files..."

SIZES=(16 32 48 64 96 128 192 256 512)

for SIZE in "${SIZES[@]}"; do
    if command -v rsvg-convert &> /dev/null; then
        rsvg-convert -w $SIZE -h $SIZE "$SOURCE_SVG" > "$OUTPUT_DIR/favicon-${SIZE}x${SIZE}.png"
    else
        convert -background none -resize ${SIZE}x${SIZE} "$SOURCE_SVG" "$OUTPUT_DIR/favicon-${SIZE}x${SIZE}.png"
    fi
    echo "  ✓ Generated ${SIZE}x${SIZE} PNG"
done

# Generate Apple Touch Icon
echo ""
echo "🍎 Generating Apple Touch Icon..."
if command -v rsvg-convert &> /dev/null; then
    rsvg-convert -w 180 -h 180 "$SOURCE_SVG" > "$OUTPUT_DIR/apple-touch-icon.png"
else
    convert -background none -resize 180x180 "$SOURCE_SVG" "$OUTPUT_DIR/apple-touch-icon.png"
fi
echo "  ✓ Generated apple-touch-icon.png (180x180)"

# Generate Android Chrome icons
echo ""
echo "🤖 Generating Android Chrome icons..."
for SIZE in 192 512; do
    if command -v rsvg-convert &> /dev/null; then
        rsvg-convert -w $SIZE -h $SIZE "$SOURCE_SVG" > "$OUTPUT_DIR/android-chrome-${SIZE}x${SIZE}.png"
    else
        convert -background none -resize ${SIZE}x${SIZE} "$SOURCE_SVG" "$OUTPUT_DIR/android-chrome-${SIZE}x${SIZE}.png"
    fi
    echo "  ✓ Generated android-chrome-${SIZE}x${SIZE}.png"
done

# Generate multi-size ICO file
echo ""
echo "🎯 Generating multi-size ICO file..."
if command -v convert &> /dev/null; then
    convert "$OUTPUT_DIR/favicon-16x16.png" \
            "$OUTPUT_DIR/favicon-32x32.png" \
            "$OUTPUT_DIR/favicon-48x48.png" \
            "$OUTPUT_DIR/favicon.ico"
    echo "  ✓ Generated favicon.ico (16x16, 32x32, 48x48)"
else
    echo "  ⚠️  ImageMagick required for ICO generation"
    echo "     Install: brew install imagemagick"
    echo "     Or use: https://convertio.co/svg-ico/"
fi

echo ""
echo "✅ Favicon generation complete!"
echo ""
echo "Generated files:"
echo "  - favicon-{16,32,48,64,96,128,192,256,512}x{size}.png"
echo "  - apple-touch-icon.png (180x180)"
echo "  - android-chrome-{192,512}x{size}.png"
if command -v convert &> /dev/null; then
    echo "  - favicon.ico (multi-size)"
fi
