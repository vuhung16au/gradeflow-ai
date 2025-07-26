import { Assessment, StudentSubmission, GradingResult } from '../types';
import { GoogleGenAI } from '@google/genai';

export class GeminiService {
  private static isProduction(): boolean {
    return process.env.NODE_ENV === 'production' && window.location.hostname !== 'localhost';
  }

  private static getApiKey(): string {
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not found in environment variables');
    }
    return apiKey;
  }

  private static getGeminiClient() {
    const apiKey = this.getApiKey();
    return new GoogleGenAI({ apiKey });
  }

  static async gradeSubmission(
    assessment: Assessment,
    submission: StudentSubmission
  ): Promise<GradingResult> {
    // Use backend API for production, direct API for local development
    if (this.isProduction()) {
      return this.gradeSubmissionViaBackend(assessment, submission);
    } else {
      return this.gradeSubmissionDirect(assessment, submission);
    }
  }

  private static async gradeSubmissionViaBackend(
    assessment: Assessment,
    submission: StudentSubmission
  ): Promise<GradingResult> {
    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assessment,
          submission,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to grade submission');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Backend grading failed:', error);
      throw new Error('Failed to grade submission. Please check your Gemini API key and try again.');
    }
  }

  private static async gradeSubmissionDirect(
    assessment: Assessment,
    submission: StudentSubmission
  ): Promise<GradingResult> {
    const prompt = this.buildGradingPrompt(assessment, submission);
    
    try {
      const ai = this.getGeminiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      
      const responseText = response.text || '';
      
      // Parse the AI response to extract grading information
      const gradingData = this.parseGradingResponse(responseText);
      
      return {
        id: `grading_${Date.now()}`,
        submissionId: submission.id,
        studentName: submission.studentName,
        score: gradingData.score,
        feedback: gradingData.feedback,
        detailedFeedback: gradingData.detailedFeedback,
        minorAreasForImprovement: gradingData.minorAreasForImprovement,
        strengths: gradingData.strengths,
        weaknesses: gradingData.weaknesses,
        suggestions: gradingData.suggestions,
        gradedAt: new Date(),
        isReviewed: false,
      };
    } catch (error) {
      console.error('Direct grading failed:', error);
      throw new Error('Failed to grade submission. Please check your Gemini API key and try again.');
    }
  }

  static async checkGeminiConnection(): Promise<boolean> {
    // Use backend API for production, direct API for local development
    if (this.isProduction()) {
      return this.checkConnectionViaBackend();
    } else {
      return this.checkConnectionDirect();
    }
  }

  private static async checkConnectionViaBackend(): Promise<boolean> {
    try {
      const response = await fetch('/api/test-connection', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.connected === true;
    } catch (error) {
      console.error('Backend connection check failed:', error);
      return false;
    }
  }

  private static async checkConnectionDirect(): Promise<boolean> {
    try {
      const ai = this.getGeminiClient();
      await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: 'Hello, this is a test message.',
      });
      return true;
    } catch (error) {
      console.error('Direct connection check failed:', error);
      return false;
    }
  }

  private static buildGradingPrompt(assessment: Assessment, submission: StudentSubmission): string {
    return `You are an expert academic grader. Please evaluate the following student submission based on the provided marking criteria.

ASSESSMENT INFORMATION:
Title: ${assessment.title}
Description: ${assessment.description}
Instructions: ${assessment.instructions}

MARKING CRITERIA:
${assessment.markingCriteria}

STUDENT SUBMISSION:
Student: ${submission.studentName}
File: ${submission.fileName}
Content:
${submission.fileContent}

Please provide a comprehensive evaluation in the following JSON format:
{
  "score": <number between 0-100>,
  "feedback": "<general feedback explaining the overall assessment - provide as plain text, not JSON>",
  "detailedFeedback": "<step-by-step detailed feedback for each part of the submission - provide as plain text, not JSON>",
  "minorAreasForImprovement": ["<minor issue 1>", "<minor issue 2>", ...],
  "strengths": ["<strength1>", "<strength2>", ...],
  "weaknesses": ["<area for improvement 1>", "<area for improvement 2>", ...],
  "suggestions": ["<suggestion1>", "<suggestion2>", ...]
}

IMPORTANT REQUIREMENTS:
1. Evaluate how well the student followed the provided instructions as part of your assessment.
2. For each marking criterion, provide specific feedback on how well the student met it in the detailedFeedback section.
3. "weaknesses" should list up to 10 specific areas where the student should improve
4. "suggestions" should list up to 10 actionable suggestions for the student
5. "detailedFeedback" should provide comprehensive step-by-step feedback as plain text
6. "minorAreasForImprovement" should list minor issues that don't significantly impact the grade
7. "strengths" should highlight what the student did well
8. "feedback" and "detailedFeedback" should be plain text, not JSON strings or markdown code blocks
9. Do not wrap your response in markdown code blocks

Focus on:
1. Adherence to marking criteria
2. Quality of content and analysis
3. Technical accuracy (for code submissions)
4. Clarity and structure
5. Originality and critical thinking

Provide constructive, specific feedback that will help the student improve.`;
  }

  private static parseGradingResponse(response: string): {
    score: number;
    feedback: string;
    detailedFeedback: string;
    minorAreasForImprovement: string[];
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
  } {
    try {
      // Clean the response - remove markdown code blocks if present
      let cleanedResponse = response;
      
      // Remove markdown code blocks (```json ... ```)
      cleanedResponse = cleanedResponse.replace(/```json\s*([\s\S]*?)\s*```/g, '$1');
      cleanedResponse = cleanedResponse.replace(/```\s*([\s\S]*?)\s*```/g, '$1');
      
      // Try to extract JSON from the response
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          score: Math.min(100, Math.max(0, parsed.score || 0)),
          feedback: this.cleanText(parsed.feedback || 'No feedback provided'),
          detailedFeedback: this.cleanText(parsed.detailedFeedback || 'No detailed feedback provided'),
          minorAreasForImprovement: Array.isArray(parsed.minorAreasForImprovement) 
            ? parsed.minorAreasForImprovement.map(this.cleanText) 
            : [],
          strengths: Array.isArray(parsed.strengths) 
            ? parsed.strengths.map(this.cleanText) 
            : [],
          weaknesses: Array.isArray(parsed.weaknesses) 
            ? parsed.weaknesses.map(this.cleanText) 
            : [],
          suggestions: Array.isArray(parsed.suggestions) 
            ? parsed.suggestions.map(this.cleanText) 
            : [],
        };
      }
    } catch (error) {
      console.warn('Failed to parse JSON response:', error);
    }

    // Fallback parsing if JSON extraction fails
    return {
      score: 50,
      feedback: this.cleanText(response) || 'AI grading completed but response format was unexpected.',
      detailedFeedback: 'Unable to parse detailed feedback from AI response.',
      minorAreasForImprovement: ['Unable to parse minor areas for improvement'],
      strengths: ['Content submitted for review'],
      weaknesses: ['Unable to parse detailed feedback'],
      suggestions: ['Please review the submission manually'],
    };
  }

  private static cleanText(text: string): string {
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
} 