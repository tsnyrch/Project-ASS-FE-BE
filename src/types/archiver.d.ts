declare module "archiver" {
  import { Transform } from "stream";

  interface ArchiverOptions {
    zlib?: {
      level?: number;
    };
  }

  interface Archiver extends Transform {
    pipe(destination: NodeJS.WritableStream): NodeJS.WritableStream;
    append(source: NodeJS.ReadableStream, name: { name: string }): this;
    finalize(): Promise<void>;
    on(event: string, listener: (...args: any[]) => void): this;
  }

  function archiver(format: string, options?: ArchiverOptions): Archiver;

  export = archiver;
}
