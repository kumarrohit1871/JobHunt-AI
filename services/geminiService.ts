import { GoogleGenAI, Type } from "@google/genai";
import { ResumeAnalysis, JobListing, JobMatchAnalysis } from "../types";

// Initialize the client strictly with the environment variable
const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.warn("API Key is missing. The app will not function correctly.");
}

// Immutable instance
const ai = new GoogleGenAI({ apiKey: apiKey || "dummy-key" });

const MODEL_NAME = "gemini-2.5-flash";

/**
 * Helper to parse and throw user-friendly errors
 */
const handleGeminiError = (error: any, context: string) => {
  console.error(`Detailed error in ${context}:`, error);
  
  const status = error.status || (error.error && error.error.status);
  const message = error.message || (error.error && error.error.message) || JSON.stringify(error);

  if (status === "PERMISSION_DENIED" || message.includes("403") || message.includes("permission")) {
    if (context.includes("Search") || context.includes("Job")) {
      throw new Error("Search Grounding API not enabled. Please check your Google Cloud project settings.");
    }
    throw new Error("API Permission Denied. Please check your API Key permissions.");
  }
  
  if (status === "RESOURCE_EXHAUSTED" || message.includes("429")) {
    throw new Error("API Rate limit exceeded. Please wait a moment and try again.");
  }

  throw new Error(`Failed to ${context}. Please try again.`);
};

/**
 * Analyzes the uploaded resume file (PDF or Image)
 */
export const analyzeResume = async (
  base64Data: string,
  mimeType: string
): Promise<ResumeAnalysis> => {
  try {
    const prompt = `
      You are an expert Resume Reviewer and ATS (Applicant Tracking System) specialist.
      Analyze the attached resume document.
      
      Provide the output in JSON format matching this schema:
      {
        "summary": "Professional summary of the candidate (max 3 sentences)",
        "skills": ["List", "of", "extracted", "skills"],
        "experienceLevel": "Entry/Mid/Senior/Executive",
        "atsScore": 0-100 (integer representing ATS friendliness),
        "atsIssues": ["List of specific formatting or content issues that might hurt ATS parsing"],
        "improvementAreas": ["List of 3-5 specific suggestions to improve the resume"],
        "suggestedRoles": ["List of 3 job titles this candidate is best suited for"]
      }
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response generated from AI");
    return JSON.parse(text) as ResumeAnalysis;
  } catch (error: any) {
    handleGeminiError(error, "analyze resume");
    throw error; // unreachable
  }
};

/**
 * Enhances an existing resume analysis with LinkedIn profile data
 */
export const enrichAnalysisWithLinkedIn = async (
  currentAnalysis: ResumeAnalysis,
  linkedinInput: string
): Promise<ResumeAnalysis> => {
  try {
    const isUrl = linkedinInput.toLowerCase().startsWith('http');
    let linkedinContext = "";

    if (isUrl) {
       // Try Search Grounding for URL
       try {
        const searchResponse = await ai.models.generateContent({
          model: MODEL_NAME,
          contents: `Go to ${linkedinInput} and extract the full professional profile text including experience, skills, and about section.`,
          config: { tools: [{ googleSearch: {} }] },
        });
        linkedinContext = searchResponse.text || linkedinInput;
      } catch (e) {
        console.warn("LinkedIn search failed, using URL as context", e);
        linkedinContext = `Profile URL: ${linkedinInput}`;
      }
    } else {
      linkedinContext = linkedinInput;
    }

    const prompt = `
      I have an existing resume analysis and new LinkedIn profile data.
      Merge them to create a more comprehensive profile analysis.
      
      EXISTING ANALYSIS:
      ${JSON.stringify(currentAnalysis)}

      LINKEDIN DATA:
      ${linkedinContext}

      Task:
      1. Update the 'summary' to be more comprehensive if LinkedIn provides more context.
      2. Add any new 'skills' found on LinkedIn that were missing from the resume.
      3. Re-evaluate 'atsScore' - if the LinkedIn data fills gaps, increase the score slightly (max +10), but note that the resume file itself is what ATS parses, so don't increase it too much if the file didn't change.
      4. Update 'suggestedRoles' if the LinkedIn profile suggests a different career trajectory.
      5. Keep the JSON structure exactly the same.

      Output JSON matching the ResumeAnalysis schema.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });

    if (response.text) return JSON.parse(response.text);
    return currentAnalysis;
  } catch (error) {
    handleGeminiError(error, "enrich profile");
    throw error;
  }
};

/**
 * Finds jobs using Google Search Grounding
 */
export const findJobs = async (
  query: string,
  location: string = "",
  filters?: { type?: string; experience?: string }
): Promise<JobListing[]> => {
  try {
    const filterText = [];
    if (filters?.type) filterText.push(`Type: ${filters.type}`);
    if (filters?.experience) filterText.push(`Experience: ${filters.experience}`);

    const searchPrompt = `
      Find 6 active and recent job listings for "${query}" ${location ? `in ${location}` : ''}.
      ${filterText.length > 0 ? `Filters: ${filterText.join(', ')}` : ''}
      
      Focus on finding real, currently open positions.
      For each job, extract: Title, Company, Location, a brief Snippet/Description, and the Apply URL if available.
    `;

    // Try with Search Grounding
    try {
      const searchResponse = await ai.models.generateContent({
        model: MODEL_NAME, 
        contents: searchPrompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const groundedText = searchResponse.text;
      if (groundedText) {
        const formattingPrompt = `
          Based on the following text which contains job search results, extract a list of jobs in JSON format.
          
          Source Text:
          ${groundedText}

          Output Schema:
          [
            {
              "id": "generate_a_unique_random_string_id",
              "title": "Job Title",
              "company": "Company Name",
              "location": "Location",
              "snippet": "Brief description",
              "url": "Apply URL if found, else null"
            }
          ]
        `;

        const formatResponse = await ai.models.generateContent({
          model: MODEL_NAME,
          contents: formattingPrompt,
          config: { responseMimeType: "application/json" },
        });

        if (formatResponse.text) {
          return JSON.parse(formatResponse.text);
        }
      }
    } catch (e) {
      console.warn("Search grounding failed, falling back to mock data.", e);
    }

    // Fallback Mock Data
    return [
      {
        id: "mock-1",
        title: `${query} (Mock)`,
        company: "Demo Company A",
        location: location || "Remote",
        snippet: "This is a sample listing shown because real-time search unavailable. Please check API permissions for 'Search Grounding'.",
        url: "#"
      },
      {
        id: "mock-2",
        title: `Senior ${query}`,
        company: "Tech Corp B",
        location: "New York, NY",
        snippet: "Great opportunity for an experienced professional. (Sample Data)",
        url: "#"
      },
       {
        id: "mock-3",
        title: `Lead ${query}`,
        company: "Future Systems",
        location: "San Francisco, CA",
        snippet: "Join our fast growing team working on cutting edge tech. (Sample Data)",
        url: "#"
      }
    ];

  } catch (error) {
    console.error("Critical error in findJobs:", error);
    return [];
  }
};

/**
 * Detailed match analysis and application kit generation
 */
export const analyzeJobMatch = async (
  resumeText: string,
  job: JobListing
): Promise<JobMatchAnalysis> => {
  try {
    const prompt = `
      I need to apply for the following job. Compare my resume profile with the job description.

      MY PROFILE:
      ${resumeText}

      JOB DETAILS:
      Title: ${job.title}
      Company: ${job.company}
      Snippet: ${job.snippet}

      Please generate a JSON response with:
      {
        "matchScore": 0-100 (integer),
        "missingSkills": ["List", "of", "missing", "skills"],
        "strengths": ["List", "of", "matching", "skills"],
        "reasoning": "One paragraph explaining the score",
        "coverLetter": "A full professional cover letter text tailored to this job (plaintext, no markdown)",
        "coldEmail": "A short, punchy cold email to a recruiter regarding this role (subject line included)"
      }
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No analysis generated");
    
    const result = JSON.parse(text);
    return {
      ...result,
      jobId: job.id
    };

  } catch (error: any) {
    handleGeminiError(error, "analyze job match");
    throw error;
  }
};

export const generateLinkedInConnectionNote = async (
  job: JobListing,
  mySkills: string[]
): Promise<string> => {
  try {
    const prompt = `Write a short (under 300 chars) LinkedIn connection request note to a recruiter at ${job.company} regarding the ${job.title} role. Mention my skills in ${mySkills.slice(0,2).join(', ')}. Return only the text.`;
    
    const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
      });
      return response.text || "Hi, I'm interested in the role...";
  } catch (error) {
    console.error("Note generation failed:", error);
    return "Hi, I noticed your hiring for the " + job.title + " role and would love to connect.";
  }
};