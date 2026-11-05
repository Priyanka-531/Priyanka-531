import React, { useState, useEffect } from 'react';
import { profileService } from '../services/profileService';
import type { CareerProfile, Skill, UserSkill, CareerGoal, CareerProfileInput } from '../types';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import {
  User,
  GraduationCap,
  Briefcase,
  Code,
  Target,
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
  Star,
  CheckCircle,
  AlertCircle,
  Search,
  Sparkles
} from 'lucide-react';
import { getErrorMessage } from '../utils/errors';

export const CareerProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<CareerProfile | null>(null);
  const [catalogSkills, setCatalogSkills] = useState<Skill[]>([]);
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [goals, setGoals] = useState<CareerGoal[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [savingProfile, setSavingProfile] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Profile Form state - allows string for smooth typing/clearing
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    bio: '',
    college: '',
    degree: '',
    branch: '',
    current_year: '3rd Year',
    graduation_year: '2026',
    cgpa: '8.5',
    experience_level: 'Beginner',
    preferred_work_mode: 'Remote',
    preferred_locations: '',
    target_role: 'Full Stack Developer',
    target_domain: 'Web Development'
  });

  // Skill Add Form State
  const [skillSearch, setSkillSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSkillName, setSelectedSkillName] = useState('');
  const [skillProficiency, setSkillProficiency] = useState('Intermediate');
  const [addingSkill, setAddingSkill] = useState(false);

  // Skill Edit State
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);
  const [editingSkillProficiency, setEditingSkillProficiency] = useState<string>('Intermediate');
  const [savingSkillEdit, setSavingSkillEdit] = useState<boolean>(false);

  // Goal Form State
  const [goalRole, setGoalRole] = useState('Full Stack Developer');
  const [goalDomain, setGoalDomain] = useState('Web Development');
  const [goalCompanyType, setGoalCompanyType] = useState('Product Based');
  const [goalDate, setGoalDate] = useState('2027');
  const [goalPriority, setGoalPriority] = useState('High');
  const [goalIsPrimary, setGoalIsPrimary] = useState(false);
  const [addingGoal, setAddingGoal] = useState(false);

  // Goal Edit State
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editGoalData, setEditGoalData] = useState({
    target_role: '',
    target_domain: '',
    target_company_type: '',
    target_date: '',
    priority: 'High',
  });
  const [savingGoalEdit, setSavingGoalEdit] = useState<boolean>(false);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [profData, catSkills, uSkills, userGoals] = await Promise.all([
        profileService.getProfile(),
        profileService.getSkills(),
        profileService.getUserSkills(),
        profileService.getGoals()
      ]);

      if (profData) {
        setProfile(profData);
        setFormData({
          full_name: profData.full_name || '',
          phone: profData.phone || '',
          bio: profData.bio || '',
          college: profData.college || '',
          degree: profData.degree || '',
          branch: profData.branch || '',
          current_year: profData.current_year || '3rd Year',
          graduation_year: profData.graduation_year ? String(profData.graduation_year) : '2026',
          cgpa: profData.cgpa ? String(profData.cgpa) : '8.5',
          experience_level: profData.experience_level || 'Beginner',
          preferred_work_mode: profData.preferred_work_mode || 'Remote',
          preferred_locations: profData.preferred_locations || '',
          target_role: profData.target_role || 'Full Stack Developer',
          target_domain: profData.target_domain || 'Web Development'
        });
      }
      setCatalogSkills(catSkills);
      setUserSkills(uSkills);
      setGoals(userGoals);
    } catch (err: any) {
      console.error('Error loading career profile data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // 1. Save Profile (College, Degree, Branch, CGPA, Grad Year, Role, Domain, etc.)
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setSavingProfile(true);

    try {
      const gradYearNum = formData.graduation_year ? parseInt(String(formData.graduation_year), 10) : undefined;
      const cgpaNum = formData.cgpa ? parseFloat(String(formData.cgpa)) : undefined;

      const profilePayload: CareerProfileInput = {
        full_name: formData.full_name.trim(),
        phone: formData.phone.trim(),
        bio: formData.bio.trim(),
        college: formData.college.trim(),
        degree: formData.degree.trim(),
        branch: formData.branch.trim(),
        current_year: formData.current_year,
        graduation_year: isNaN(gradYearNum as number) ? undefined : gradYearNum,
        cgpa: isNaN(cgpaNum as number) ? undefined : cgpaNum,
        experience_level: formData.experience_level,
        preferred_work_mode: formData.preferred_work_mode,
        preferred_locations: formData.preferred_locations.trim(),
        target_role: formData.target_role.trim(),
        target_domain: formData.target_domain.trim()
      };

      let updatedProfile: CareerProfile;
      if (profile) {
        updatedProfile = await profileService.updateProfile(profilePayload);
      } else {
        updatedProfile = await profileService.createProfile(profilePayload);
      }
      setProfile(updatedProfile);
      setFeedback({ type: 'success', message: 'Career Profile saved successfully!' });
    } catch (err: any) {
      const msg = getErrorMessage(err, 'Failed to save profile.');
      setFeedback({ type: 'error', message: msg });
    } finally {
      setSavingProfile(false);
    }
  };

  // 2. Add Skill
  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSkillName.trim()) return;

    try {
      setAddingSkill(true);
      const newSkill = await profileService.addUserSkill({
        skill_name: selectedSkillName.trim(),
        proficiency_level: skillProficiency
      });
      setUserSkills([...userSkills, newSkill]);
      setSelectedSkillName('');
      setSkillSearch('');
      setFeedback({ type: 'success', message: `Added skill '${newSkill.skill.name}' (${newSkill.proficiency_level})!` });
    } catch (err: any) {
      const msg = getErrorMessage(err, 'Failed to add skill.');
      setFeedback({ type: 'error', message: msg });
    } finally {
      setAddingSkill(false);
    }
  };

  // 2. Edit Skill
  const handleStartEditSkill = (us: UserSkill) => {
    setEditingSkillId(us.id);
    setEditingSkillProficiency(us.proficiency_level);
  };

  const handleSaveEditSkill = async (userSkillId: string) => {
    try {
      setSavingSkillEdit(true);
      const updated = await profileService.updateUserSkill(userSkillId, {
        proficiency_level: editingSkillProficiency
      });
      setUserSkills(userSkills.map((s) => (s.id === userSkillId ? updated : s)));
      setEditingSkillId(null);
      setFeedback({
        type: 'success',
        message: `Updated proficiency for '${updated.skill.name}' to ${editingSkillProficiency}!`
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: getErrorMessage(err, 'Failed to update skill proficiency.')
      });
    } finally {
      setSavingSkillEdit(false);
    }
  };

  // 2. Remove Skill
  const handleRemoveSkill = async (userSkillId: string) => {
    try {
      await profileService.removeUserSkill(userSkillId);
      setUserSkills(userSkills.filter((s) => s.id !== userSkillId));
      setFeedback({ type: 'success', message: 'Skill successfully removed from profile.' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: getErrorMessage(err, 'Failed to remove skill.') });
    }
  };

  // 3. Add Career Goal
  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setAddingGoal(true);
      const newGoal = await profileService.createGoal({
        target_role: goalRole.trim(),
        target_domain: goalDomain.trim(),
        target_company_type: goalCompanyType.trim(),
        target_date: goalDate.trim(),
        priority: goalPriority,
        is_primary: goalIsPrimary
      });

      // If marked as primary, unmark others locally
      if (goalIsPrimary) {
        setGoals([newGoal, ...goals.map((g) => ({ ...g, is_primary: false }))]);
      } else {
        setGoals([newGoal, ...goals]);
      }

      setFeedback({ type: 'success', message: `Career Goal '${newGoal.target_role}' added successfully!` });
      setGoalIsPrimary(false);
    } catch (err: any) {
      const msg = getErrorMessage(err, 'Failed to add career goal.');
      setFeedback({ type: 'error', message: msg });
    } finally {
      setAddingGoal(false);
    }
  };

  // 3. Start Edit Career Goal
  const handleStartEditGoal = (goal: CareerGoal) => {
    setEditingGoalId(goal.id);
    setEditGoalData({
      target_role: goal.target_role,
      target_domain: goal.target_domain || '',
      target_company_type: goal.target_company_type || '',
      target_date: goal.target_date || '',
      priority: goal.priority || 'High',
    });
  };

  // 3. Save Edit Career Goal
  const handleSaveEditGoal = async (goalId: string) => {
    try {
      setSavingGoalEdit(true);
      const updated = await profileService.updateGoal(goalId, {
        target_role: editGoalData.target_role.trim(),
        target_domain: editGoalData.target_domain.trim(),
        target_company_type: editGoalData.target_company_type.trim(),
        target_date: editGoalData.target_date.trim(),
        priority: editGoalData.priority,
      });
      setGoals(goals.map((g) => (g.id === goalId ? updated : g)));
      setEditingGoalId(null);
      setFeedback({ type: 'success', message: `Updated career goal '${updated.target_role}'!` });
    } catch (err: any) {
      setFeedback({ type: 'error', message: getErrorMessage(err, 'Failed to update career goal.') });
    } finally {
      setSavingGoalEdit(false);
    }
  };

  // 3. Toggle Primary Goal
  const handleTogglePrimaryGoal = async (goalId: string) => {
    try {
      const updated = await profileService.updateGoal(goalId, { is_primary: true });
      setGoals(goals.map((g) => ({ ...g, is_primary: g.id === goalId })));
      setFeedback({ type: 'success', message: `Marked '${updated.target_role}' as your primary goal!` });
    } catch (err: any) {
      setFeedback({ type: 'error', message: getErrorMessage(err, 'Failed to set primary goal.') });
    }
  };

  // 3. Delete Career Goal
  const handleDeleteGoal = async (goalId: string) => {
    try {
      await profileService.deleteGoal(goalId);
      setGoals(goals.filter((g) => g.id !== goalId));
      setFeedback({ type: 'success', message: 'Career goal deleted successfully.' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: getErrorMessage(err, 'Failed to delete goal.') });
    }
  };

  // Filter skills catalog based on category and search query
  const filteredCatalogSkills = catalogSkills.filter((sk) => {
    const matchesCat = selectedCategory === 'All' || sk.category === selectedCategory;
    const matchesQuery = sk.name.toLowerCase().includes(skillSearch.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const categories = ['All', 'Programming', 'Web Development', 'Database', 'AI/ML', 'Cloud', 'DevOps', 'DSA'];

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading Career Profile...</span>
        </div>
      </div>
    );
  }

  const completionPct = profile ? profile.completion_percentage : 0;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 px-4 py-8 max-w-7xl mx-auto space-y-8">
      {/* Header & Completion Banner */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-500/10 border border-sky-500/20 rounded-full text-sky-400 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Career Foundation</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">Career Profile & Goals</h1>
            <p className="text-slate-400 text-sm mt-1">
              Build your technical profile to unlock AI-driven skill gap recommendations and learning roadmaps.
            </p>
          </div>

          <div className="w-full md:w-64 bg-slate-950 p-4 border border-slate-800 rounded-xl space-y-2">
            <div className="flex justify-between items-center text-xs font-medium">
              <span className="text-slate-400">Profile Completion</span>
              <span className="text-sky-400 font-bold">{completionPct}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all duration-500"
                style={{ width: `${completionPct}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 text-sm transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span className="flex-1">{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Personal, Academic & Career Info Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            {/* 1. Personal Information */}
            <Card>
              <h2 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-sky-400" />
                <span>Personal Information</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="e.g. Jane Doe"
                  required
                />
                <Input
                  label="Phone Number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. +91 9876543210"
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-300 mb-1">Short Bio</label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell us about your background and engineering passion..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>
            </Card>

            {/* 2. Education (College, Degree, Branch, CGPA, Graduation Year) */}
            <Card>
              <h2 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-400" />
                <span>Education Details</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="College / University"
                  value={formData.college}
                  onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                  placeholder="e.g. IIT Bombay / VTU / Stanford"
                />
                <Input
                  label="Degree"
                  value={formData.degree}
                  onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                  placeholder="e.g. B.Tech / B.E / BCA / M.S"
                />
                <Input
                  label="Branch / Specialization"
                  value={formData.branch}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                  placeholder="e.g. Computer Science and Engineering"
                />
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Current Academic Year</label>
                  <select
                    value={formData.current_year}
                    onChange={(e) => setFormData({ ...formData, current_year: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="Graduated">Graduated</option>
                  </select>
                </div>
                <Input
                  label="Graduation Year"
                  type="number"
                  placeholder="e.g. 2026"
                  value={formData.graduation_year}
                  onChange={(e) => setFormData({ ...formData, graduation_year: e.target.value })}
                />
                <Input
                  label="CGPA / Percentage"
                  type="number"
                  step="0.01"
                  placeholder="e.g. 8.75"
                  value={formData.cgpa}
                  onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                />
              </div>
            </Card>

            {/* 3. Career Preferences (Target Role, Target Domain, Work Mode, Locations) */}
            <Card>
              <h2 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-emerald-400" />
                <span>Career Information & Goals</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Target Role</label>
                  <select
                    value={formData.target_role}
                    onChange={(e) => setFormData({ ...formData, target_role: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
                  >
                    <option value="Full Stack Developer">Full Stack Developer</option>
                    <option value="Software Engineer">Software Engineer</option>
                    <option value="Backend Developer">Backend Developer</option>
                    <option value="Frontend Developer">Frontend Developer</option>
                    <option value="AI/ML Engineer">AI/ML Engineer</option>
                    <option value="Data Scientist">Data Scientist</option>
                    <option value="Data Engineer">Data Engineer</option>
                    <option value="Cloud Architect">Cloud Architect</option>
                    <option value="DevOps Engineer">DevOps Engineer</option>
                    <option value="Cybersecurity Analyst">Cybersecurity Analyst</option>
                    <option value="Mobile App Developer">Mobile App Developer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Target Domain</label>
                  <select
                    value={formData.target_domain}
                    onChange={(e) => setFormData({ ...formData, target_domain: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
                  >
                    <option value="Web Development">Web Development</option>
                    <option value="Artificial Intelligence">Artificial Intelligence</option>
                    <option value="Cloud & Distributed Systems">Cloud & Distributed Systems</option>
                    <option value="Mobile Development">Mobile Development</option>
                    <option value="Data Engineering">Data Engineering</option>
                    <option value="Cybersecurity">Cybersecurity</option>
                    <option value="Fintech & Banking">Fintech & Banking</option>
                    <option value="Healthcare Tech">Healthcare Tech</option>
                    <option value="E-Commerce">E-Commerce</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Experience Level</label>
                  <select
                    value={formData.experience_level}
                    onChange={(e) => setFormData({ ...formData, experience_level: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
                  >
                    <option value="Beginner">Beginner (0-1 Yrs / Fresher)</option>
                    <option value="Intermediate">Intermediate (1-3 Yrs)</option>
                    <option value="Advanced">Advanced (3+ Yrs)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Preferred Work Mode</label>
                  <select
                    value={formData.preferred_work_mode}
                    onChange={(e) => setFormData({ ...formData, preferred_work_mode: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
                  >
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <Input
                    label="Preferred Work Locations"
                    value={formData.preferred_locations}
                    onChange={(e) => setFormData({ ...formData, preferred_locations: e.target.value })}
                    placeholder="e.g. Bangalore, Pune, Mumbai, Remote"
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-800/80 pt-4">
                <span className="text-xs text-slate-400">
                  Data is automatically stored and synced across your sessions.
                </span>
                <Button type="submit" variant="primary" disabled={savingProfile} className="px-6 shadow-md shadow-sky-600/30">
                  {savingProfile ? 'Saving Changes...' : 'Save Career Profile'}
                </Button>
              </div>
            </Card>
          </form>
        </div>

        {/* Right Column (1 Col): Skills & Goals Management */}
        <div className="space-y-6">
          {/* 1. Skills Management Card (Add, Edit, Remove) */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Code className="w-5 h-5 text-sky-400" />
                <span>My Technical Skills</span>
              </h2>
              <span className="text-xs px-2.5 py-0.5 bg-sky-500/10 text-sky-400 rounded-full font-semibold border border-sky-500/20">
                {userSkills.length} Claimed
              </span>
            </div>

            {/* List User Skills with Inline Edit and Remove */}
            <div className="space-y-2 mb-6">
              {userSkills.length === 0 ? (
                <p className="text-xs text-slate-400 italic p-3 bg-slate-950 border border-slate-900 rounded-lg text-center">
                  No skills added yet. Add your skills from the catalog below.
                </p>
              ) : (
                userSkills.map((us) => {
                  const isEditing = editingSkillId === us.id;

                  return (
                    <div
                      key={us.id}
                      className="p-3 bg-slate-950 border border-slate-800 rounded-lg transition-all"
                    >
                      {isEditing ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-200">{us.skill.name}</span>
                            <span className="text-xs text-slate-400">{us.skill.category}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <select
                              value={editingSkillProficiency}
                              onChange={(e) => setEditingSkillProficiency(e.target.value)}
                              className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                            >
                              <option value="Beginner">Beginner</option>
                              <option value="Intermediate">Intermediate</option>
                              <option value="Advanced">Advanced</option>
                            </select>
                            <button
                              onClick={() => handleSaveEditSkill(us.id)}
                              disabled={savingSkillEdit}
                              className="p-1.5 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded transition-colors"
                              title="Save proficiency"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingSkillId(null)}
                              className="p-1.5 bg-slate-800 text-slate-400 hover:text-slate-200 rounded transition-colors"
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-slate-200">{us.skill.name}</p>
                            <p className="text-[11px] text-slate-400">{us.skill.category}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs px-2 py-0.5 rounded font-medium ${
                                us.proficiency_level === 'Advanced'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : us.proficiency_level === 'Intermediate'
                                  ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                                  : 'bg-slate-800 text-slate-300'
                              }`}
                            >
                              {us.proficiency_level}
                            </span>
                            <button
                              onClick={() => handleStartEditSkill(us)}
                              className="text-slate-500 hover:text-sky-400 p-1 transition-colors"
                              title="Edit skill proficiency"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleRemoveSkill(us.id)}
                              className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                              title="Remove skill"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Add Skill Form */}
            <form onSubmit={handleAddSkill} className="border-t border-slate-800 pt-4 space-y-3">
              <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Add Technical Skill</p>

              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search catalog or type custom skill (e.g. Docker, TypeScript)..."
                    value={selectedSkillName || skillSearch}
                    onChange={(e) => {
                      setSelectedSkillName(e.target.value);
                      setSkillSearch(e.target.value);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                    required
                  />
                </div>

                <div className="flex flex-wrap gap-1">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                        selectedCategory === cat
                          ? 'bg-sky-500/20 border-sky-500/40 text-sky-300 font-semibold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {selectedSkillName === '' && (
                  <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto p-1.5 bg-slate-950 border border-slate-900 rounded-lg">
                    {filteredCatalogSkills.slice(0, 16).map((sk) => (
                      <button
                        key={sk.id}
                        type="button"
                        onClick={() => {
                          setSelectedSkillName(sk.name);
                          setSkillSearch(sk.name);
                        }}
                        className="text-[11px] px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-slate-300 hover:border-sky-500 hover:text-sky-300 transition-colors"
                      >
                        + {sk.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Proficiency Level</label>
                <select
                  value={skillProficiency}
                  onChange={(e) => setSkillProficiency(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                >
                  <option value="Beginner">Beginner (Foundational)</option>
                  <option value="Intermediate">Intermediate (Project experience)</option>
                  <option value="Advanced">Advanced (Production ready)</option>
                </select>
              </div>

              <Button type="submit" variant="primary" fullWidth disabled={addingSkill} className="text-xs py-2">
                <Plus className="w-3.5 h-3.5 inline mr-1" />
                {addingSkill ? 'Adding Skill...' : 'Add Skill to Profile'}
              </Button>
            </form>
          </Card>

          {/* 2. Career Goals Card (Add, Edit, Set Primary, Remove) */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-400" />
                <span>Career Goals</span>
              </h2>
              <span className="text-xs px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full font-semibold border border-emerald-500/20">
                {goals.length} Goals
              </span>
            </div>

            {/* List Goals with Edit & Primary controls */}
            <div className="space-y-3 mb-6">
              {goals.length === 0 ? (
                <p className="text-xs text-slate-400 italic p-3 bg-slate-950 border border-slate-900 rounded-lg text-center">
                  No career goals set yet. Set your milestone goals below.
                </p>
              ) : (
                goals.map((g) => {
                  const isEditing = editingGoalId === g.id;

                  return (
                    <div
                      key={g.id}
                      className={`p-3 bg-slate-950 border rounded-lg space-y-2 relative transition-all ${
                        g.is_primary ? 'border-amber-500/40 shadow-sm shadow-amber-500/10' : 'border-slate-800'
                      }`}
                    >
                      {isEditing ? (
                        <div className="space-y-2 text-xs">
                          <div>
                            <label className="text-[10px] text-slate-400 block mb-0.5">Target Role</label>
                            <input
                              type="text"
                              value={editGoalData.target_role}
                              onChange={(e) => setEditGoalData({ ...editGoalData, target_role: e.target.value })}
                              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100"
                              required
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] text-slate-400 block mb-0.5">Target Domain</label>
                              <input
                                type="text"
                                value={editGoalData.target_domain}
                                onChange={(e) => setEditGoalData({ ...editGoalData, target_domain: e.target.value })}
                                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-400 block mb-0.5">Company Type</label>
                              <input
                                type="text"
                                value={editGoalData.target_company_type}
                                onChange={(e) => setEditGoalData({ ...editGoalData, target_company_type: e.target.value })}
                                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] text-slate-400 block mb-0.5">Target Date</label>
                              <input
                                type="text"
                                value={editGoalData.target_date}
                                onChange={(e) => setEditGoalData({ ...editGoalData, target_date: e.target.value })}
                                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-400 block mb-0.5">Priority</label>
                              <select
                                value={editGoalData.priority}
                                onChange={(e) => setEditGoalData({ ...editGoalData, priority: e.target.value })}
                                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100"
                              >
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                              </select>
                            </div>
                          </div>
                          <div className="flex justify-end gap-2 pt-1">
                            <button
                              onClick={() => handleSaveEditGoal(g.id)}
                              disabled={savingGoalEdit}
                              className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded flex items-center gap-1 font-semibold"
                            >
                              <Check className="w-3 h-3" /> Save
                            </button>
                            <button
                              onClick={() => setEditingGoalId(null)}
                              className="px-2.5 py-1 bg-slate-800 text-slate-400 hover:text-slate-200 rounded flex items-center gap-1"
                            >
                              <X className="w-3 h-3" /> Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleTogglePrimaryGoal(g.id)}
                                title={g.is_primary ? 'Primary goal' : 'Click to make primary goal'}
                                className={`p-0.5 rounded transition-colors ${
                                  g.is_primary ? 'text-amber-400 hover:text-amber-300' : 'text-slate-600 hover:text-amber-400'
                                }`}
                              >
                                <Star className={`w-3.5 h-3.5 ${g.is_primary ? 'fill-amber-400' : ''}`} />
                              </button>
                              <span className="text-xs font-bold text-sky-400">{g.target_role}</span>
                              {g.is_primary && (
                                <span className="text-[9px] px-1.5 py-0.2 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded font-semibold">
                                  PRIMARY
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5">
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                                  g.priority === 'High'
                                    ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                    : g.priority === 'Medium'
                                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                    : 'bg-slate-800 text-slate-300'
                                }`}
                              >
                                {g.priority}
                              </span>
                              <button
                                onClick={() => handleStartEditGoal(g)}
                                className="text-slate-500 hover:text-sky-400 p-1 transition-colors"
                                title="Edit goal"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteGoal(g.id)}
                                className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                                title="Delete goal"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <p className="text-[11px] text-slate-400">
                            Domain: <span className="text-slate-200 font-medium">{g.target_domain || 'General'}</span>{' '}
                            | Target: <span className="text-slate-200 font-medium">{g.target_date || 'N/A'}</span>
                            {g.target_company_type && (
                              <span>
                                {' '}| Company: <span className="text-slate-200 font-medium">{g.target_company_type}</span>
                              </span>
                            )}
                          </p>
                        </>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Add Goal Form */}
            <form onSubmit={handleAddGoal} className="border-t border-slate-800 pt-4 space-y-3">
              <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Set New Target Goal</p>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Target Role</label>
                <input
                  type="text"
                  value={goalRole}
                  onChange={(e) => setGoalRole(e.target.value)}
                  placeholder="e.g. Full Stack Developer / AI Engineer"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Target Domain</label>
                  <input
                    type="text"
                    value={goalDomain}
                    onChange={(e) => setGoalDomain(e.target.value)}
                    placeholder="e.g. Web Development"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Company Type</label>
                  <input
                    type="text"
                    value={goalCompanyType}
                    onChange={(e) => setGoalCompanyType(e.target.value)}
                    placeholder="e.g. Product Based / FAANG"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Target Date / Year</label>
                  <input
                    type="text"
                    value={goalDate}
                    onChange={(e) => setGoalDate(e.target.value)}
                    placeholder="e.g. June 2026 / 2027"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Priority</label>
                  <select
                    value={goalPriority}
                    onChange={(e) => setGoalPriority(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="primary-goal-cb"
                  checked={goalIsPrimary}
                  onChange={(e) => setGoalIsPrimary(e.target.checked)}
                  className="rounded border-slate-800 text-sky-500 focus:ring-sky-500 bg-slate-950"
                />
                <label htmlFor="primary-goal-cb" className="text-xs text-slate-300 font-medium cursor-pointer">
                  Set as my primary career goal
                </label>
              </div>

              <Button type="submit" variant="outline" fullWidth disabled={addingGoal} className="text-xs py-2">
                <Plus className="w-3.5 h-3.5 inline mr-1" />
                {addingGoal ? 'Adding Goal...' : 'Add Career Goal'}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};
