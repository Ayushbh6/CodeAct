declare module '@babel/standalone' {
  export interface TransformOptions {
    presets?: string[];
    plugins?: unknown[];
    filename?: string;
    sourceType?: 'script' | 'module' | 'unambiguous';
  }

  export interface TransformResult {
    code: string;
    map?: unknown;
    ast?: unknown;
  }

  export function transform(code: string, options?: TransformOptions): TransformResult;
  export function transformFromAst(ast: unknown, code: string, options?: TransformOptions): TransformResult;
  export function registerPreset(name: string, preset: unknown): void;
  export function registerPlugin(name: string, plugin: unknown): void;
}