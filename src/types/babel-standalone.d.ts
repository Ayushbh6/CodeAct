declare module '@babel/standalone' {
  export interface TransformOptions {
    presets?: string[];
    plugins?: any[];
    filename?: string;
    sourceType?: 'script' | 'module' | 'unambiguous';
  }

  export interface TransformResult {
    code: string;
    map?: any;
    ast?: any;
  }

  export function transform(code: string, options?: TransformOptions): TransformResult;
  export function transformFromAst(ast: any, code: string, options?: TransformOptions): TransformResult;
  export function registerPreset(name: string, preset: any): void;
  export function registerPlugin(name: string, plugin: any): void;
}