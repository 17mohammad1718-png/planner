const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// allow expo-sqlite's web WASM bundle to resolve
config.resolver = {
  ...config.resolver,
  assetExts: [...(config.resolver.assetExts || []), 'wasm'],
};

module.exports = withNativeWind(config, { input: './global.css' });
