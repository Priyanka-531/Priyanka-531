import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { DashboardPage } from '../pages/DashboardPage';
import { CareerProfilePage } from '../pages/CareerProfilePage';
import { ResumesPage } from '../pages/ResumesPage';
import { SkillGapPage } from '../pages/SkillGapPage';
import { RoadmapPage } from '../pages/RoadmapPage';
import { ProtectedRoute } from './ProtectedRoute';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<CareerProfilePage />} />
        <Route path="/resumes" element={<ResumesPage />} />
        <Route path="/skill-gap" element={<SkillGapPage />} />
        <Route path="/roadmap" element={<RoadmapPage />} />
      </Route>

      {/* Fallback Catch-all Redirect */}
      <Route path="*" element={<LandingPage />} />
    </Routes>
  );
};
