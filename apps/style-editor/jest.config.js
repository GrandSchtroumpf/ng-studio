module.exports = {
  name: 'style-editor',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/apps/style-editor',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js',
  ],
};
