import React, { useState } from 'react';
import { Assessment } from '../types';
import { PlusIcon, DocumentTextIcon, DocumentArrowUpIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { processAssessmentFileUpload } from '../utils/fileUtils';

interface AssessmentFormProps {
  assessments: Assessment[];
  onCreateAssessment: (assessment: Omit<Assessment, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onSelectAssessment: (assessment: Assessment) => void;
  currentAssessment: Assessment | null;
}

const AssessmentForm: React.FC<AssessmentFormProps> = ({
  assessments,
  onCreateAssessment,
  onSelectAssessment,
  currentAssessment,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    markingCriteria: '',
    instructions: '',
  });
  const [markingCriteriaFile, setMarkingCriteriaFile] = useState<File | null>(null);
  const [instructionsFile, setInstructionsFile] = useState<File | null>(null);
  const [uploadErrors, setUploadErrors] = useState<{ markingCriteria?: string; instructions?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateAssessment({
      ...formData,
      markingCriteriaFile: markingCriteriaFile || undefined,
      instructionsFile: instructionsFile || undefined,
    });
    setFormData({ title: '', description: '', markingCriteria: '', instructions: '' });
    setMarkingCriteriaFile(null);
    setInstructionsFile(null);
    setUploadErrors({});
    setShowForm(false);
  };

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleFileUpload = async (file: File, type: 'markingCriteria' | 'instructions') => {
    try {
      setUploadErrors(prev => ({ ...prev, [type]: undefined }));
      
      const result = await processAssessmentFileUpload(file, type);
      
      if (type === 'markingCriteria') {
        setMarkingCriteriaFile(file);
        setFormData(prev => ({ ...prev, markingCriteria: result.content }));
      } else {
        setInstructionsFile(file);
        setFormData(prev => ({ ...prev, instructions: result.content }));
      }
    } catch (error) {
      setUploadErrors(prev => ({ 
        ...prev, 
        [type]: error instanceof Error ? error.message : 'Failed to upload file' 
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'markingCriteria' | 'instructions') => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file, type);
    }
  };

  const removeFile = (type: 'markingCriteria' | 'instructions') => {
    if (type === 'markingCriteria') {
      setMarkingCriteriaFile(null);
      setFormData(prev => ({ ...prev, markingCriteria: '' }));
    } else {
      setInstructionsFile(null);
      setFormData(prev => ({ ...prev, instructions: '' }));
    }
    setUploadErrors(prev => ({ ...prev, [type]: undefined }));
  };

  const FileUploadSection = ({ 
    type, 
    label, 
    file, 
    error, 
    onFileChange, 
    onRemoveFile 
  }: {
    type: 'markingCriteria' | 'instructions';
    label: string;
    file: File | null;
    error?: string;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemoveFile: () => void;
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      
      {!file ? (
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
          <div className="space-y-1 text-center">
            <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
            <div className="flex text-sm text-gray-600">
              <label
                htmlFor={`file-upload-${type}`}
                className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
              >
                <span>Upload a file</span>
                <input
                  id={`file-upload-${type}`}
                  name={`file-upload-${type}`}
                  type="file"
                  className="sr-only"
                  accept=".txt,.md,.pdf,.docx"
                  onChange={onFileChange}
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">
              TXT, MD, PDF, DOCX up to 10MB
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-1 flex items-center justify-between p-3 border border-gray-300 rounded-md bg-gray-50">
          <div className="flex items-center">
            <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-sm text-gray-700">{file.name}</span>
          </div>
          <button
            type="button"
            onClick={onRemoveFile}
            className="text-red-500 hover:text-red-700"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Create New Assessment */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Assessments</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            New Assessment
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-4 border-t pt-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Assessment Title
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={handleInputChange('title')}
                required
                className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                placeholder="e.g., ITEC203 Assessment Test 1"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={handleInputChange('description')}
                required
                rows={3}
                className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                placeholder="Brief description of the assessment"
              />
            </div>

            <div>
              <label htmlFor="markingCriteria" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Marking Criteria
              </label>
              <textarea
                id="markingCriteria"
                value={formData.markingCriteria}
                onChange={handleInputChange('markingCriteria')}
                required
                rows={6}
                className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                placeholder="Detailed marking criteria and rubrics..."
              />
              
              <div className="mt-2">
                <FileUploadSection
                  type="markingCriteria"
                  label="Or upload marking criteria file:"
                  file={markingCriteriaFile}
                  error={uploadErrors.markingCriteria}
                  onFileChange={(e) => handleFileChange(e, 'markingCriteria')}
                  onRemoveFile={() => removeFile('markingCriteria')}
                />
              </div>
            </div>

            <div>
              <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Instructions for Students
              </label>
              <textarea
                id="instructions"
                value={formData.instructions}
                onChange={handleInputChange('instructions')}
                required
                rows={4}
                className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                placeholder="Instructions that were given to students..."
              />
              
              <div className="mt-2">
                <FileUploadSection
                  type="instructions"
                  label="Or upload instructions file:"
                  file={instructionsFile}
                  error={uploadErrors.instructions}
                  onFileChange={(e) => handleFileChange(e, 'instructions')}
                  onRemoveFile={() => removeFile('instructions')}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Create Assessment
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Assessment List */}
      {assessments.length > 0 && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Your Assessments</h3>
          </div>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {assessments.map((assessment) => (
              <li key={assessment.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <DocumentTextIcon className="h-5 w-5 text-gray-400 dark:text-gray-300 mr-3" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">{assessment.title}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-300">{assessment.description}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-400">
                        Created: {assessment.createdAt instanceof Date ? assessment.createdAt.toLocaleDateString() : new Date(assessment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {currentAssessment?.id === assessment.id && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100">
                        Active
                      </span>
                    )}
                    <button
                      onClick={() => onSelectAssessment(assessment)}
                      className="px-3 py-1 text-sm font-medium text-blue-700 dark:text-blue-100 bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-800 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Select
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {assessments.length === 0 && !showForm && (
        <div className="text-center py-12">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-300" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No assessments</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
            Get started by creating your first assessment.
          </p>
        </div>
      )}
    </div>
  );
};

export default AssessmentForm; 