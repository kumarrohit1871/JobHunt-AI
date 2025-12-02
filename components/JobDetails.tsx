import React, { useState } from 'react';
import { JobListing, JobMatchAnalysis } from '../types';
import { ChevronLeft, Check, X, Copy, Mail, FileText, Send, Linkedin, ExternalLink, Pencil } from 'lucide-react';
import { generateLinkedInConnectionNote } from '../services/geminiService';

interface Props {
  job: JobListing;
  analysis: JobMatchAnalysis;
  onBack: () => void;
}

const JobDetails: React.FC<Props> = ({ job, analysis, onBack }) => {
  const [connectionNote, setConnectionNote] = useState<string>("");
  const [loadingNote, setLoadingNote] = useState(false);
  const [editableCoverLetter, setEditableCoverLetter] = useState(analysis.coverLetter);
  const [isEditingLetter, setIsEditingLetter] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const handleSmartApply = () => {
    const subject = encodeURIComponent(`Application for ${job.title} - ${job.company}`);
    const body = encodeURIComponent(editableCoverLetter);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleGenerateNote = async () => {
    setLoadingNote(true);
    try {
      const note = await generateLinkedInConnectionNote(job, analysis.strengths);
      setConnectionNote(note);
    } catch (e) {
      console.error(e);
      alert("Failed to generate note. Please try again.");
    } finally {
      setLoadingNote(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-8 duration-500">
      <button 
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-medium"
      >
        <ChevronLeft className="w-5 h-5" /> Back to Search
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Job & Match Score */}
        <div className="lg:col-span-1 space-y-6">
          {/* Job Info Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">{job.title}</h2>
            <p className="text-lg text-slate-700 font-medium mb-4">{job.company}</p>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-sm mb-6">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              {job.location}
            </div>
            
            <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 text-center mb-6">
              <span className="block text-sm text-indigo-600 font-semibold uppercase tracking-wider mb-1">Match Score</span>
              <span className={`text-5xl font-bold ${analysis.matchScore > 80 ? 'text-indigo-600' : analysis.matchScore > 60 ? 'text-yellow-600' : 'text-slate-500'}`}>
                {analysis.matchScore}%
              </span>
            </div>

            {/* Auto Apply Actions */}
            <div className="space-y-3">
              <button 
                onClick={handleSmartApply}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
              >
                <Mail className="w-4 h-4" />
                Apply via Email
              </button>
              {job.url && (
                <a 
                  href={job.url}
                  target="_blank" 
                  rel="noreferrer"
                  onClick={() => {
                     navigator.clipboard.writeText(editableCoverLetter);
                     alert("Cover letter copied! Redirecting to application page...");
                  }}
                  className="w-full py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-semibold hover:border-indigo-600 hover:text-indigo-600 transition-all flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Apply on Company Site
                </a>
              )}
               <p className="text-xs text-center text-slate-400 px-2 leading-relaxed">
                "Apply on Company Site" automatically copies your tailored cover letter to your clipboard.
              </p>
            </div>
          </div>

          {/* Reasoning */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-semibold text-slate-800 mb-3">AI Analysis</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              {analysis.reasoning}
            </p>
          </div>

          {/* Skills Gap */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-semibold text-slate-800 mb-4">Skills Gap Analysis</h3>
            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-2 block">Matching Skills</span>
                <div className="flex flex-wrap gap-2">
                  {analysis.strengths.map((s, i) => (
                    <span key={i} className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded border border-green-100 flex items-center gap-1">
                      <Check className="w-3 h-3" /> {s}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-xs font-semibold text-red-500 uppercase tracking-wide mb-2 block">Missing / To Improve</span>
                <div className="flex flex-wrap gap-2">
                  {analysis.missingSkills.map((s, i) => (
                    <span key={i} className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded border border-red-100 flex items-center gap-1">
                      <X className="w-3 h-3" /> {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Application Kit */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="flex items-center justify-between">
             <h2 className="text-2xl font-bold text-slate-900">Application Assistant</h2>
             <span className="text-sm px-3 py-1 bg-indigo-600 text-white rounded-full font-medium shadow-sm">AI Generated</span>
          </div>

          {/* Cover Letter */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[500px]">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center shrink-0">
              <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-500" />
                Tailored Cover Letter
              </h3>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsEditingLetter(!isEditingLetter)}
                  className={`text-sm font-medium flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-lg ${isEditingLetter ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
                >
                  <Pencil className="w-4 h-4" /> {isEditingLetter ? 'Done Editing' : 'Edit'}
                </button>
                <button 
                  onClick={() => handleCopy(editableCoverLetter)}
                  className="text-slate-500 hover:text-indigo-600 text-sm font-medium flex items-center gap-1.5 transition-colors px-3 py-1.5 hover:bg-slate-100 rounded-lg"
                >
                  <Copy className="w-4 h-4" /> Copy
                </button>
              </div>
            </div>
            <div className="p-0 flex-1 relative">
              <textarea 
                value={editableCoverLetter}
                onChange={(e) => setEditableCoverLetter(e.target.value)}
                readOnly={!isEditingLetter}
                className={`w-full h-full p-6 text-slate-700 text-sm leading-loose focus:outline-none resize-none font-serif ${isEditingLetter ? 'bg-white' : 'bg-slate-50/30'}`}
                spellCheck={isEditingLetter}
              />
            </div>
          </div>

          {/* LinkedIn Network Assistant */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                <Linkedin className="w-5 h-5 text-blue-600" />
                Networking Assistant
              </h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-600 mb-4">
                Increase your chances by 40% by messaging a recruiter. Here is a generated connection note:
              </p>
              
              {!connectionNote ? (
                 <button 
                  onClick={handleGenerateNote}
                  disabled={loadingNote}
                  className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors flex items-center gap-2"
                 >
                   {loadingNote ? 'Generating...' : 'Generate Connection Note'} <Send className="w-4 h-4" />
                 </button>
              ) : (
                <div className="relative">
                  <textarea 
                    value={connectionNote}
                    onChange={(e) => setConnectionNote(e.target.value)}
                    className="w-full h-32 p-4 text-slate-600 text-sm leading-relaxed bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                    placeholder="Edit your note here..."
                  />
                  <button 
                    onClick={() => handleCopy(connectionNote)}
                    className="absolute top-2 right-2 p-1.5 bg-white shadow-sm border border-slate-200 rounded hover:bg-slate-50 text-slate-500"
                    title="Copy to clipboard"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
