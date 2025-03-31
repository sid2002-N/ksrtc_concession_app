declare module 'blob-stream' {
  interface BlobStream {
    on(event: string, callback: (...args: any[]) => void): this;
    end(): void;
    pipe(destination: any): any;
    toBlob(): Blob;
    toBlobURL(): string;
  }

  function blobStream(): BlobStream;
  export = blobStream;
}