module.exports = function (api) {
  api.cache(true);

  // Determine which env file to use based on NODE_ENV
  const envFile =
    process.env.NODE_ENV === 'production'
      ? '.env.production'
      : process.env.NODE_ENV === 'development'
        ? '.env.development'
        : '.env';

  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module:react-native-dotenv',
        {
          moduleName: '@env',
          path: envFile,
          blacklist: null,
          whitelist: null,
          safe: false,
          allowUndefined: true,
          verbose: false,
        },
      ],
    ],
  };
};