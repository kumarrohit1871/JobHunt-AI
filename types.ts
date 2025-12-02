export interface ResumeAnalysis {
  summary: string;
  skills: string[];
  experienceLevel: string;
  atsScore: number;
  atsIssues: string[];
  improvementAreas: string[];
  suggestedRoles: string[];
}

export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  snippet: string;
  url?: string;
  matchScore?: number;
}

export interface JobMatchAnalysis {
  jobId: string;
  matchScore: number;
  missingSkills: string[];
  strengths: string[];
  reasoning: string;
  coverLetter: string;
  coldEmail: string;
}

export enum AppView {
  UPLOAD = 'UPLOAD',
  DASHBOARD = 'DASHBOARD',
  JOB_DETAILS = 'JOB_DETAILS',
}

export interface AppState {
  view: AppView;
  resumeFile: {
    data: string; // base64
    mimeType: string;
    name: string;
  } | null;
  analysis: ResumeAnalysis | null;
  jobs: JobListing[];
  selectedJobId: string | null;
  matches: Record<string, JobMatchAnalysis>;
  isLoading: boolean;
  error: string | null;
}