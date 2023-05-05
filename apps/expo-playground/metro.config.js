module.exports = {
  resolver: {
    extraNodeModules: {
      buffer: require.resolve('@craftzdog/react-native-buffer'),
      crypto: require.resolve('crypto-browserify'),
      http: require.resolve('@tradle/react-native-http'),
      https: require.resolve('https-browserify'),
      os: require.resolve('os-browserify/browser'),
      stream: require.resolve('stream-browserify'),
      fs: require.resolve('react-native-level-fs'),
      path: require.resolve('path-browserify'),
      _stream_transform: 'readable-stream/transform',
      _stream_readable: 'readable-stream/readable',
      _stream_writable: 'readable-stream/writable',
      _stream_duplex: 'readable-stream/duplex',
      _stream_passthrough: 'readable-stream/passthrough',
    },
  },
};
