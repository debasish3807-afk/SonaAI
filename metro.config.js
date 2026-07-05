const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Fix pnpm module resolution for expo-modules-core and similar packages
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Ensure node_modules from pnpm are resolved correctly
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
];

// Disable server-side rendering to avoid expo-modules-core SSR issues
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = config;
