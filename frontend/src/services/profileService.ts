import api from './api';
import type {
  CareerProfile,
  CareerProfileInput,
  Skill,
  UserSkill,
  UserSkillInput,
  CareerGoal,
  CareerGoalInput
} from '../types';

export const profileService = {
  // Career Profile
  async getProfile(): Promise<CareerProfile | null> {
    try {
      const response = await api.get<CareerProfile>('/profile');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  async createProfile(data: CareerProfileInput): Promise<CareerProfile> {
    const response = await api.post<CareerProfile>('/profile', data);
    return response.data;
  },

  async updateProfile(data: CareerProfileInput): Promise<CareerProfile> {
    const response = await api.put<CareerProfile>('/profile', data);
    return response.data;
  },

  // Catalog Skills & User Skills
  async getSkills(category?: string, q?: string): Promise<Skill[]> {
    const params: Record<string, string> = {};
    if (category) params.category = category;
    if (q) params.q = q;
    const response = await api.get<Skill[]>('/skills', { params });
    return response.data;
  },

  async getUserSkills(): Promise<UserSkill[]> {
    const response = await api.get<UserSkill[]>('/profile/skills');
    return response.data;
  },

  async addUserSkill(data: UserSkillInput): Promise<UserSkill> {
    const response = await api.post<UserSkill>('/profile/skills', data);
    return response.data;
  },

  async updateUserSkill(userSkillId: string, data: Partial<UserSkillInput>): Promise<UserSkill> {
    const response = await api.put<UserSkill>(`/profile/skills/${userSkillId}`, data);
    return response.data;
  },

  async removeUserSkill(userSkillId: string): Promise<void> {
    await api.delete(`/profile/skills/${userSkillId}`);
  },

  // Career Goals
  async getGoals(): Promise<CareerGoal[]> {
    const response = await api.get<CareerGoal[]>('/goals');
    return response.data;
  },

  async createGoal(data: CareerGoalInput): Promise<CareerGoal> {
    const response = await api.post<CareerGoal>('/goals', data);
    return response.data;
  },

  async updateGoal(goalId: string, data: Partial<CareerGoalInput>): Promise<CareerGoal> {
    const response = await api.put<CareerGoal>(`/goals/${goalId}`, data);
    return response.data;
  },

  async deleteGoal(goalId: string): Promise<void> {
    await api.delete(`/goals/${goalId}`);
  }
};
