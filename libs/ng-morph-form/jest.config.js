module.exports = {
  name: 'ng-morph-form',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/libs/ng-morph-form',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js'
  ]
};
