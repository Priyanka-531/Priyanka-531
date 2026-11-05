export interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface RegisterRequest {
  full_name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CareerProfile {
  id: string;
  user_id: string;
  full_name?: string;
  phone?: string;
  bio?: string;
  college?: string;
  degree?: string;
  branch?: string;
  graduation_year?: number;
  current_year?: string;
  cgpa?: number;
  experience_level?: string;
  preferred_work_mode?: string;
  preferred_locations?: string;
  target_role?: string;
  target_domain?: string;
  created_at: string;
  updated_at: string;
  completion_percentage: number;
}

export interface CareerProfileInput {
  full_name?: string;
  phone?: string;
  bio?: string;
  college?: string;
  degree?: string;
  branch?: string;
  graduation_year?: number;
  current_year?: string;
  cgpa?: number;
  experience_level?: string;
  preferred_work_mode?: string;
  preferred_locations?: string;
  target_role?: string;
  target_domain?: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  created_at: string;
}

export interface UserSkill {
  id: string;
  user_id: string;
  skill_id: string;
  skill: Skill;
  proficiency_level: string;
  years_of_experience: number;
  is_learning: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserSkillInput {
  skill_id?: string;
  skill_name?: string;
  proficiency_level: string;
  years_of_experience?: number;
  is_learning?: boolean;
}

export interface CareerGoal {
  id: string;
  user_id: string;
  target_role: string;
  target_company_type?: string;
  target_domain?: string;
  target_date?: string;
  priority: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface CareerGoalInput {
  target_role: string;
  target_company_type?: string;
  target_domain?: string;
  target_date?: string;
  priority?: string;
  is_primary?: boolean;
}

// --- Resume, Job, Skill Gap, Roadmap, & Dashboard Types ---

export interface ResumeAnalysis {
  id: string;
  resume_id: string;
  candidate_name?: string;
  professional_summary?: string;
  technical_skills: string[];
  soft_skills: string[];
  education: Array<{ institution?: string; degree?: string; year?: string }>;
  experience_projects: Array<{ title?: string; organization?: string; description?: string }>;
  strengths: string[];
  missing_sections: string[];
  improvement_suggestions: string[];
  is_ai_generated: boolean;
  created_at: string;
}

export interface Resume {
  id: string;
  user_id: string;
  filename: string;
  original_filename: string;
  file_size: number;
  is_scanned: boolean;
  created_at: string;
  analysis?: ResumeAnalysis;
}

export interface JobDescription {
  id: string;
  user_id: string;
  title: string;
  company_name?: string;
  raw_text: string;
  required_skills: string[];
  preferred_skills: string[];
  tools_frameworks: string[];
  experience_expectations?: string;
  education_requirements?: string;
  responsibilities: string[];
  teamwork_communication: string[];
  created_at: string;
}

export interface SkillGapAnalysis {
  id: string;
  user_id: string;
  job_id: string;
  resume_id?: string;
  match_score: number;
  matched_skills: string[];
  missing_skills: string[];
  partially_matched_skills: string[];
  unmet_requirements: string[];
  strengths_to_highlight: string[];
  recommended_actions: string[];
  created_at: string;
}

export interface RoadmapTask {
  id: string;
  roadmap_id: string;
  week_number: number;
  day_number: number;
  title: string;
  explanation: string;
  skill_category: string;
  estimated_duration_minutes: number;
  resource_name?: string;
  resource_url?: string;
  is_completed: boolean;
  completed_at?: string;
  created_at: string;
}

export interface Roadmap {
  id: string;
  user_id: string;
  title: string;
  target_role: string;
  summary?: string;
  total_weeks: number;
  daily_hours: number;
  created_at: string;
  tasks: RoadmapTask[];
}

export interface DashboardSummary {
  target_role?: string;
  latest_resume?: Resume;
  latest_job?: JobDescription;
  latest_skill_gap?: SkillGapAnalysis;
  active_roadmap?: Roadmap;
  tasks_completed_count: number;
  tasks_total_count: number;
  roadmap_progress_percentage: number;
  suggested_next_action: string;
}
