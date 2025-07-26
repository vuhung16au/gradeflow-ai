# GradeFlow AI - Quick Start Guide

Get up and running with GradeFlow AI in 5 minutes!

## Prerequisites

- Node.js (v18 or later)
- Google Gemini API key

## Step 1: Get Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

## Step 2: Setup and Run

1. **Clone and install**:
   ```bash
   git clone <repository-url>
   cd gradeflow-ai
   npm install
   ```

2. **Setup environment and start the app**:
   ```bash
   cp env.example .env.local
   ```
   
   **For Local Development:**
   Edit `.env.local` and add your API key:
   ```
   REACT_APP_GEMINI_API_KEY=your_api_key_here
   ```
   
   **For Production Deployment on Vercel:**
   - DO NOT add the API key to frontend environment variables
   - Add `GEMINI_API_KEY` as a server environment variable in Vercel dashboard
   - The API key is handled securely on the backend via `/api/gemini.js`
   
   Then start the development server:
   ```bash
   npm start
   ```

3. **Open your browser**:
   Navigate to `http://localhost:3000`

## Step 3: Create Your First Assessment

1. Click "New Assessment"
2. Fill in the details:
   - **Title**: "ITEC203 Assessment Test 1"
   - **Description**: "Python programming fundamentals assessment"
   - **Marking Criteria**: Copy from `examples/sample-assessment.md`
   - **Instructions**: "Create a Python program that processes student grades..."

3. Click "Create Assessment"

## Step 4: Upload Sample Submissions

1. Go to the "Upload Submissions" tab
2. Upload the sample file: `examples/sample-student-submission.py`
3. Click "Start Grading"

## Step 5: Review Results

1. Go to the "Grading Results" tab
2. Review the AI-generated feedback
3. Edit scores or feedback if needed
4. Download results for record-keeping

## Troubleshooting

### Gemini API Issues

**For Local Development:**
```bash
# Check if your API key is set correctly
echo $REACT_APP_GEMINI_API_KEY

# Verify the .env.local file exists and has the correct format
cat .env.local
```

**For Production Deployment:**
- Verify `GEMINI_API_KEY` is set in Vercel environment variables
- Check Vercel function logs for API errors
- Ensure the API key is valid and has proper permissions

### Application Issues
```bash
# Clear and reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Start fresh
npm start
```

## Next Steps

- Create your own assessments with custom marking criteria
- Upload real student submissions
- Customize the AI prompts in `src/services/geminiService.ts`
- Explore the code structure in the `src/` directory

## Support

If you encounter issues:
1. Check the main README.md for detailed documentation
2. Ensure your Gemini API key is valid and properly configured
3. Check the browser console for error messages
4. Open an issue in the repository

Happy grading! 🎓 