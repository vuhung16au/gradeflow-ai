import { SupportedFileType, FileUpload, AssessmentFileUpload } from '../types';
import { GlobalWorkerOptions } from 'pdfjs-dist/build/pdf';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';

export const SUPPORTED_FILE_TYPES: Record<SupportedFileType, string[]> = {
  pdf: ['.pdf'],
  docx: ['.docx'],
  txt: ['.txt'],
  py: ['.py'],
  ipynb: ['.ipynb'],
  md: ['.md'],
};

export const getFileType = (fileName: string): SupportedFileType | null => {
  const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
  
  for (const [type, extensions] of Object.entries(SUPPORTED_FILE_TYPES)) {
    if (extensions.includes(extension)) {
      return type as SupportedFileType;
    }
  }
  
  return null;
};

export const isSupportedFile = (fileName: string): boolean => {
  return getFileType(fileName) !== null;
};

export const readFileAsText = async (file: File): Promise<string> => {
  const fileType = getFileType(file.name);
  
  // Handle PDF files specially
  if (fileType === 'pdf') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        try {
          const arrayBuffer = event.target?.result as ArrayBuffer;
          if (!arrayBuffer) {
            reject(new Error('Failed to read PDF file'));
            return;
          }
          // Use pdfjs-dist to extract text from PDF
          const pdfjsLib = await import('pdfjs-dist/build/pdf');
          // Set the workerSrc for pdfjs-dist to the local bundle
          GlobalWorkerOptions.workerSrc = pdfjsWorker;
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          let text = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            // Type assertion for content.items
            text += (content.items as { str: string }[]).map(item => item.str).join(' ') + '\n';
          }
          resolve(text);
        } catch (error) {
          reject(new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read PDF file'));
      };
      
      reader.readAsArrayBuffer(file);
    });
  }
  
  // Handle other text-based files
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        resolve(result);
      } else {
        reject(new Error('Failed to read file as text'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
};

export const extractStudentNameFromFileName = (fileName: string): string => {
  // Remove file extension
  const nameWithoutExtension = fileName.substring(0, fileName.lastIndexOf('.'));
  
  // Try to extract student name from common patterns
  const patterns = [
    /^([a-zA-Z\s]+)_/, // name_rest
    /^([a-zA-Z\s]+)-/, // name-rest
    /^([a-zA-Z\s]+)\s/, // name rest
    /^([a-zA-Z\s]+)$/, // just name
  ];
  
  for (const pattern of patterns) {
    const match = nameWithoutExtension.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  // Fallback: return the filename without extension
  return nameWithoutExtension;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const validateFile = (file: File): { isValid: boolean; error?: string } => {
  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size exceeds maximum limit of ${formatFileSize(maxSize)}`
    };
  }
  
  // Check file type
  if (!isSupportedFile(file.name)) {
    return {
      isValid: false,
      error: `Unsupported file type. Supported types: ${Object.values(SUPPORTED_FILE_TYPES).flat().join(', ')}`
    };
  }
  
  return { isValid: true };
};

export const processFileUpload = async (file: File): Promise<FileUpload> => {
  const validation = validateFile(file);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }
  
  const content = await readFileAsText(file);
  const type = getFileType(file.name) || 'txt';
  
  return {
    file,
    content,
    type,
  };
};

export const processAssessmentFileUpload = async (file: File, type: 'markingCriteria' | 'instructions'): Promise<AssessmentFileUpload> => {
  const validation = validateFile(file);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }
  
  const content = await readFileAsText(file);
  
  return {
    file,
    content,
    type,
  };
}; 

export function cleanFeedbackText(text: string): string {
  if (!text) return '';
  
  // Remove markdown code blocks
  let cleaned = text.replace(/```json\s*([\s\S]*?)\s*```/g, '$1');
  cleaned = cleaned.replace(/```\s*([\s\S]*?)\s*```/g, '$1');
  
  // Remove JSON formatting if it's just a JSON string
  if (cleaned.trim().startsWith('{') && cleaned.trim().endsWith('}')) {
    try {
      const parsed = JSON.parse(cleaned);
      // If it's a valid JSON object, extract the feedback field if it exists
      if (parsed.feedback) {
        return parsed.feedback;
      }
      if (parsed.detailedFeedback) {
        return parsed.detailedFeedback;
      }
    } catch (e) {
      // If JSON parsing fails, return the cleaned text as-is
    }
  }
  
  return cleaned.trim();
} 