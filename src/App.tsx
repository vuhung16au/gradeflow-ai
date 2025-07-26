import React, { useState, useEffect } from 'react';
import { Assessment, StudentSubmission, GradingResult } from './types';
import { CookieService } from './services/cookieService';
import { GeminiService } from './services/geminiService';
import { cleanFeedbackText } from './utils/fileUtils';
import Header from './components/Header';
import AssessmentForm from './components/AssessmentForm';
import FileUpload from './components/FileUpload';
import GradingResults from './components/GradingResults';
import ConnectionStatus from './components/ConnectionStatus';

function App() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [currentAssessment, setCurrentAssessment] = useState<Assessment | null>(null);
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [gradingResults, setGradingResults] = useState<GradingResult[]>([]);
  const [isGrading, setIsGrading] = useState(false);
  const [geminiConnected, setGeminiConnected] = useState(false);
  const [activeTab, setActiveTab] = useState<'assessments' | 'upload' | 'grading'>('assessments');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    // Default to dark mode
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'light' ? 'light' : 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    // Load assessments from cookies
    const savedAssessments = CookieService.getAssessments();
    setAssessments(savedAssessments);
    
    // Load current assessment
    const savedCurrentAssessment = CookieService.getCurrentAssessment();
    setCurrentAssessment(savedCurrentAssessment);
    
    // Check Gemini connection
    checkGeminiConnection();
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const checkGeminiConnection = async () => {
    const connected = await GeminiService.checkGeminiConnection();
    setGeminiConnected(connected);
  };

  const handleCreateAssessment = (assessment: Omit<Assessment, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newAssessment: Assessment = {
      ...assessment,
      id: `assessment_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const updatedAssessments = [...assessments, newAssessment];
    setAssessments(updatedAssessments);
    CookieService.saveAssessments(updatedAssessments);
    
    setCurrentAssessment(newAssessment);
    CookieService.setCurrentAssessment(newAssessment);
    
    setActiveTab('upload');
  };

  const handleSelectAssessment = (assessment: Assessment) => {
    setCurrentAssessment(assessment);
    CookieService.setCurrentAssessment(assessment);
    setActiveTab('upload');
  };

  const handleFileUpload = (files: File[]) => {
    if (!files || files.length === 0) return;
    const now = new Date();
    const newSubmission: StudentSubmission = {
      id: `submission_${Date.now()}`,
      assessmentId: currentAssessment?.id || '',
      studentName: files[0].name.replace(/\.[^/.]+$/, ''), // Use first file's name as studentName (can be improved)
      files: files.map(file => ({
        fileName: file.name,
        fileContent: '', // Will be populated when file is read
        fileType: file.name.split('.').pop() || 'txt',
        uploadedAt: now,
        file: file,
      })),
      uploadedAt: now,
    };
    setSubmissions(prev => [...prev, newSubmission]);
  };

  const handleDeleteSubmission = (submissionId: string) => {
    setSubmissions(prev => prev.filter(submission => submission.id !== submissionId));
  };

  const handleDeleteAllSubmissions = () => {
    setSubmissions([]);
  };

  const handleStartGrading = async () => {
    if (!currentAssessment || submissions.length === 0) {
      alert('Please select an assessment and upload submissions first.');
      return;
    }

    setIsGrading(true);
    const results: GradingResult[] = [];

    try {
      for (const submission of submissions) {
        // Read file contents for all files in the submission
        for (const fileObj of submission.files) {
          if (!fileObj.fileContent && fileObj.file) {
            try {
              const { readFileAsText } = await import('./utils/fileUtils');
              const content = await readFileAsText(fileObj.file);
              fileObj.fileContent = content;
            } catch (error) {
              console.error(`Failed to read file ${fileObj.fileName}:`, error);
              fileObj.fileContent = `Error reading file: ${error instanceof Error ? error.message : 'Unknown error'}`;
            }
          }
        }

        // Optionally, combine all file contents for grading
        // You may want to pass all files, or just combine their contents
        const combinedSubmission = {
          ...submission,
          combinedFileContent: submission.files.map(f => `--- ${f.fileName} ---\n${f.fileContent}`).join('\n\n'),
        };

        const result = await GeminiService.gradeSubmission(currentAssessment, combinedSubmission);
        results.push(result);
      }

      setGradingResults(results);
      setActiveTab('grading');
    } catch (error) {
      console.error('Grading failed:', error);
      alert('Grading failed. Please check your Gemini API key and try again.');
    } finally {
      setIsGrading(false);
    }
  };

  const handleUpdateGradingResult = (resultId: string, updates: Partial<GradingResult>) => {
    setGradingResults(prev => 
      prev.map(result => 
        result.id === resultId 
          ? { ...result, ...updates, isReviewed: true }
          : result
      )
    );
  };

  const handleDeleteGradingResult = (resultId: string) => {
    setGradingResults(prev => prev.filter(result => result.id !== resultId));
  };

  const handleDeleteAllGradingResults = () => {
    setGradingResults([]);
  };

  const handleDownloadResults = () => {
    // Generate Markdown content
    const markdownContent = generateMarkdownReport(gradingResults, currentAssessment);
    const dataBlob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `grading_results_${currentAssessment?.title || 'assessment'}_${new Date().toISOString().split('T')[0]}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const generateMarkdownReport = (results: GradingResult[], assessment: Assessment | null): string => {
    const date = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString();
    
    let markdown = `# Grading Results Report\n\n`;
    markdown += `**Generated on:** ${date} at ${time}\n\n`;
    
    if (assessment) {
      markdown += `## Assessment Information\n\n`;
      markdown += `**Title:** ${assessment.title}\n\n`;
      markdown += `**Description:** ${assessment.description}\n\n`;
      markdown += `**Instructions:** ${assessment.instructions}\n\n`;
      markdown += `**Marking Criteria:** ${assessment.markingCriteria}\n\n`;
    }
    
    // Summary Statistics
    const totalSubmissions = results.length;
    const averageScore = totalSubmissions > 0 
      ? Math.round(results.reduce((sum, result) => sum + result.score, 0) / totalSubmissions)
      : 0;
    const reviewedCount = results.filter(r => r.isReviewed).length;
    const pendingCount = totalSubmissions - reviewedCount;
    
    markdown += `## Summary Statistics\n\n`;
    markdown += `| Metric | Value |\n`;
    markdown += `|--------|-------|\n`;
    markdown += `| Total Submissions | ${totalSubmissions} |\n`;
    markdown += `| Average Score | ${averageScore}% |\n`;
    markdown += `| Reviewed | ${reviewedCount} |\n`;
    markdown += `| Pending Review | ${pendingCount} |\n\n`;
    
    // Score Distribution
    const scoreRanges = {
      'A+ (90-100)': results.filter(r => r.score >= 90).length,
      'A (80-89)': results.filter(r => r.score >= 80 && r.score < 90).length,
      'B (70-79)': results.filter(r => r.score >= 70 && r.score < 80).length,
      'C (60-69)': results.filter(r => r.score >= 60 && r.score < 70).length,
      'D (50-59)': results.filter(r => r.score >= 50 && r.score < 60).length,
      'F (0-49)': results.filter(r => r.score < 50).length,
    };
    
    markdown += `## Score Distribution\n\n`;
    markdown += `| Grade Range | Count |\n`;
    markdown += `|-------------|-------|\n`;
    Object.entries(scoreRanges).forEach(([range, count]) => {
      markdown += `| ${range} | ${count} |\n`;
    });
    markdown += `\n`;
    
    // Individual Results
    markdown += `## Individual Results\n\n`;
    
    results.forEach((result, index) => {
      const grade = getGradeFromScore(result.score);
      const reviewedStatus = result.isReviewed ? '✅ Reviewed' : '⏳ Pending';
      
      markdown += `### ${index + 1}. ${result.studentName}\n\n`;
      markdown += `**Score:** ${result.score}% (${grade})\n\n`;
      markdown += `**Status:** ${reviewedStatus}\n\n`;
      markdown += `**Graded on:** ${result.gradedAt instanceof Date ? result.gradedAt.toLocaleString() : new Date(result.gradedAt).toLocaleString()}\n\n`;
      
      if (result.feedback) {
        markdown += `#### Feedback\n\n${cleanFeedbackText(result.feedback)}\n\n`;
      }
      
      if (result.detailedFeedback) {
        markdown += `#### **Detailed Feedback:**\n\n${cleanFeedbackText(result.detailedFeedback)}\n\n`;
      }
      
      if (result.minorAreasForImprovement.length > 0) {
        markdown += `#### **Minor Area for Improvement:**\n\n`;
        result.minorAreasForImprovement.forEach(area => {
          markdown += `- ${area}\n`;
        });
        markdown += `\n`;
      }
      
      if (result.strengths.length > 0) {
        markdown += `#### Strengths\n\n`;
        result.strengths.forEach(strength => {
          markdown += `- ✅ ${strength}\n`;
        });
        markdown += `\n`;
      }
      
      if (result.weaknesses.length > 0) {
        markdown += `#### Areas for Improvement\n\n`;
        result.weaknesses.forEach(weakness => {
          markdown += `- ❌ ${weakness}\n`;
        });
        markdown += `\n`;
      }
      
      if (result.suggestions.length > 0) {
        markdown += `#### Suggestions\n\n`;
        result.suggestions.forEach(suggestion => {
          markdown += `- 💡 ${suggestion}\n`;
        });
        markdown += `\n`;
      }
      
      markdown += `---\n\n`;
    });
    
    return markdown;
  };

  const getGradeFromScore = (score: number): string => {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  };

  // Delete a single assessment
  const handleDeleteAssessment = (assessmentId: string) => {
    const updatedAssessments = assessments.filter(a => a.id !== assessmentId);
    setAssessments(updatedAssessments);
    CookieService.saveAssessments(updatedAssessments);
    // If the deleted assessment was the current one, clear it
    if (currentAssessment?.id === assessmentId) {
      setCurrentAssessment(null);
      CookieService.setCurrentAssessment(null);
    }
  };

  // Delete all assessments
  const handleDeleteAllAssessments = () => {
    setAssessments([]);
    CookieService.deleteAllAssessments();
    setCurrentAssessment(null);
    CookieService.setCurrentAssessment(null);
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Header theme={theme} onToggleTheme={toggleTheme} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ConnectionStatus connected={geminiConnected} onRetry={checkGeminiConnection} />
        
        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('assessments')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'assessments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Assessments
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              disabled={!currentAssessment}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'upload'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } ${!currentAssessment ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Upload Submissions
            </button>
            <button
              onClick={() => setActiveTab('grading')}
              disabled={gradingResults.length === 0}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'grading'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } ${gradingResults.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Grading Results
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          {activeTab === 'assessments' && (
            <AssessmentForm
              assessments={assessments}
              onCreateAssessment={handleCreateAssessment}
              onSelectAssessment={handleSelectAssessment}
              currentAssessment={currentAssessment}
              onDeleteAssessment={handleDeleteAssessment}
              onDeleteAllAssessments={handleDeleteAllAssessments}
            />
          )}
          
          {activeTab === 'upload' && currentAssessment && (
            <FileUpload
              assessment={currentAssessment}
              submissions={submissions}
              onFileUpload={handleFileUpload}
              onDeleteSubmission={handleDeleteSubmission}
              onDeleteAllSubmissions={handleDeleteAllSubmissions}
              onStartGrading={handleStartGrading}
              isGrading={isGrading}
              geminiConnected={geminiConnected}
            />
          )}
          
          {activeTab === 'grading' && (
            <GradingResults
              results={gradingResults}
              assessment={currentAssessment}
              onUpdateResult={handleUpdateGradingResult}
              onDownloadResults={handleDownloadResults}
              onDeleteResult={handleDeleteGradingResult}
              onDeleteAllResults={handleDeleteAllGradingResults}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
