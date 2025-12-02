import React, { useState } from 'react';
import { 
  AppState, 
  AppView, 
  JobListing, 
} from './types';
import { 
  analyzeResume, 
  enrichAnalysisWithLinkedIn,
  findJobs, 
  analyzeJobMatch,
} from './services/geminiService';
import ResumeUploader from './components/ResumeUploader';
import ResumeAnalysisView from './components/ResumeAnalysisView';
import JobFinder from './components/JobFinder';
import JobDetails from './components/JobDetails';
import { Bot, Sparkles, AlertTriangle } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    view: AppView.UPLOAD,
    resumeFile: null,
    analysis: null,
    jobs: [],
    selectedJobId: null,
    matches: {},
    isLoading: false,
    error: null,
  });

  // State for LinkedIn enhancement loading
  const [isEnhancing, setIsEnhancing] = useState(false);

  const handleResumeUpload = async (file: File) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = async () => {
        const base64String = reader.result as string;
        // Remove data URL prefix (e.g., "data:application/pdf;base64,")
        const base64Data = base64String.split(',')[1];
        
        try {
          const analysis = await analyzeResume(base64Data, file.type);
          setState(prev => ({
            ...prev,
            view: AppView.DASHBOARD,
            resumeFile: {
              data: base64Data,
              mimeType: file.type,
              name: file.name
            },
            analysis,
            isLoading: false
          }));
        } catch (err: any) {
            console.error(err);
            setState(prev => ({ ...prev, isLoading: false, error: err.message || "Failed to analyze resume. Please try again." }));
        }
      };
      
      reader.onerror = () => {
        setState(prev => ({ ...prev, isLoading: false, error: "Error reading file." }));
      };

    } catch (error) {
      console.error(error);
      setState(prev => ({ ...prev, isLoading: false, error: "An unexpected error occurred." }));
    }
  };

  const handleLinkedInEnhancement = async (input: string) => {
    if (!state.analysis) return;
    
    setIsEnhancing(true);
    setState(prev => ({ ...prev, error: null }));
    
    try {
      const updatedAnalysis = await enrichAnalysisWithLinkedIn(state.analysis, input);
      setState(prev => ({
        ...prev,
        analysis: updatedAnalysis
      }));
    } catch (err: any) {
      console.error(err);
      setState(prev => ({ ...prev, error: err.message || "Failed to sync LinkedIn profile." }));
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleJobSearch = async (query: string, location: string, filters: { type: string; experience: string }) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const jobs = await findJobs(query, location, filters);
      setState(prev => ({
        ...prev,
        jobs,
        isLoading: false
      }));
    } catch (error: any) {
       console.error(error);
       setState(prev => ({ ...prev, isLoading: false, error: error.message || "Job search failed." }));
    }
  };

  const handleSelectJob = async (job: JobListing) => {
    // Check if we already have analysis for this job
    if (state.matches[job.id]) {
      setState(prev => ({
        ...prev,
        view: AppView.JOB_DETAILS,
        selectedJobId: job.id
      }));
      return;
    }

    if (!state.analysis) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      // Create a simplified text representation of the resume for the context
      const resumeText = `
        Summary: ${state.analysis.summary}
        Skills: ${state.analysis.skills.join(", ")}
        Experience Level: ${state.analysis.experienceLevel}
      `;
      
      const matchAnalysis = await analyzeJobMatch(resumeText, job);
      
      setState(prev => ({
        ...prev,
        matches: {
          ...prev.matches,
          [job.id]: matchAnalysis
        },
        view: AppView.JOB_DETAILS,
        selectedJobId: job.id,
        isLoading: false
      }));

    } catch (error: any) {
      console.error(error);
      setState(prev => ({ ...prev, isLoading: false, error: error.message || "Failed to analyze job match." }));
    }
  };

  const getSelectedJob = () => {
    return state.jobs.find(j => j.id === state.selectedJobId);
  };

  const getSelectedMatch = () => {
    return state.selectedJobId ? state.matches[state.selectedJobId] : null;
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 relative">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setState(prev => ({...prev, view: prev.analysis ? AppView.DASHBOARD : AppView.UPLOAD}))}>
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
              JobHunt AI
            </span>
          </div>
          <div className="flex items-center gap-4">
            {state.analysis && (
               <button 
                 onClick={() => setState(prev => ({...prev, view: AppView.DASHBOARD}))}
                 className={`text-sm font-medium transition-colors hidden sm:block ${state.view === AppView.DASHBOARD ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
               >
                 Dashboard
               </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {state.error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">Action Failed</p>
              <p className="text-sm opacity-90">{state.error}</p>
            </div>
            <button onClick={() => setState(prev => ({...prev, error: null}))} className="text-sm underline hover:text-red-800">Dismiss</button>
          </div>
        )}

        {state.view === AppView.UPLOAD && (
          <ResumeUploader 
            onUpload={handleResumeUpload} 
            isLoading={state.isLoading} 
          />
        )}

        {state.view === AppView.DASHBOARD && state.analysis && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-slate-900">Your Career Dashboard</h1>
              <div className="flex items-center gap-2 text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                AI Analysis Active
              </div>
            </div>
            
            <ResumeAnalysisView 
              analysis={state.analysis} 
              onLinkedInEnhance={handleLinkedInEnhancement}
              isEnhancing={isEnhancing}
            />
            
            <JobFinder 
              analysis={state.analysis} 
              onSearch={handleJobSearch} 
              jobs={state.jobs}
              onSelectJob={handleSelectJob}
              isLoading={state.isLoading}
            />
          </div>
        )}

        {state.view === AppView.JOB_DETAILS && state.selectedJobId && (
          <JobDetails 
            job={getSelectedJob()!} 
            analysis={getSelectedMatch()!}
            onBack={() => setState(prev => ({ ...prev, view: AppView.DASHBOARD }))}
          />
        )}
      </main>
    </div>
  );
};

export default App;