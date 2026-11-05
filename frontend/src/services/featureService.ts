import api from './api';
import type {
  Resume,
  JobDescription,
  SkillGapAnalysis,
  Roadmap,
  RoadmapTask,
  DashboardSummary
} from '../types';

export const featureService = {
  // Dashboard Summary
  async getDashboardSummary(): Promise<DashboardSummary> {
    const res = await api.get<DashboardSummary>('/dashboard/summary');
    return res.data;
  },

  // Resumes
  async uploadResume(file: File): Promise<Resume> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post<Resume>('/resumes/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  async getResumes(): Promise<Resume[]> {
    const res = await api.get<Resume[]>('/resumes');
    return res.data;
  },

  async getResume(id: string): Promise<Resume> {
    const res = await api.get<Resume>(`/resumes/${id}`);
    return res.data;
  },

  async deleteResume(id: string): Promise<void> {
    await api.delete(`/resumes/${id}`);
  },

  // Jobs
  async analyzeJob(data: { title?: string; company_name?: string; raw_text: string }): Promise<JobDescription> {
    const res = await api.post<JobDescription>('/jobs/analyze', data);
    return res.data;
  },

  async getJobs(): Promise<JobDescription[]> {
    const res = await api.get<JobDescription[]>('/jobs');
    return res.data;
  },

  async getJob(id: string): Promise<JobDescription> {
    const res = await api.get<JobDescription>(`/jobs/${id}`);
    return res.data;
  },

  // Skill Gap Analysis
  async analyzeSkillGap(data: { job_id: string; resume_id?: string }): Promise<SkillGapAnalysis> {
    const res = await api.post<SkillGapAnalysis>('/skill-gap/analyze', data);
    return res.data;
  },

  async getSkillGaps(): Promise<SkillGapAnalysis[]> {
    const res = await api.get<SkillGapAnalysis[]>('/skill-gap');
    return res.data;
  },

  async getSkillGap(id: string): Promise<SkillGapAnalysis> {
    const res = await api.get<SkillGapAnalysis>(`/skill-gap/${id}`);
    return res.data;
  },

  // Roadmaps
  async generateRoadmap(data: {
    target_role?: string;
    missing_skills?: string[];
    daily_hours?: number;
    total_weeks?: number;
  }): Promise<Roadmap> {
    const res = await api.post<Roadmap>('/roadmaps/generate', data);
    return res.data;
  },

  async getRoadmaps(): Promise<Roadmap[]> {
    const res = await api.get<Roadmap[]>('/roadmaps');
    return res.data;
  },

  async getActiveRoadmap(): Promise<Roadmap> {
    const res = await api.get<Roadmap>('/roadmaps/active');
    return res.data;
  },

  async toggleTask(taskId: string, isCompleted: boolean): Promise<RoadmapTask> {
    const res = await api.patch<RoadmapTask>(`/roadmaps/tasks/${taskId}`, {
      is_completed: isCompleted,
    });
    return res.data;
  },
};

