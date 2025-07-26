export interface Assessment {
  id: string;
  title: string;
  description: string;
  markingCriteria: string;
  instructions: string;
  markingCriteriaFile?: File; // Optional file reference for uploaded marking criteria
  instructionsFile?: File; // Optional file reference for uploaded instructions
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentSubmission {
  id: string;
  assessmentId: string;
  studentName: string;
  fileName: string;
  fileContent: string;
  fileType: string;
  uploadedAt: Date;
  file?: File; // Optional file reference for when we need to access the original file
}

export interface GradingResult {
  id: string;
  submissionId: string;
  studentName: string;
  score: number;
  feedback: string;
  detailedFeedback: string;
  minorAreasForImprovement: string[];
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  gradedAt: Date;
  isReviewed: boolean;
}

export interface FileUpload {
  file: File;
  content: string;
  type: string;
}

export interface AssessmentFileUpload {
  file: File;
  content: string;
  type: 'markingCriteria' | 'instructions';
}

export type SupportedFileType = 'pdf' | 'docx' | 'txt' | 'py' | 'ipynb' | 'md';

 