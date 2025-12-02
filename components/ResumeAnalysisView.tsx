import React, { useState } from 'react';
import { ResumeAnalysis } from '../types';
import { 
  RadialBarChart, 
  RadialBar, 
  ResponsiveContainer, 
  PolarAngleAxis 
} from 'recharts';
import { CheckCircle2, AlertTriangle, TrendingUp, Briefcase, Linkedin, Plus, Loader2 } from 'lucide-react';

interface Props {
  analysis: ResumeAnalysis;
  onLinkedInEnhance: (input: string) => Promise<void>;
  isEnhancing: boolean;
}

const ResumeAnalysisView: React.FC<Props> = ({ analysis, onLinkedInEnhance, isEnhancing }) => {
  const [showLinkedinInput, setShowLinkedinInput] = useState(false);
  const [linkedinUrl, setLinkedinUrl] = useState("");

  const scoreData = [
    {
      name: 'ATS Score',
      value: analysis.atsScore,
      fill: analysis.atsScore > 75 ? '#22c55e' : analysis.atsScore > 50 ? '#eab308' : '#ef4444',
    }
  ];

  const handleEnhance = () => {
    if (linkedinUrl) {
      onLinkedInEnhance(linkedinUrl).then(() => {
        setShowLinkedinInput(false);
        setLinkedinUrl("");
      });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* ATS Score Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col items-center justify-center md:col-span-1">
        <h3 className="text-lg font-semibold text-slate-700 mb-4">ATS Compatibility Score</h3>
        <div className="h-64 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart 
              innerRadius="70%" 
              outerRadius="100%" 
              barSize={20} 
              data={scoreData} 
              startAngle={180} 
              endAngle={0}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
              <RadialBar
                background
                dataKey="value"
                cornerRadius={10}
                label={false}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
            <span className={`text-5xl font-bold ${analysis.atsScore > 75 ? 'text-green-600' : 'text-yellow-600'}`}>
              {analysis.atsScore}%
            </span>
            <span className="text-slate-400 text-sm mt-2">Optimization Level</span>
          </div>
        </div>
      </div>

      {/* Summary & Suggestions */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:col-span-2 relative overflow-hidden">
        <div className="mb-6">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-500" />
              Professional Summary
            </h3>
            
            {!showLinkedinInput && (
              <button 
                onClick={() => setShowLinkedinInput(true)}
                className="text-sm flex items-center gap-1 text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors font-medium"
              >
                <Linkedin className="w-4 h-4" />
                Sync LinkedIn
              </button>
            )}
          </div>
          
          {showLinkedinInput && (
            <div className="mb-4 bg-blue-50 p-4 rounded-xl border border-blue-100 animate-in slide-in-from-top-2">
              <h4 className="text-sm font-semibold text-blue-800 mb-2">Enhance Profile with LinkedIn Data</h4>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="Paste LinkedIn URL or Bio text..."
                  className="flex-1 px-3 py-2 text-sm border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button 
                  onClick={handleEnhance}
                  disabled={isEnhancing || !linkedinUrl}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {isEnhancing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Add
                </button>
              </div>
            </div>
          )}

          <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
            {analysis.summary}
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-indigo-500" />
            Areas for Improvement
          </h3>
          <div className="grid gap-3">
            {analysis.improvementAreas.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border border-orange-100 bg-orange-50/50">
                <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                <span className="text-slate-700 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:col-span-2">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Extracted Skills</h3>
        <div className="flex flex-wrap gap-2">
          {analysis.skills.map((skill, idx) => (
            <span key={idx} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-sm font-medium rounded-full border border-indigo-100">
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* ATS Issues */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:col-span-1">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Critical ATS Issues</h3>
        <div className="space-y-3">
          {analysis.atsIssues.length > 0 ? (
            analysis.atsIssues.map((issue, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 shrink-0" />
                {issue}
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-green-600">
              <CheckCircle2 className="w-12 h-12 mb-2" />
              <p className="font-medium">No critical issues found!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalysisView;