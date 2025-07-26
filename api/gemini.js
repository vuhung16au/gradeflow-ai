const { GoogleGenAI } = require('@google/genai');

module.exports = async (req, res) => {
  // Enable CORS for frontend requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get API key from server environment (not exposed to frontend)
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY not configured on server' });
    }

    const { assessment, submission } = req.body;

    if (!assessment || !submission) {
      return res.status(400).json({ error: 'Missing assessment or submission data' });
    }

    // Initialize Gemini client
    const ai = new GoogleGenAI({ apiKey });

    // Build the grading prompt
    const prompt = buildGradingPrompt(assessment, submission);

    // Call Gemini API
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const responseText = response.text || '';

    // Parse the AI response
    const gradingData = parseGradingResponse(responseText);

    // Return the grading result
    const result = {
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

    res.status(200).json(result);
  } catch (error) {
    console.error('Gemini API error:', error);
    res.status(500).json({ 
      error: 'Failed to grade submission. Please check your Gemini API key and try again.' 
    });
  }
};

function buildGradingPrompt(assessment, submission) {
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
  "feedback": "<general feedback explaining the overall assessment>",
  "detailedFeedback": "<step-by-step detailed feedback for each part of the submission>",
  "minorAreasForImprovement": ["<minor issue 1>", "<minor issue 2>", ...],
  "strengths": ["<strength1>", "<strength2>", ...],
  "weaknesses": ["<area for improvement 1>", "<area for improvement 2>", ...],
  "suggestions": ["<suggestion1>", "<suggestion2>", ...]
}

IMPORTANT REQUIREMENTS:
1. "weaknesses" should list up to 10 specific areas where the student should improve
2. "suggestions" should list up to 10 actionable suggestions for the student
3. "detailedFeedback" should provide comprehensive step-by-step feedback
4. "minorAreasForImprovement" should list minor issues that don't significantly impact the grade
5. "strengths" should highlight what the student did well

Focus on:
1. Adherence to marking criteria
2. Quality of content and analysis
3. Technical accuracy (for code submissions)
4. Clarity and structure
5. Originality and critical thinking

Provide constructive, specific feedback that will help the student improve.`;
}

function parseGradingResponse(response) {
  try {
    // Try to extract JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        score: Math.min(100, Math.max(0, parsed.score || 0)),
        feedback: parsed.feedback || 'No feedback provided',
        detailedFeedback: parsed.detailedFeedback || 'No detailed feedback provided',
        minorAreasForImprovement: Array.isArray(parsed.minorAreasForImprovement) ? parsed.minorAreasForImprovement : [],
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
        weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
        suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
      };
    }
  } catch (error) {
    console.warn('Failed to parse JSON response:', error);
  }

  // Fallback parsing if JSON extraction fails
  return {
    score: 50,
    feedback: response || 'AI grading completed but response format was unexpected.',
    detailedFeedback: 'Unable to parse detailed feedback from AI response.',
    minorAreasForImprovement: ['Unable to parse minor areas for improvement'],
    strengths: ['Content submitted for review'],
    weaknesses: ['Unable to parse detailed feedback'],
    suggestions: ['Please review the submission manually'],
  };
} 