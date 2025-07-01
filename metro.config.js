const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure the app directory is included
config.watchFolders = [__dirname];
config.resolver.nodeModulesPaths = [__dirname];

module.exports = config;
