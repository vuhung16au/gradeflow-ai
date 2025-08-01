import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Assessment, StudentSubmission } from '../types';
import { isSupportedFile, formatFileSize } from '../utils/fileUtils';
import { CloudArrowUpIcon, DocumentIcon, XMarkIcon } from '@heroicons/react/24/outline';
import ReactMarkdown from 'react-markdown';

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
  const [showAssessmentDetail, setShowAssessmentDetail] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle accepted files
    const validFiles = acceptedFiles.filter(file => isSupportedFile(file.name) || file.name.toLowerCase().endsWith('.zip'));
    
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
    
    // --- FOLDER UPLOAD HANDLING ---
    // If any file has webkitRelativePath, group by top-level folder
    const hasFolder = validFiles.some(file => (file as any).webkitRelativePath && (file as any).webkitRelativePath !== '');
    if (hasFolder) {
      // Group files by top-level folder
      const folderGroups: { [folder: string]: File[] } = {};
      validFiles.forEach(file => {
        const relPath = (file as any).webkitRelativePath;
        if (relPath && relPath !== '') {
          const topFolder = relPath.split('/')[0];
          if (!folderGroups[topFolder]) folderGroups[topFolder] = [];
          folderGroups[topFolder].push(file);
        } else {
          // Files not in a folder (shouldn't happen in folder upload, but just in case)
          if (!folderGroups['__root__']) folderGroups['__root__'] = [];
          folderGroups['__root__'].push(file);
        }
      });
      // Call onFileUpload for each folder group
      Object.values(folderGroups).forEach(group => {
        if (group.length > 0) {
          onFileUpload(group);
        }
      });
    } else {
      // Process files for upload as before
      if (validFiles.length > 0) {
        onFileUpload(validFiles);
      }
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
      'text/markdown': ['.md'],
      'application/zip': ['.zip'],
    },
    maxSize: 30 * 1024 * 1024, // 30MB
  });



  const clearErrors = () => {
    setUploadErrors([]);
  };

  return (
    <div className="space-y-6">
      {/* Assessment Info (clickable, above label) */}
      <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded-md p-4 cursor-pointer hover:shadow transition" onClick={() => setShowAssessmentDetail(true)}>
        <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">{assessment.title}</h3>
        <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">{assessment.description}</p>
        <p className="text-xs text-blue-600 dark:text-blue-300 mt-2 underline">View Details</p>
      </div>

      {/* Modal for Assessment Detail */}
      {showAssessmentDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg w-4/5 max-h-[80vh] p-6 relative overflow-hidden">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              onClick={() => setShowAssessmentDetail(false)}
              aria-label="Close"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Assessment Details</h2>
            <div className="space-y-6 overflow-y-auto max-h-[calc(80vh-120px)] pr-2">
              <div>
                <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-2">Title</h3>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown>{assessment.title}</ReactMarkdown>
                </div>
              </div>
              <div>
                <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-2">Description</h3>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown>{assessment.description}</ReactMarkdown>
                </div>
              </div>
              <div>
                <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-2">Marking Criteria</h3>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown>{assessment.markingCriteria}</ReactMarkdown>
                </div>
              </div>
              <div>
                <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-2">Instructions for Students</h3>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown>{assessment.instructions}</ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Submissions Label */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Upload Submissions</h2>
        {/* (Assessment info moved above) */}
      </div>

      {/* File Upload Area */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-blue-400 bg-blue-50 dark:bg-blue-900 dark:border-blue-700'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-300" />
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-200">
            {isDragActive
              ? 'Drop the files here...'
              : 'Drag and drop files here, or click to select files'}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-300">
            Supported formats: PDF, DOCX, TXT, Python (.py), Jupyter Notebook (.ipynb), Markdown (.md), ZIP (.zip)
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-300">Maximum file size: 30MB</p>
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
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Uploaded Submissions ({submissions.length})
              </h3>
              <button
                onClick={onDeleteAllSubmissions}
                className="inline-flex items-center px-3 py-1 border border-red-300 dark:border-red-700 text-sm font-medium rounded-md text-red-700 dark:text-red-300 bg-white dark:bg-gray-900 hover:bg-red-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete All
              </button>
            </div>
          </div>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {submissions.map((submission) => (
              <li key={submission.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col w-full">
                    <div className="flex items-center mb-2">
                      <DocumentIcon className="h-5 w-5 text-gray-400 dark:text-gray-300 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Submission by: {submission.studentName || 'Unknown'}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-400">
                          Uploaded: {submission.uploadedAt.toLocaleString()}
                        </p>
                      </div>
                      {/* Status Badge */}
                      <span className={`ml-4 px-2 py-0.5 rounded-full text-xs font-semibold ${submission.status === 'Graded' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}>
                        {submission.status}
                      </span>
                    </div>
                    <ul className="ml-8 mt-1 space-y-1">
                      {submission.files.map((file, idx) => (
                        <li key={idx} className="flex items-center">
                          <span className="text-xs text-gray-700 dark:text-gray-200 mr-2">{file.fileName}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">{file.file && formatFileSize(file.file.size)}</span>
                          <span className="text-xs text-gray-400 dark:text-gray-400">Uploaded: {file.uploadedAt.toLocaleString()}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button
                    onClick={() => onDeleteSubmission(submission.id)}
                    className="text-red-400 dark:text-red-300 hover:text-red-600 dark:hover:text-red-400"
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

      {/* Ready to Grade Section */}
      {submissions.length > 0 && (
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 shadow rounded-lg px-6 py-4 mt-6">
          <div className="text-sm text-gray-700 dark:text-gray-200">
            Ready to Grade<br />
            <span className="font-semibold">{submissions.length} submission{submissions.length > 1 ? 's' : ''} uploaded</span>
          </div>
          <button
            onClick={onStartGrading}
            disabled={isGrading || submissions.every(sub => sub.status === 'Graded')}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${submissions.every(sub => sub.status === 'Graded') ? 'bg-gray-400 cursor-pointer hover:bg-gray-500' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            {isGrading ? 'Grading...' : submissions.every(sub => sub.status === 'Graded') ? 'Show Results' : 'Start Grading'}
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUpload; 