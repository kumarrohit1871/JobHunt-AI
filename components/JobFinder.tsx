import React, { useState } from 'react';
import { JobListing, ResumeAnalysis } from '../types';
import { Search, MapPin, ExternalLink, ArrowRight, Briefcase, Filter } from 'lucide-react';

interface Props {
  analysis: ResumeAnalysis;
  onSearch: (query: string, location: string, filters: { type: string; experience: string }) => Promise<void>;
  jobs: JobListing[];
  onSelectJob: (job: JobListing) => void;
  isLoading: boolean;
}

const JobFinder: React.FC<Props> = ({ analysis, onSearch, jobs, onSelectJob, isLoading }) => {
  const [query, setQuery] = useState(analysis.suggestedRoles[0] || "");
  const [location, setLocation] = useState("");
  const [experience, setExperience] = useState(analysis.experienceLevel || "Mid Level");
  const [jobType, setJobType] = useState("Full-time");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query, location, { type: jobType, experience });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
      
      {/* Search Bar */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Find Your Next Role</h2>
        <form onSubmit={handleSearch} className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-[2] relative">
              <Search className="absolute left-3 top-3.5 text-slate-400 w-5 h-5" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Job title, keywords, or company"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
              />
            </div>
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-3.5 text-slate-400 w-5 h-5" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City or 'Remote'"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4 items-center pt-2">
            <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
              <Filter className="w-4 h-4" /> Filters:
            </div>
            
            <select 
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="Entry Level">Entry Level</option>
              <option value="Mid Level">Mid Level</option>
              <option value="Senior Level">Senior Level</option>
              <option value="Executive">Executive</option>
            </select>

            <select 
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Remote">Remote</option>
            </select>

            <button
              type="submit"
              disabled={isLoading}
              className="ml-auto px-8 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20 whitespace-nowrap disabled:opacity-70"
            >
              {isLoading ? 'Searching...' : 'Search Jobs'}
            </button>
          </div>
        </form>
        
        {/* Suggested Roles Chips */}
        <div className="mt-4 flex flex-wrap gap-2 items-center text-sm text-slate-500">
          <span>Suggested:</span>
          {analysis.suggestedRoles.map((role, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setQuery(role)}
              className="px-3 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-full transition-colors border border-transparent hover:border-indigo-100"
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Job Results */}
      {jobs.length > 0 && (
        <div className="grid grid-cols-1 gap-4">
          <h3 className="text-lg font-semibold text-slate-700">Top Opportunities</h3>
          {jobs.map((job) => (
            <div 
              key={job.id} 
              className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group relative overflow-hidden"
              onClick={() => onSelectJob(job)}
            >
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <h4 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {job.title}
                  </h4>
                  <div className="flex items-center gap-4 mt-2 text-slate-600">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Briefcase className="w-4 h-4" />
                      {job.company}
                    </span>
                    <span className="flex items-center gap-1.5 text-sm bg-slate-100 px-2 py-0.5 rounded">
                      <MapPin className="w-3 h-3" />
                      {job.location}
                    </span>
                  </div>
                </div>
                <button 
                  className="px-4 py-2 bg-indigo-50 text-indigo-600 text-sm font-medium rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-all flex items-center gap-2"
                >
                  Analyze Match <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <p className="mt-4 text-slate-600 text-sm line-clamp-2 leading-relaxed relative z-10">
                {job.snippet}
              </p>
              
              {/* Decorative background element */}
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-indigo-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              {job.url && (
                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end relative z-10">
                   <a 
                    href={job.url} 
                    target="_blank" 
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()} // Prevent card click
                    className="text-xs text-slate-400 hover:text-indigo-500 flex items-center gap-1"
                  >
                    View Original Listing <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobFinder;
