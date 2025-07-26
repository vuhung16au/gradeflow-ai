declare module 'pdfjs-dist/build/pdf.worker.entry' {
  const workerSrc: string;
  export default workerSrc;
}

declare module 'pdfjs-dist/build/pdf' {
  export interface PDFDocumentProxy {
    numPages: number;
    getPage(pageNumber: number): Promise<PDFPageProxy>;
  }

  export interface PDFPageProxy {
    getTextContent(): Promise<TextContent>;
  }

  export interface TextContent {
    items: Array<{ str: string }>;
  }

  export function getDocument(params: { data: ArrayBuffer }): { promise: Promise<PDFDocumentProxy> };
  
  export const GlobalWorkerOptions: {
    workerSrc: string;
  };
} 