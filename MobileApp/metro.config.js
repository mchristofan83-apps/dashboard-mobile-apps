const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for additional file extensions
config.resolver.assetExts.push(...[
  // Image formats
  'png', 'jpg', 'jpeg', 'gif', 'bmp', 'ico', 'webp',
  // Audio formats
  'mp3', 'wav', 'ogg', 'aac', 'flac',
  // Video formats
  'mp4', 'mov', 'avi', 'mkv',
  // Font formats
  'ttf', 'otf', 'woff', 'woff2',
  // Document formats
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'
]);

// Configure source extensions
config.resolver.sourceExts.push('jsx', 'js', 'ts', 'tsx', 'json');

// Enable transform for all modules
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

module.exports = config;
