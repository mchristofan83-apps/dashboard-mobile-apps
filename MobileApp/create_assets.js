const fs = require('fs');
const path = require('path');

// Create a simple white PNG (64x64 white square)
const whitePNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAADUlEQVR42mP8/5+hHoQDAAe9BP+O3l6ZAAAAAElFTkSuQmCC',
  'base64'
);

const assetsDir = path.join(__dirname, 'assets');

// Create assets directory if it doesn't exist
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Write placeholder PNG files
const files = ['icon.png', 'splash.png', 'adaptive-icon.png', 'favicon.png'];
files.forEach(file => {
  fs.writeFileSync(path.join(assetsDir, file), whitePNG);
  console.log(`✓ Created ${file}`);
});
