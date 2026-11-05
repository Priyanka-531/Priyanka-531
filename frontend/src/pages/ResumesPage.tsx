import React, { useState, useEffect } from 'react';
import { featureService } from '../services/featureService';
import type { Resume } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Sparkles,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const ResumesPage: React.FC = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const data = await featureService.getResumes();
      setResumes(data);
      if (data.length > 0 && !selectedResume) {
        setSelectedResume(data[0]);
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to load resumes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF documents are supported.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be under 5MB.');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setSuccess(null);
      const uploaded = await featureService.uploadResume(file);
      setSuccess(`Resume "${file.name}" uploaded and analyzed successfully!`);
      setResumes((prev) => [uploaded, ...prev]);
      setSelectedResume(uploaded);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) return;
    try {
      await featureService.deleteResume(id);
      const updated = resumes.filter((r) => r.id !== id);
      setResumes(updated);
      if (selectedResume?.id === id) {
        setSelectedResume(updated.length > 0 ? updated[0] : null);
      }
    } catch (err: any) {
      setError('Failed to delete resume.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 px-4 py-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-500/10 border border-sky-500/30 rounded-full text-sky-400 text-xs font-semibold mb-2">
            <FileText className="w-3.5 h-3.5" />
            <span>AI Resume Intelligence</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-100">Resume & Skills Parsing</h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Upload your PDF resume. SkillForge extracts your skills, analyzes structure, and verifies ATS readiness.
          </p>
        </div>

        <Link to="/skill-gap">
          <Button variant="outline" className="flex items-center gap-2 text-xs">
            <span>Go to Skill Gap Analysis</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-500/30 text-red-300 rounded-xl flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 rounded-xl flex items-center gap-3 text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
          <span>{success}</span>
        </div>
      )}

      {/* Upload Zone */}
      <Card className="border-dashed border-2 border-slate-800 hover:border-sky-500/50 transition-colors p-8 text-center bg-slate-900/40">
        <input
          type="file"
          id="resume-file-input"
          accept=".pdf"
          className="hidden"
          onChange={handleFileUpload}
          disabled={uploading}
        />
        <label
          htmlFor="resume-file-input"
          className="cursor-pointer flex flex-col items-center justify-center space-y-3"
        >
          <div className="p-4 bg-sky-500/10 text-sky-400 rounded-2xl">
            <UploadCloud className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <p className="text-base font-semibold text-slate-200">
              {uploading ? 'Analyzing Resume with PyPDF & AI...' : 'Click to upload your Resume PDF'}
            </p>
            <p className="text-xs text-slate-400">Standard PDF documents up to 5MB</p>
          </div>
          <Button variant="primary" disabled={uploading} className="mt-2 text-xs">
            {uploading ? 'Processing...' : 'Select PDF File'}
          </Button>
        </label>
      </Card>

      {/* Main Content Grid: History & Active Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Resumes List Sidebar */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Uploaded Resumes ({resumes.length})
          </h2>
          {loading ? (
            <div className="text-slate-500 text-xs py-8 text-center">Loading resumes...</div>
          ) : resumes.length === 0 ? (
            <Card className="text-center py-8">
              <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-slate-400 text-xs">No resumes uploaded yet.</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {resumes.map((r) => {
                const isSelected = selectedResume?.id === r.id;
                return (
                  <div
                    key={r.id}
                    onClick={() => setSelectedResume(r)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-sky-950/40 border-sky-500/50 shadow-md shadow-sky-950/50'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-2 rounded-lg bg-slate-800 text-sky-400 shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="truncate text-left">
                        <p className="text-xs font-semibold text-slate-200 truncate">
                          {r.original_filename}
                        </p>
                        <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(r.created_at).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{(r.file_size / 1024).toFixed(0)} KB</span>
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(r.id);
                      }}
                      className="text-slate-500 hover:text-red-400 p-1.5 rounded transition-colors"
                      title="Delete Resume"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Resume Detail Card */}
        <div className="lg:col-span-2 space-y-6">
          {selectedResume && selectedResume.analysis ? (
            <Card className="space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-slate-100">
                      {selectedResume.analysis.candidate_name || 'Candidate Resume'}
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                      {selectedResume.analysis.is_ai_generated ? 'AI Verified' : 'Rule Engine Analyzed'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 max-w-xl">
                    {selectedResume.analysis.professional_summary || 'No professional summary extracted.'}
                  </p>
                </div>
              </div>

              {/* Technical Skills */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Detected Technical Skills ({selectedResume.analysis.technical_skills.length})</span>
                </h4>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedResume.analysis.technical_skills.length === 0 ? (
                    <span className="text-xs text-slate-500 italic">No technical skills detected</span>
                  ) : (
                    selectedResume.analysis.technical_skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-sky-300 font-medium"
                      >
                        {skill}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Strengths */}
              {selectedResume.analysis.strengths.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Identified Strengths</span>
                  </h4>
                  <ul className="space-y-1.5">
                    {selectedResume.analysis.strengths.map((str, idx) => (
                      <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Missing Sections Alert */}
              {selectedResume.analysis.missing_sections.length > 0 && (
                <div className="p-4 bg-amber-950/20 border border-amber-500/20 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Missing Sections</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedResume.analysis.missing_sections.map((sec, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300"
                      >
                        {sec}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {selectedResume.analysis.improvement_suggestions.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Improvement Suggestions</span>
                  </h4>
                  <ul className="space-y-2">
                    {selectedResume.analysis.improvement_suggestions.map((sug, idx) => (
                      <li
                        key={idx}
                        className="text-xs text-slate-300 bg-slate-950/80 p-3 rounded-lg border border-slate-900"
                      >
                        {sug}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          ) : (
            <Card className="text-center py-16">
              <FileText className="w-12 h-12 text-slate-700 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-300">No Resume Selected</h3>
              <p className="text-xs text-slate-500 mt-1">Upload a PDF or select a resume from the list to view analysis.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

