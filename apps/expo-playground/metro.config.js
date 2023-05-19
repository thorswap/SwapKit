const { FileStore } = require('metro-cache');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

module.exports = {
  watchFolders: [workspaceRoot],
  cacheStores: [new FileStore({ root: path.join(projectRoot, 'node_modules', '.cache', 'metro') })],
  resolver: {
    disableHierarchicalLookup: false,
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
    resolveRequest: (context, moduleName, platform) => {
      const isParentLocal = moduleName.startsWith('../');
      const isLocal = moduleName.startsWith('./');

      if ((isParentLocal || isLocal) && moduleName.endsWith('.js')) {
        const originPath = path.dirname(context.originModulePath);
        const [, ...moduleWithExt] = moduleName.split('/');
        const folderPath = isParentLocal
          ? originPath.split('/').slice(0, -1).join('/')
          : originPath;

        return {
          type: 'sourceFile',
          filePath: `${folderPath}/${moduleWithExt.join('/').slice(0, -3)}.ts`,
        };
      }

      return context.resolveRequest(context, moduleName, platform);
    },
  },
};
