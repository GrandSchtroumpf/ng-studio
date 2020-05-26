// LOOK HERE : @angular/cli/lib/config/schema.json

export interface NgWorkspace {
  $schema: string;
  version: number;
  newProjectRoot: string;
  projects: Record<string, NgProject>;
  cli: NgCli;
  schematics: Record<string, NgSchematics>;
  defaultProject: string;
}

export interface NgProject {
  root: string;
  sourceRoot: string;
  projectType: 'library' | 'application'
  prefix: string;
  schematics?: Record<string, NgSchematics>;
  architect: Record<string, NgArchitect>;
}

const architects = ['build', 'serve', 'lint', 'test'] as const;

interface NgArchitect {
  builder: string;
  options: NgBuildOptions;
  configurations: Record<string, ArchitectConfig>;
}

/////////////
// OPTIONS //
/////////////

interface NgBuildOptions {
  /** Path to ts config */
  tsConfig: string | string[];
  /** Dist folder of the application */
  outputPath: string;
  /** Exclude files from process */
  exclude: string[];
  /** [Library] Path to package.json / ng-package.json */
  project: string;
  /** [Application] Path to main.ts */
  main: string;
  /** [Application] Path to index.html */
  index: string;
  /** [Application] Path to polyfills */
  polyfills: string;
  /** [Application] Path for all assets */
  assets: (string | AssetOptions)[];
  /** [Application] Path for all external styles files */
  styles: (string | EntryPointOptions)[];
  /** [Application] Path for all external scripts files */
  scripts: (string | EntryPointOptions)[];
  /** [Application] List of external dependancies */
  externalDependencies: string[];
  /** [Application] Should use aot */
  aot: boolean;
  /** reference to the browser target definition */
  browserTarget: string;
  /** [Application] Creates base url for sass/stylus import */
  stylePreprocessorOptions: {
    includePaths: string[];
  }
  /** [Applicat.test] Should process pass with no test */
  passWithNoTests: boolean;
  /** ???? */
  buildLibsFromSource: boolean;
}

interface CypressOptions {
  /** [Cypress] Base url of the process: exemple http://localhost:4200 */
  baseUrl: string; 
  /** [Cypress] Path of the Cypress config */
  cypressConfig: string;
}

interface JestOptions {
  /** [Jest] Config for Jest */
  jestConfig: string;
  /** [Jest] Path to jest setup-file */
  setupFile: string
}

interface AssetOptions {
  /** A node-glob using input as base directory. See: https://github.com/isaacs/node-glob/blob/master/README.md */
  glob: string;
  /** A path relative to the workspace root. */
  input: string;
  /** A path relative to outDir  */
  output: string;
  /** A list of globs to exclude. */
  ignore: string[];
}

/** Will load that file and its dependencies as a separate bundle  */
interface EntryPointOptions {
  input: string;
  /** Set to false to exclude bundle from injection */
  inject?: boolean;
  /** Name of the bundle file created */
  bundleName?: string;
}

///////////////////
// CONFIGURATION //
///////////////////
interface ArchitectConfig {
  fileReplacements: FileReplacement[];
  optimization: boolean | { script: boolean, styles: boolean };
  outputHashing: 'none' | 'all' | 'media' | 'bundles';
  sourceMap: boolean | { scripts?: boolean, styles?: boolean, hidden?: boolean, vendor?: boolean };
  extractCss: boolean;
  namedChunks: boolean;
  extractLicenses: boolean;
  vendorChunk: boolean;
  buildOptimizer: boolean;
  budgets: Budget[];
  serviceWorker: boolean;
  ngswConfigPath: string;
}

interface FileReplacement {
  replace: string;
  with: string;
}

interface Budget {
  /** See https://angular.io/guide/build#configure-size-budgets */
  type: 'bundle ' | 'initial' | 'allScript ' | 'all ' | 'anyComponentStyle' | 'anyScript' | 'any ';
  /** The name of the bundle (for type=bundle). */
  name?: string;
  /** The baseline size for comparison. */
  baseline?: string;
  /** The maximum threshold for warning relative to the baseline */
  maximumWarning?: string;
  /** The maximum threshold for error relative to the baseline. */
  maximumError?: string;
  /** The minimum threshold for warning relative to the baseline. */
  minimumWarning?: string;
  /** The minimum threshold for error relative to the baseline. */
  minimumError?: string;
  /** The threshold for warning relative to the baseline (min & max). */
  warning: { min: string, max: string };
  /** The threshold for error relative to the baseline (min & max). */
  error: { min: string, max: string };
}



interface NgCli {
  warnings: {
    typescriptMismatch: boolean;
    versionMismatch: boolean;
  }
  defaultCollection: string;
  analytics: string;
}

interface NgSchematics {
  unitTestRunner: string;
  e2eTestRunner: string;
  framework: string;
}