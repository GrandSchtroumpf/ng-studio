module.exports = {
  name: 'sandbox',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/libs/sandbox',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js'
  ]
};
