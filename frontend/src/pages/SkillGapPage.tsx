import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { featureService } from '../services/featureService';
import type { JobDescription, Resume, SkillGapAnalysis } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import {
  Target,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Briefcase,
  Layers,
  HelpCircle
} from 'lucide-react';

export const SkillGapPage: React.FC = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<JobDescription[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');

  // Form states for adding new job posting
  const [showAddJob, setShowAddJob] = useState<boolean>(false);
  const [newJobTitle, setNewJobTitle] = useState<string>('');
  const [newCompany, setNewCompany] = useState<string>('');
  const [newRawText, setNewRawText] = useState<string>('');

  const [activeAnalysis, setActiveAnalysis] = useState<SkillGapAnalysis | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [jobsData, resumesData, gapHistory] = await Promise.all([
        featureService.getJobs(),
        featureService.getResumes(),
        featureService.getSkillGaps(),
      ]);
      setJobs(jobsData);
      setResumes(resumesData);

      if (jobsData.length > 0) {
        setSelectedJobId(jobsData[0].id);
      }
      if (resumesData.length > 0) {
        setSelectedResumeId(resumesData[0].id);
      }
      if (gapHistory.length > 0) {
        setActiveAnalysis(gapHistory[0]);
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to load initial data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateAndAnalyzeJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRawText.trim()) return;

    try {
      setSubmitting(true);
      setError(null);
      const createdJob = await featureService.analyzeJob({
        title: newJobTitle || 'Software Engineer',
        company_name: newCompany,
        raw_text: newRawText,
      });
      setJobs((prev) => [createdJob, ...prev]);
      setSelectedJobId(createdJob.id);
      setShowAddJob(false);
      setNewRawText('');

      // Auto trigger skill gap
      const gap = await featureService.analyzeSkillGap({
        job_id: createdJob.id,
        resume_id: selectedResumeId || undefined,
      });
      setActiveAnalysis(gap);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to analyze job posting.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRunGapAnalysis = async () => {
    if (!selectedJobId) {
      setError('Please select or add a target job.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const gap = await featureService.analyzeSkillGap({
        job_id: selectedJobId,
        resume_id: selectedResumeId || undefined,
      });
      setActiveAnalysis(gap);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to calculate skill gap.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerateRoadmap = async () => {
    if (!activeAnalysis) return;
    try {
      setSubmitting(true);
      const selectedJob = jobs.find((j) => j.id === activeAnalysis.job_id);
      await featureService.generateRoadmap({
        target_role: selectedJob?.title || 'Software Engineer',
        missing_skills: activeAnalysis.missing_skills,
        total_weeks: 4,
        daily_hours: 2,
      });
      navigate('/roadmap');
    } catch (err: any) {
      setError('Failed to generate roadmap from missing skills.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 px-4 py-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 text-xs font-semibold mb-2">
            <Target className="w-3.5 h-3.5" />
            <span>Target Role & Skill Benchmarking</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-100">Skill Gap Analysis</h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Compare your resume skills against target job descriptions. Identify missing competencies and generate a personalized bridge roadmap.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setShowAddJob(!showAddJob)}
          className="flex items-center gap-2 text-xs"
        >
          <Briefcase className="w-4 h-4" />
          <span>{showAddJob ? 'Close Job Input' : '+ Add Target Job'}</span>
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-500/30 text-red-300 rounded-xl flex items-center gap-3 text-sm">
          <AlertTriangle className="w-5 h-5 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Add Job Form Drawer/Card */}
      {showAddJob && (
        <Card className="bg-slate-900/90 border-sky-500/30">
          <h3 className="text-base font-bold text-slate-100 mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <span>Analyze New Target Job Posting</span>
          </h3>
          <form onSubmit={handleCreateAndAnalyzeJob} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Target Job Title</label>
                <input
                  type="text"
                  placeholder="e.g. Full Stack Python Developer"
                  value={newJobTitle}
                  onChange={(e) => setNewJobTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-sky-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Company / Organization (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Stripe, Amazon, Startup"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Paste Job Description / Requirements
              </label>
              <textarea
                rows={5}
                placeholder="Paste the full job description or key responsibilities and required qualifications here..."
                value={newRawText}
                onChange={(e) => setNewRawText(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-sky-500"
                required
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setShowAddJob(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? 'Extracting & Benchmarking...' : 'Extract Skills & Compare'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Selectors Bar */}
      <Card className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Target Job</label>
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-sky-500"
          >
            {jobs.length === 0 ? (
              <option value="">No jobs saved yet</option>
            ) : (
              jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title} {j.company_name ? `(${j.company_name})` : ''}
                </option>
              ))
            )}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Candidate Resume (or Profile Skills)</label>
          <select
            value={selectedResumeId}
            onChange={(e) => setSelectedResumeId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-sky-500"
          >
            <option value="">Use Claimed Profile Skills</option>
            {resumes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.original_filename} ({new Date(r.created_at).toLocaleDateString()})
              </option>
            ))}
          </select>
        </div>

        <div className="md:pt-5">
          <Button
            variant="primary"
            fullWidth
            onClick={handleRunGapAnalysis}
            disabled={submitting || jobs.length === 0}
            className="text-xs"
          >
            {submitting ? 'Calculating...' : 'Run Skill Gap Analysis'}
          </Button>
        </div>
      </Card>

      {/* Analysis Results Display */}
      {loading ? (
        <div className="text-center py-12 text-slate-500 text-sm">Loading analysis...</div>
      ) : activeAnalysis ? (
        <div className="space-y-6">
          {/* Top Score Banner */}
          <div className="p-6 bg-gradient-to-r from-slate-900 via-sky-950/40 to-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              {/* Circular Match Gauge */}
              <div className="relative w-24 h-24 shrink-0 flex items-center justify-center rounded-full bg-slate-950 border-4 border-emerald-500/80 shadow-lg shadow-emerald-500/20">
                <span className="text-2xl font-black text-emerald-400">
                  {Math.round(activeAnalysis.match_score)}%
                </span>
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Skill Match Rating
                </span>
                <h2 className="text-2xl font-extrabold text-slate-100 mt-0.5">
                  {activeAnalysis.match_score >= 80
                    ? 'Excellent Role Fit'
                    : activeAnalysis.match_score >= 50
                    ? 'Moderate Match with Growth Areas'
                    : 'Critical Skill Gaps Identified'}
                </h2>
                <p className="text-xs text-slate-400 mt-1 max-w-lg">
                  {activeAnalysis.matched_skills.length} skills matched out of{' '}
                  {activeAnalysis.matched_skills.length + activeAnalysis.missing_skills.length} role requirements.
                </p>
              </div>
            </div>

            <Button
              variant="primary"
              onClick={handleGenerateRoadmap}
              disabled={submitting || activeAnalysis.missing_skills.length === 0}
              className="flex items-center gap-2 text-xs whitespace-nowrap bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20"
            >
              <span>Build Roadmap for Missing Skills</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Breakdown Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Matched Skills */}
            <Card>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-100">
                  Matched Skills ({activeAnalysis.matched_skills.length})
                </h3>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {activeAnalysis.matched_skills.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No exact skill matches identified yet.</p>
                ) : (
                  activeAnalysis.matched_skills.map((s, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2.5 py-1 rounded-md bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 font-medium"
                    >
                      {s}
                    </span>
                  ))
                )}
              </div>
            </Card>

            {/* Missing Skills */}
            <Card>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-slate-100">
                  Missing Critical Skills ({activeAnalysis.missing_skills.length})
                </h3>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {activeAnalysis.missing_skills.length === 0 ? (
                  <p className="text-xs text-emerald-400 italic">No missing skills detected! You meet all listed requirements.</p>
                ) : (
                  activeAnalysis.missing_skills.map((s, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2.5 py-1 rounded-md bg-amber-950/40 border border-amber-500/30 text-amber-300 font-medium"
                    >
                      {s}
                    </span>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Recommendations */}
          {activeAnalysis.recommended_actions.length > 0 && (
            <Card className="space-y-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-400" />
                <span>Recommended Bridge Actions</span>
              </h3>
              <ul className="space-y-2">
                {activeAnalysis.recommended_actions.map((rec, idx) => (
                  <li
                    key={idx}
                    className="text-xs text-slate-300 bg-slate-950/80 p-3 rounded-lg border border-slate-900 flex items-start gap-2"
                  >
                    <span className="text-sky-400 font-bold">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      ) : (
        <Card className="text-center py-16">
          <HelpCircle className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-300">No Analysis Calculated</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Click "+ Add Target Job" or choose an existing role and run the analysis to benchmark your qualifications.
          </p>
        </Card>
      )}
    </div>
  );
};
