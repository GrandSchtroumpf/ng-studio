import {
  readConfiguration,
  ParsedConfiguration,
  MetadataCollector
} from '@angular/compiler-cli';
import { createCompilerHost, createProgram, Program } from 'typescript';
import { TsCompilerAotCompilerTypeCheckHostAdapter } from '@angular/compiler-cli/src/transformers/compiler_host';
import {
  AotCompiler,
  createOfflineCompileUrlResolver,
  StaticSymbolCache,
  AotSummaryResolver,
  StaticSymbolResolver,
  StaticReflector,
  HtmlParser,
  CompilerConfig,
  PipeResolver,
  DirectiveResolver,
  DirectiveNormalizer,
  DomElementSchemaRegistry,
  CompileMetadataResolver,
  NgModuleResolver,
  ViewCompiler,
  StyleCompiler,
  Parser,
  Lexer,
  TemplateParser,
  NgModuleCompiler,
  TypeScriptEmitter,
  StaticSymbol,
  CompileNgModuleMetadata,
  NgAnalyzedModules,
  analyzeNgModules
} from '@angular/compiler';
import { ViewEncapsulation } from '@angular/compiler/src/core';
import { TypeCheckCompiler } from '@angular/compiler/src/view_compiler/type_check_compiler';
import { InjectableCompiler } from '@angular/compiler/src/injectable_compiler';
import { ModuleSymbol, ResourceResolver, ProjectSymbols } from 'ngast';
import { promises as fs, readFileSync } from 'fs';


export const resourceResolver: ResourceResolver = {
  get(url: string) {
    return fs.readFile(url, 'utf-8');
  },
  getSync(url: string) {
    return readFileSync(url).toString();
  }
};

const defaultErrorReporter = (e: any, path: string) => console.error(e, path);

export class ProjectSymbol {
  private symbol;
  private config: ParsedConfiguration;
  private program: Program;
  private staticResolverHost: TsCompilerAotCompilerTypeCheckHostAdapter;

  staticSymbolResolver: StaticSymbolResolver;
  metadataResolver: CompileMetadataResolver;

  private analyzedModules: NgAnalyzedModules;
  constructor(private tsconfigPath: string) {
    // this.config = readConfiguration(tsconfigPath);
  }

  init() {
    if (!this.symbol) {
      console.log(this.tsconfigPath);
      this.symbol = new ProjectSymbols(this.tsconfigPath, resourceResolver, defaultErrorReporter);
    }
    return;


    if (this.program) {
      return;
    }
    let compiler: AotCompiler;
    const { options, rootNames } = this.config;
    // On Windows, different slashes cause errors while trying to compare module symbols
    rootNames.forEach(root => root.replace(/\\/g, '/'));
    const compilerHost = createCompilerHost(options, true);
    const collector = new MetadataCollector();

    this.staticResolverHost = new TsCompilerAotCompilerTypeCheckHostAdapter(
      rootNames,
      options,
      compilerHost,
      collector,
      {
        generateFile: (genFileName, baseFileName) => {
          return compiler.emitBasicStub(genFileName, baseFileName);
        },
        findGeneratedFileNames: fileName => {
          return compiler.findGeneratedFileNames(fileName);
        }
      }
    );

    const urlResolver = createOfflineCompileUrlResolver();
    const symbolCache = new StaticSymbolCache();
    const summaryResolver = new AotSummaryResolver(
      this.staticResolverHost,
      symbolCache
    );
    this.staticSymbolResolver = new StaticSymbolResolver(
      this.staticResolverHost,
      symbolCache,
      summaryResolver
    );
    const reflector = new StaticReflector(
      summaryResolver,
      this.staticSymbolResolver,
      [],
      []
    );
    const htmlParser = new HtmlParser();
    const config = new CompilerConfig({
      defaultEncapsulation: ViewEncapsulation.Emulated,
      useJit: false
    });
    const pipeResolver = new PipeResolver(reflector);
    const directiveResolver = new DirectiveResolver(reflector);
    const directiveNormalizer = new DirectiveNormalizer(
      {
        get: url => {
          return this.staticResolverHost.loadResource(url);
        }
      },
      urlResolver,
      htmlParser,
      config
    );
    const registry = new DomElementSchemaRegistry();
    this.metadataResolver = new CompileMetadataResolver(
      config,
      htmlParser,
      new NgModuleResolver(reflector),
      directiveResolver,
      pipeResolver,
      summaryResolver,
      registry,
      directiveNormalizer,
      console,
      symbolCache,
      reflector
    );

    const viewCompiler = new ViewCompiler(reflector);
    const typeCheckCompiler = new TypeCheckCompiler(options, reflector);
    const expressionParser = new Parser(new Lexer());
    const tmplParser = new TemplateParser(
      config,
      reflector,
      expressionParser,
      registry,
      htmlParser,
      console,
      []
    );


    const styleCompiler = new StyleCompiler(urlResolver);
    const ngModuleCompiler = new NgModuleCompiler(reflector);
    const injectorCompiler = new InjectableCompiler(reflector, !!options.enableIvy);

    const tsEmitter = new TypeScriptEmitter();

    compiler = new AotCompiler(
      config,
      options,
      this.staticResolverHost,
      reflector,
      this.metadataResolver,
      tmplParser,
      styleCompiler,
      viewCompiler,
      typeCheckCompiler,
      ngModuleCompiler,
      injectorCompiler,
      tsEmitter,
      summaryResolver,
      this.staticSymbolResolver
    );

    this.program = createProgram({
      rootNames,
      options: options,
      host: this.staticResolverHost
    });
  }


  /**
   * Returns the metadata associated to this module.
   *
   * @returns {ModuleSymbol[]}
   *
   * @memberOf ProjectSymbols
   */
  getModules(): ModuleSymbol[] {
    if (this.symbol) {
      return this.symbol.getModules();
    }
    return [];
  }



  /** @internal */
  getAnalyzedModules(): NgAnalyzedModules {
    let analyzedModules = this.analyzedModules;
    if (!analyzedModules) {
      const analyzeHost = {
        isSourceFile(filePath: string) {
          return true;
        }
      };

      // The root filenames may not contain a module itself, but only reference one (f.e. main.ts)
      const filenames = this.program.getSourceFiles().map(sf => sf.fileName);
      analyzedModules = this.analyzedModules = analyzeNgModules(
        filenames,
        analyzeHost,
        this.staticSymbolResolver,
        this.metadataResolver
      );
    }
    return analyzedModules;
  }

}
