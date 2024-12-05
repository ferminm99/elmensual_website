declare module "compressorjs" {
  export default class Compressor {
    constructor(
      file: File,
      options?: {
        quality?: number;
        maxWidth?: number;
        maxHeight?: number;
        mimeType?: string;
        convertSize?: number;
        success?: (result: Blob) => void;
        error?: (err: Error) => void;
      }
    );
  }
}
