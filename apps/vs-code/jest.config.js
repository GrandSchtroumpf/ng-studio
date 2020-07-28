module.exports = {
  name: 'vs-code',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/apps/vs-code',
  globals: { 'ts-jest': { tsConfig: '<rootDir>/tsconfig.spec.json' } },
};
