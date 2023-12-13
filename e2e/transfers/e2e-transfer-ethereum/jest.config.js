module.exports = {
    transform: {
        '^.+\\.ts?$': 'ts-jest'
    },
    testEnvironment: 'node',
    testRegex: '/e2e/.*\\.(test|spec)?\\.(ts)$',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node']
};

