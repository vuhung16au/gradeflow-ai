import React, { useState } from 'react';
import { Assessment, GradingResult } from '../types';
import { DocumentArrowDownIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface GradingResultsProps {
  results: GradingResult[];
  assessment: Assessment | null;
  onUpdateResult: (resultId: string, updates: Partial<GradingResult>) => void;
  onDownloadResults: () => void;
}

const GradingResults: React.FC<GradingResultsProps> = ({
  results,
  assessment,
  onUpdateResult,
  onDownloadResults,
}) => {
  const [expandedResult, setExpandedResult] = useState<string | null>(null);
  const [editingResult, setEditingResult] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<GradingResult>>({});

  const handleEdit = (result: GradingResult) => {
    setEditingResult(result.id);
    setEditData({
      score: result.score,
      feedback: result.feedback,
      detailedFeedback: result.detailedFeedback,
      minorAreasForImprovement: result.minorAreasForImprovement,
      strengths: result.strengths,
      weaknesses: result.weaknesses,
      suggestions: result.suggestions,
    });
  };

  const handleSave = (resultId: string) => {
    onUpdateResult(resultId, editData);
    setEditingResult(null);
    setEditData({});
  };

  const handleCancel = () => {
    setEditingResult(null);
    setEditData({});
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreGrade = (score: number) => {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  };

  const averageScore = results.length > 0 
    ? Math.round(results.reduce((sum, result) => sum + result.score, 0) / results.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Grading Results</h2>
            {assessment && (
              <p className="text-sm text-gray-500 mt-1">{assessment.title}</p>
            )}
          </div>
          <button
            onClick={onDownloadResults}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
            Download Results
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-blue-600">Total Submissions</p>
            <p className="text-2xl font-bold text-blue-900">{results.length}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-green-600">Average Score</p>
            <p className="text-2xl font-bold text-green-900">{averageScore}%</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-yellow-600">Reviewed</p>
            <p className="text-2xl font-bold text-yellow-900">
              {results.filter(r => r.isReviewed).length}
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-purple-600">Pending Review</p>
            <p className="text-2xl font-bold text-purple-900">
              {results.filter(r => !r.isReviewed).length}
            </p>
          </div>
        </div>
      </div>

      {/* Results List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Individual Results</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {results.map((result) => (
            <div key={result.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <h4 className="text-lg font-medium text-gray-900">
                    {result.studentName}
                  </h4>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getScoreColor(result.score)}`}>
                    {result.score}% ({getScoreGrade(result.score)})
                  </span>
                  {result.isReviewed && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckIcon className="h-3 w-3 mr-1" />
                      Reviewed
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setExpandedResult(expandedResult === result.id ? null : result.id)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {expandedResult === result.id ? 'Hide Details' : 'Show Details'}
                  </button>
                  <button
                    onClick={() => handleEdit(result)}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    Edit
                  </button>
                </div>
              </div>

              {expandedResult === result.id && (
                <div className="mt-4 space-y-4">
                  {editingResult === result.id ? (
                    // Edit Mode
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Score</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={editData.score || 0}
                          onChange={(e) => setEditData(prev => ({ ...prev, score: parseInt(e.target.value) || 0 }))}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Feedback</label>
                        <textarea
                          value={editData.feedback || ''}
                          onChange={(e) => setEditData(prev => ({ ...prev, feedback: e.target.value }))}
                          rows={4}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Detailed Feedback</label>
                        <textarea
                          value={editData.detailedFeedback || ''}
                          onChange={(e) => setEditData(prev => ({ ...prev, detailedFeedback: e.target.value }))}
                          rows={6}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Minor Areas for Improvement (one per line)</label>
                        <textarea
                          value={editData.minorAreasForImprovement?.join('\n') || ''}
                          onChange={(e) => setEditData(prev => ({ 
                            ...prev, 
                            minorAreasForImprovement: e.target.value.split('\n').filter(line => line.trim()) 
                          }))}
                          rows={3}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleSave(result.id)}
                          className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancel}
                          className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div className="space-y-4">
                      <div>
                        <h5 className="text-sm font-medium text-gray-700">Feedback</h5>
                        <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{result.feedback}</p>
                      </div>
                      
                      {result.detailedFeedback && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-700">**Detailed Feedback:**</h5>
                          <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{result.detailedFeedback}</p>
                        </div>
                      )}
                      
                      {result.minorAreasForImprovement.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium text-orange-700">**Minor Area for Improvement:**</h5>
                          <ul className="mt-1 space-y-1">
                            {result.minorAreasForImprovement.map((area, index) => (
                              <li key={index} className="text-sm text-orange-600">
                                • {area}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {result.strengths.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium text-green-700">Strengths</h5>
                          <ul className="mt-1 space-y-1">
                            {result.strengths.map((strength, index) => (
                              <li key={index} className="text-sm text-green-600 flex items-start">
                                <CheckIcon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                                {strength}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {result.weaknesses.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium text-red-700">Areas for Improvement</h5>
                          <ul className="mt-1 space-y-1">
                            {result.weaknesses.map((weakness, index) => (
                              <li key={index} className="text-sm text-red-600 flex items-start">
                                <XMarkIcon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                                {weakness}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {result.suggestions.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium text-blue-700">Suggestions</h5>
                          <ul className="mt-1 space-y-1">
                            {result.suggestions.map((suggestion, index) => (
                              <li key={index} className="text-sm text-blue-600">
                                • {suggestion}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-500">
                        Graded on: {result.gradedAt instanceof Date ? result.gradedAt.toLocaleString() : new Date(result.gradedAt).toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GradingResults; 