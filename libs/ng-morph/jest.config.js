module.exports = {
  name: 'ng-morph',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/libs/ng-morph',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js'
  ]
};
