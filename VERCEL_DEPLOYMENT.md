# Vercel Deployment Guide

This guide explains how to deploy GradeFlow AI to Vercel with secure API key handling.

## Security Overview

The application uses a hybrid architecture for maximum compatibility:

- **Local Development**: Direct Gemini API calls using `REACT_APP_GEMINI_API_KEY`
- **Production (Vercel)**: Secure backend API routes using `GEMINI_API_KEY`
- **Automatic Detection**: App automatically switches between modes based on environment

## Deployment Steps

### 1. Deploy to Vercel

1. **Connect your repository** to Vercel
2. **Deploy the project** using Vercel's automatic deployment

### 2. Configure Environment Variables

**IMPORTANT**: Do NOT add the API key to frontend environment variables.

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following environment variable:

   | Name | Value | Environment |
   |------|-------|-------------|
   | `GEMINI_API_KEY` | `your_actual_gemini_api_key` | Production, Preview, Development |

4. **Get your API key** from: https://makersuite.google.com/app/apikey

### 3. Verify Deployment

1. **Test the connection**: Visit your deployed app and check if the "Gemini API Not Connected" message disappears
2. **Test grading**: Create an assessment and try grading a submission

## API Endpoints

The backend provides two secure endpoints:

- **`/api/gemini`** (POST): Handles grading submissions
- **`/api/test-connection`** (GET): Tests Gemini API connection

Both endpoints:
- Use `process.env.GEMINI_API_KEY` (server-side only)
- Include CORS headers for frontend access
- Return proper error responses

## Security Benefits

✅ **API key is never exposed to browsers**
✅ **No frontend environment variables needed**
✅ **Server-side API calls only**
✅ **CORS properly configured**
✅ **Error handling included**

## Troubleshooting

### Connection Issues
- Verify `GEMINI_API_KEY` is set in Vercel environment variables
- Check Vercel function logs for API errors
- Ensure the API key is valid and has proper permissions

### Deployment Issues
- Make sure all files are committed to your repository
- Check that the `/api/` directory is included in deployment
- Verify the `@google/genai` dependency is in `package.json`

### Local Development
For local development, the app automatically uses `REACT_APP_GEMINI_API_KEY` from `.env.local` for direct Gemini API calls. This provides a seamless development experience while maintaining security in production.

## File Structure

```
gradeflow-ai-lite/
├── api/                    # Backend API routes
│   ├── gemini.js          # Grading endpoint
│   └── test-connection.js # Connection test endpoint
├── src/
│   ├── services/
│   │   └── geminiService.ts # Updated to use backend API
│   └── ...
└── ...
```

## Architecture Summary

| Environment | API Key Location | API Calls | Security |
|-------------|------------------|-----------|----------|
| **Localhost** | `REACT_APP_GEMINI_API_KEY` in `.env.local` | Direct Gemini API calls | API key in frontend (development only) |
| **Production (Vercel)** | `GEMINI_API_KEY` in server environment | Backend API proxy calls | API key secure on server |

The hybrid approach ensures your app works seamlessly in both development and production environments. 