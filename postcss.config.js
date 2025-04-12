module.exports = {
  plugins: {
    'postcss-import': {},
    'postcss-preset-env': {
      autoprefixer: false,
      features: {
        'custom-properties': false,
      },
      browsers: [],
    },
    'tailwindcss/nesting': {},
    tailwindcss: {},
  },
};
