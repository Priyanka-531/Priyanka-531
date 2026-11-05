import React, { useState, useEffect } from 'react';
import { featureService } from '../services/featureService';
import type { Roadmap, RoadmapTask } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import {
  Compass,
  Clock,
  ExternalLink,
  Sparkles,
  Calendar,
  AlertCircle
} from 'lucide-react';

export const RoadmapPage: React.FC = () => {
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showGenModal, setShowGenModal] = useState<boolean>(false);

  // Generation form
  const [targetRole, setTargetRole] = useState<string>('Full Stack Developer');
  const [totalWeeks, setTotalWeeks] = useState<number>(4);
  const [dailyHours, setDailyHours] = useState<number>(2);
  const [missingSkillsInput, setMissingSkillsInput] = useState<string>('Docker, PostgreSQL, FastAPI, React');

  const fetchActiveRoadmap = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await featureService.getActiveRoadmap();
      setRoadmap(data);
    } catch (err: any) {
      // 404 means no active roadmap yet
      if (err?.response?.status !== 404) {
        setError(err?.response?.data?.detail || 'Failed to load active roadmap');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveRoadmap();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setGenerating(true);
      setError(null);
      const skills = missingSkillsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const created = await featureService.generateRoadmap({
        target_role: targetRole,
        missing_skills: skills,
        total_weeks: totalWeeks,
        daily_hours: dailyHours,
      });
      setRoadmap(created);
      setShowGenModal(false);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to generate roadmap');
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleTask = async (taskId: string, currentStatus: boolean) => {
    if (!roadmap) return;
    try {
      const updatedTask = await featureService.toggleTask(taskId, !currentStatus);
      setRoadmap((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          tasks: prev.tasks.map((t) => (t.id === taskId ? updatedTask : t)),
        };
      });
    } catch (err: any) {
      console.error('Failed to toggle task:', err);
    }
  };

  const tasksTotal = roadmap?.tasks?.length || 0;
  const tasksCompleted = roadmap?.tasks?.filter((t) => t.is_completed).length || 0;
  const progressPct = tasksTotal > 0 ? Math.round((tasksCompleted / tasksTotal) * 100) : 0;

  // Group tasks by week_number
  const tasksByWeek: { [key: number]: RoadmapTask[] } = {};
  if (roadmap?.tasks) {
    roadmap.tasks.forEach((task) => {
      if (!tasksByWeek[task.week_number]) {
        tasksByWeek[task.week_number] = [];
      }
      tasksByWeek[task.week_number].push(task);
    });
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 px-4 py-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-500/10 border border-sky-500/30 rounded-full text-sky-400 text-xs font-semibold mb-2">
            <Compass className="w-3.5 h-3.5" />
            <span>Interactive Learning Curriculum</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-100">Personalized Study Roadmap</h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Day-by-day technical tasks mapped to authoritative documentation and hands-on milestones.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setShowGenModal(!showGenModal)}
          className="flex items-center gap-2 text-xs"
        >
          <Sparkles className="w-4 h-4" />
          <span>{roadmap ? 'Generate New Roadmap' : 'Generate Roadmap'}</span>
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-500/30 text-red-300 rounded-xl flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Generation Drawer / Modal */}
      {showGenModal && (
        <Card className="bg-slate-900/90 border-sky-500/30">
          <h3 className="text-base font-bold text-slate-100 mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <span>Generate Curriculum</span>
          </h3>
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Target Role</label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-sky-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Total Duration</label>
                <select
                  value={totalWeeks}
                  onChange={(e) => setTotalWeeks(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-sky-500"
                >
                  <option value={2}>2 Weeks (Accelerated)</option>
                  <option value={4}>4 Weeks (Standard)</option>
                  <option value={6}>6 Weeks (In-Depth)</option>
                  <option value={8}>8 Weeks (Mastery)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Daily Study Commitment</label>
                <select
                  value={dailyHours}
                  onChange={(e) => setDailyHours(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-sky-500"
                >
                  <option value={1}>1 hour / day</option>
                  <option value={2}>2 hours / day</option>
                  <option value={3}>3 hours / day</option>
                  <option value={4}>4 hours / day</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Target Missing Skills (Comma separated)
              </label>
              <input
                type="text"
                value={missingSkillsInput}
                onChange={(e) => setMissingSkillsInput(e.target.value)}
                placeholder="Docker, PostgreSQL, FastAPI, React, CI/CD"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-sky-500"
                required
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setShowGenModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={generating}>
                {generating ? 'Generating Schedule...' : 'Build Roadmap'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-16 text-slate-500 text-sm">Loading roadmap...</div>
      ) : roadmap ? (
        <div className="space-y-8">
          {/* Progress Header Card */}
          <div className="p-6 bg-gradient-to-r from-sky-950/40 via-slate-900 to-indigo-950/40 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-extrabold text-slate-100">{roadmap.title}</h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 font-bold border border-sky-500/20">
                  {roadmap.total_weeks} Weeks • {roadmap.daily_hours} hrs/day
                </span>
              </div>
              <p className="text-xs text-slate-400 max-w-xl">{roadmap.summary}</p>
            </div>

            <div className="w-full md:w-64 space-y-2 bg-slate-950/80 p-4 rounded-xl border border-slate-900">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Roadmap Progress</span>
                <span className="font-extrabold text-emerald-400">{progressPct}%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 text-right">
                {tasksCompleted} of {tasksTotal} tasks completed
              </p>
            </div>
          </div>

          {/* Week by Week Schedule */}
          <div className="space-y-8">
            {Object.keys(tasksByWeek)
              .map(Number)
              .sort((a, b) => a - b)
              .map((weekNum) => {
                const weekTasks = tasksByWeek[weekNum];
                const weekCompleted = weekTasks.filter((t) => t.is_completed).length;

                return (
                  <div key={weekNum} className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-sky-400" />
                        <h3 className="text-base font-bold text-slate-200">Week {weekNum}</h3>
                      </div>
                      <span className="text-xs font-semibold text-slate-400">
                        {weekCompleted} / {weekTasks.length} Completed
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {weekTasks.map((task) => (
                        <div
                          key={task.id}
                          className={`p-5 rounded-xl border transition-all flex flex-col justify-between ${
                            task.is_completed
                              ? 'bg-emerald-950/10 border-emerald-500/30 opacity-90'
                              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-extrabold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                                  Day {task.day_number}
                                </span>
                                <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-sky-950/50 text-sky-400 border border-sky-800/30">
                                  {task.skill_category}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                                <Clock className="w-3 h-3" />
                                <span>{task.estimated_duration_minutes}m</span>
                              </div>
                            </div>

                            <div>
                              <h4
                                className={`text-sm font-bold ${
                                  task.is_completed ? 'line-through text-slate-400' : 'text-slate-100'
                                }`}
                              >
                                {task.title}
                              </h4>
                              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                {task.explanation}
                              </p>
                            </div>
                          </div>

                          <div className="pt-4 mt-3 border-t border-slate-800/60 flex items-center justify-between gap-2">
                            {task.resource_url ? (
                              <a
                                href={task.resource_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 hover:underline"
                              >
                                <span>{task.resource_name || 'Official Documentation'}</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : (
                              <span />
                            )}

                            <label className="flex items-center gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={task.is_completed}
                                onChange={() => handleToggleTask(task.id, task.is_completed)}
                                className="w-4 h-4 rounded text-emerald-500 bg-slate-800 border-slate-700 focus:ring-emerald-500 focus:ring-offset-slate-900"
                              />
                              <span
                                className={`text-xs font-semibold ${
                                  task.is_completed ? 'text-emerald-400' : 'text-slate-400'
                                }`}
                              >
                                {task.is_completed ? 'Done' : 'Mark Complete'}
                              </span>
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      ) : (
        <Card className="text-center py-16">
          <Compass className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-300">No Active Roadmap Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Generate your personalized curriculum to get daily study schedules tailored to your target engineering roles.
          </p>
          <Button
            variant="primary"
            onClick={() => setShowGenModal(true)}
            className="mt-4 text-xs"
          >
            Create My Roadmap
          </Button>
        </Card>
      )}
    </div>
  );
};
