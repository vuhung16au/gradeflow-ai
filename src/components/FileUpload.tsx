import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Assessment, StudentSubmission } from '../types';
import { isSupportedFile, formatFileSize } from '../utils/fileUtils';
import { CloudArrowUpIcon, DocumentIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface FileUploadProps {
  assessment: Assessment;
  submissions: StudentSubmission[];
  onFileUpload: (files: File[]) => void;
  onDeleteSubmission: (submissionId: string) => void;
  onDeleteAllSubmissions: () => void;
  onStartGrading: () => void;
  isGrading: boolean;
  geminiConnected: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  assessment,
  submissions,
  onFileUpload,
  onDeleteSubmission,
  onDeleteAllSubmissions,
  onStartGrading,
  isGrading,
  geminiConnected,
}) => {
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle accepted files
    const validFiles = acceptedFiles.filter(file => isSupportedFile(file.name));
    
    // Handle rejected files
    const errors = rejectedFiles.map(({ file, errors }) => {
      const errorMessages = errors.map((error: any) => {
        if (error.code === 'file-invalid-type') {
          return `${file.name}: Unsupported file type`;
        }
        if (error.code === 'file-too-large') {
          return `${file.name}: File too large`;
        }
        return `${file.name}: ${error.message}`;
      });
      return errorMessages.join(', ');
    });
    
    setUploadErrors(prev => [...prev, ...errors]);
    
    // Process files for upload
    if (validFiles.length > 0) {
      onFileUpload(validFiles);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'text/x-python': ['.py'],
      'application/x-ipynb+json': ['.ipynb'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  });



  const clearErrors = () => {
    setUploadErrors([]);
  };

  return (
    <div className="space-y-6">
      {/* Assessment Info */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Upload Submissions</h2>
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h3 className="text-sm font-medium text-blue-900">{assessment.title}</h3>
          <p className="text-sm text-blue-700 mt-1">{assessment.description}</p>
        </div>
      </div>

      {/* File Upload Area */}
      <div className="bg-white shadow rounded-lg p-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            {isDragActive
              ? 'Drop the files here...'
              : 'Drag and drop files here, or click to select files'}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Supported formats: PDF, DOCX, TXT, Python (.py), Jupyter Notebook (.ipynb)
          </p>
          <p className="mt-1 text-xs text-gray-500">Maximum file size: 10MB</p>
        </div>
      </div>

      {/* Upload Errors */}
      {uploadErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">Upload Errors</h3>
              <ul className="mt-2 text-sm text-red-700 space-y-1">
                {uploadErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
            <button
              onClick={clearErrors}
              className="ml-4 text-red-400 hover:text-red-600"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Uploaded Submissions */}
      {submissions.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Uploaded Submissions ({submissions.length})
              </h3>
              <button
                onClick={onDeleteAllSubmissions}
                className="inline-flex items-center px-3 py-1 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete All
              </button>
            </div>
          </div>
          <ul className="divide-y divide-gray-200">
            {submissions.map((submission) => (
              <li key={submission.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <DocumentIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{submission.fileName}</p>
                      <p className="text-sm text-gray-500">
                        {submission.file && formatFileSize(submission.file.size)}
                      </p>
                      <p className="text-xs text-gray-400">
                        Uploaded: {submission.uploadedAt.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onDeleteSubmission(submission.id)}
                    className="text-red-400 hover:text-red-600"
                    title="Delete submission"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Grading Button */}
      {submissions.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Ready to Grade
              </h3>
              <p className="text-sm text-gray-500">
                {submissions.length} submission{submissions.length !== 1 ? 's' : ''} uploaded
              </p>
            </div>
            <button
              onClick={onStartGrading}
              disabled={isGrading || !geminiConnected}
              className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isGrading || !geminiConnected
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
              }`}
            >
              {isGrading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Grading...
                </>
              ) : (
                'Start Grading'
              )}
            </button>
          </div>
          {!geminiConnected && (
            <p className="mt-2 text-sm text-red-600">
              Cannot start grading: Gemini API is not connected
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUpload; 