import React, { useState } from 'react';
import { Upload, FileText, AlertCircle, Loader2 } from 'lucide-react';

interface ResumeUploaderProps {
  onUpload: (file: File) => Promise<void>;
  isLoading: boolean;
}

const ResumeUploader: React.FC<ResumeUploaderProps> = ({ onUpload, isLoading }) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (uploadedFile: File) => {
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (validTypes.includes(uploadedFile.type)) {
      setFile(uploadedFile);
    } else {
      alert("Please upload a PDF or Image file.");
    }
  };

  const handleSubmit = () => {
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">
          Supercharge Your Job Search
        </h1>
        <p className="text-lg text-slate-600">
          Upload your resume to get instant ATS feedback, find tailored jobs, and auto-generate applications.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        <div className="p-8 flex flex-col justify-center">
            <div
              className={`relative flex flex-col items-center justify-center w-full h-80 border-2 border-dashed rounded-xl transition-all duration-300 ease-in-out cursor-pointer
                ${dragActive 
                  ? "border-indigo-500 bg-indigo-50 scale-[1.01]" 
                  : "border-slate-300 bg-slate-50 hover:bg-slate-100"
                }
              `}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={handleChange}
                accept=".pdf,image/*"
                disabled={isLoading}
              />

              <div className="text-center pointer-events-none p-6">
                {file ? (
                  <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                    <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                      <FileText className="w-10 h-10 text-indigo-600" />
                    </div>
                    <p className="text-xl font-medium text-slate-800 mb-1 truncate max-w-xs">{file.name}</p>
                    <p className="text-sm text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <>
                    <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-6 mx-auto">
                      <Upload className="w-10 h-10 text-slate-500" />
                    </div>
                    <p className="text-xl font-semibold text-slate-700 mb-3">
                      Drag & drop your resume
                    </p>
                    <p className="text-base text-slate-500">
                      Supports PDF, JPG, PNG
                    </p>
                  </>
                )}
              </div>
            </div>
        </div>

        {/* Action Button */}
        <div className="bg-slate-50 p-6 border-t border-slate-200 flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={isLoading || !file}
            className={`
              flex items-center gap-2 px-10 py-4 rounded-xl text-lg font-semibold shadow-lg transition-all duration-300
              ${isLoading || !file
                ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-500/25 scale-100 hover:scale-105"
              }
            `}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                Analyze Resume
                <FileText className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
      
      <div className="mt-6 flex items-start gap-3 p-4 bg-slate-100 text-slate-600 rounded-lg text-sm max-w-xl mx-auto">
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
        <p>
          We use Google Gemini AI to analyze your data securely. Your documents are processed in real-time and not stored permanently.
        </p>
      </div>
    </div>
  );
};

export default ResumeUploader;