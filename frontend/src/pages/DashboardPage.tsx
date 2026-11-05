import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { profileService } from '../services/profileService';
import { featureService } from '../services/featureService';
import type { CareerProfile, UserSkill, CareerGoal, DashboardSummary } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import {
  User,
  Target,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  Compass,
  FileText,
  Briefcase,
  CheckCircle2
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<CareerProfile | null>(null);
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [goals, setGoals] = useState<CareerGoal[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  const fetchDashboardData = async () => {
    try {
      const [profData, uSkills, userGoals, sumData] = await Promise.all([
        profileService.getProfile(),
        profileService.getUserSkills(),
        profileService.getGoals(),
        featureService.getDashboardSummary(),
      ]);
      setProfile(profData);
      setUserSkills(uSkills);
      setGoals(userGoals);
      setSummary(sumData);
    } catch (err: any) {
      console.error('Error fetching dashboard summary data:', err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const completionPct = profile ? profile.completion_percentage : 0;
  const primaryGoal = goals.find((g) => g.is_primary) || goals[0];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 px-4 py-8 max-w-7xl mx-auto space-y-8">
      {/* Welcome Banner */}
      <div className="p-8 bg-gradient-to-r from-sky-950/60 via-slate-900 to-indigo-950/60 border border-sky-500/20 rounded-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-500/10 border border-sky-500/30 rounded-full text-sky-400 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Career Intelligence Dashboard</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-100">
              Welcome back, <span className="text-sky-400">{user?.full_name || 'Developer'}</span>!
            </h1>
            <p className="text-slate-400 mt-2 text-sm max-w-2xl">
              SkillForge AI tracks your career goals, extracts technical competencies, benchmarks job match scores, and builds daily roadmaps.
            </p>
          </div>

          <div className="px-4 py-3 bg-slate-900/80 border border-slate-800 rounded-xl text-xs space-y-1">
            <p className="text-slate-400 font-medium">Logged in as:</p>
            <p className="text-slate-200 font-semibold">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Suggested Next Action Banner */}
      {summary?.suggested_next_action && (
        <div className="p-5 bg-gradient-to-r from-sky-950/40 via-slate-900 to-indigo-950/30 border border-sky-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-500/10 text-sky-400 rounded-xl shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-sky-400">Recommended Next Step</p>
              <p className="text-sm font-semibold text-slate-200 mt-0.5">{summary.suggested_next_action}</p>
            </div>
          </div>

          <div className="shrink-0 flex gap-2">
            {!summary.latest_resume && (
              <Link to="/resumes">
                <Button variant="primary" className="text-xs flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Upload Resume</span>
                </Button>
              </Link>
            )}
            {summary.latest_resume && !summary.latest_job && (
              <Link to="/skill-gap">
                <Button variant="primary" className="text-xs flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Add Target Job</span>
                </Button>
              </Link>
            )}
            {summary.latest_job && !summary.latest_skill_gap && (
              <Link to="/skill-gap">
                <Button variant="primary" className="text-xs flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" />
                  <span>Analyze Skill Gap</span>
                </Button>
              </Link>
            )}
            {summary.latest_skill_gap && !summary.active_roadmap && (
              <Link to="/roadmap">
                <Button variant="primary" className="text-xs flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Build Roadmap</span>
                </Button>
              </Link>
            )}
            {summary.active_roadmap && (
              <Link to="/roadmap">
                <Button variant="primary" className="text-xs flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5" />
                  <span>View Roadmap</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Profile Completion Callout Banner (if incomplete) */}
      {(!profile || completionPct < 100) && (
        <div className="p-6 bg-slate-900 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">
                {profile ? 'Complete Your Career Profile' : 'Setup Your Career Profile'}
              </h3>
              <p className="text-slate-400 text-sm mt-1 max-w-xl">
                Complete your career profile to unlock personalized SkillForge AI recommendations.
              </p>
              <div className="mt-3 flex items-center gap-3 w-full max-w-xs">
                <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 transition-all duration-500"
                    style={{ width: `${completionPct}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-amber-400">{completionPct}%</span>
              </div>
            </div>
          </div>

          <Link to="/profile">
            <Button variant="primary" className="whitespace-nowrap flex items-center gap-2">
              <span>{profile ? 'Edit Profile' : 'Complete Profile'}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      )}

      {/* Primary Metrics Grid (4 Core Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 1. Resume Metric */}
        <Card className="hover:border-slate-800 transition-colors flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-sky-500/10 text-sky-400 rounded-xl">
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-sky-400">
                Resume
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-100">AI Resume Parser</h3>
            {summary?.latest_resume ? (
              <div className="mt-2 space-y-1">
                <p className="text-xs text-slate-300 font-semibold truncate">
                  {summary.latest_resume.original_filename}
                </p>
                <p className="text-[11px] text-emerald-400">
                  {summary.latest_resume.analysis?.technical_skills.length || 0} skills detected
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-500 mt-2">No resume uploaded yet.</p>
            )}
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800">
            <Link to="/resumes">
              <Button variant="outline" fullWidth className="text-xs">
                {summary?.latest_resume ? 'View Resume Analysis' : 'Upload Resume'}
              </Button>
            </Link>
          </div>
        </Card>

        {/* 2. Target Job & Gap Match Metric */}
        <Card className="hover:border-slate-800 transition-colors flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
                <Target className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-emerald-400">
                Match Score
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-100">Role Match Fit</h3>
            {summary?.latest_skill_gap ? (
              <div className="mt-2 space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-emerald-400">
                    {Math.round(summary.latest_skill_gap.match_score)}%
                  </span>
                  <span className="text-xs text-slate-400">compatibility</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {summary.latest_skill_gap.missing_skills.length} missing skill gaps
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-500 mt-2">No skill gap run yet.</p>
            )}
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800">
            <Link to="/skill-gap">
              <Button variant="outline" fullWidth className="text-xs">
                {summary?.latest_skill_gap ? 'View Skill Gap' : 'Analyze Job Fit'}
              </Button>
            </Link>
          </div>
        </Card>

        {/* 3. Learning Roadmap Metric */}
        <Card className="hover:border-slate-800 transition-colors flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl">
                <Compass className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-indigo-400">
                Curriculum
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-100">Active Roadmap</h3>
            {summary?.active_roadmap ? (
              <div className="mt-2 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Progress</span>
                  <span className="font-bold text-indigo-400">{summary.roadmap_progress_percentage}%</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 transition-all duration-300"
                    style={{ width: `${summary.roadmap_progress_percentage}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  {summary.tasks_completed_count} / {summary.tasks_total_count} tasks done
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-500 mt-2">No roadmap generated yet.</p>
            )}
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800">
            <Link to="/roadmap">
              <Button variant="outline" fullWidth className="text-xs">
                {summary?.active_roadmap ? 'Continue Learning' : 'Generate Roadmap'}
              </Button>
            </Link>
          </div>
        </Card>

        {/* 4. Target Role Goal */}
        <Card className="hover:border-slate-800 transition-colors flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl">
                <Briefcase className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-amber-400">
                Goal
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-100">Target Role</h3>
            <p className="text-sm font-extrabold text-amber-400 mt-2 truncate">
              {summary?.target_role || primaryGoal?.target_role || profile?.target_role || 'Not Set'}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {profile?.college ? `${profile.college} (${profile.graduation_year || ''})` : 'Set in Career Profile'}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800">
            <Link to="/profile">
              <Button variant="outline" fullWidth className="text-xs">
                Manage Profile & Goals
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Secondary Detailed Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Career Profile Summary */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-sky-400" />
              <h3 className="text-base font-bold text-slate-100">Career Profile & Technical Skills</h3>
            </div>
            <Link to="/profile" className="text-xs text-sky-400 hover:underline">
              Edit
            </Link>
          </div>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-lg border border-slate-900">
              <div>
                <span className="text-slate-500 block text-[10px]">Candidate:</span>
                <span className="font-semibold text-slate-200">{profile?.full_name || user?.full_name}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Academic Year:</span>
                <span className="font-semibold text-slate-200">{profile?.current_year || 'Not specified'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">College:</span>
                <span className="font-semibold text-slate-200">{profile?.college || 'Not set'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">CGPA:</span>
                <span className="font-semibold text-slate-200">{profile?.cgpa || 'N/A'}</span>
              </div>
            </div>

            <div>
              <p className="text-[11px] font-semibold text-slate-400 mb-1.5">
                Claimed Skills ({userSkills.length}):
              </p>
              <div className="flex flex-wrap gap-1">
                {userSkills.length === 0 ? (
                  <span className="text-xs text-slate-500 italic">No skills claimed in profile yet.</span>
                ) : (
                  userSkills.slice(0, 10).map((us) => (
                    <span
                      key={us.id}
                      className="text-[11px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-200 font-medium"
                    >
                      {us.skill.name} ({us.proficiency_level})
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Active Roadmap Tasks Snapshot */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-indigo-400" />
              <h3 className="text-base font-bold text-slate-100">Study Roadmap Tasks</h3>
            </div>
            <Link to="/roadmap" className="text-xs text-indigo-400 hover:underline">
              Full Schedule
            </Link>
          </div>

          {summary?.active_roadmap && summary.active_roadmap.tasks.length > 0 ? (
            <div className="space-y-2">
              {summary.active_roadmap.tasks.slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
                    task.is_completed
                      ? 'bg-emerald-950/20 border-emerald-500/20 text-slate-400 line-through'
                      : 'bg-slate-950 border-slate-900 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      W{task.week_number}D{task.day_number}
                    </span>
                    <span className="font-semibold">{task.title}</span>
                  </div>
                  {task.is_completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <span className="text-[10px] text-slate-400">{task.estimated_duration_minutes}m</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-xs text-slate-500">No active roadmap created yet.</p>
              <Link to="/roadmap">
                <Button variant="primary" className="mt-3 text-xs">
                  Create Learning Roadmap
                </Button>
              </Link>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
