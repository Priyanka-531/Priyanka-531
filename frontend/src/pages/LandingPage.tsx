import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Flame, Target, Cpu, LineChart, ArrowRight } from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center px-4 py-12 text-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-sm font-medium mb-6">
        <Flame className="w-4 h-4 text-sky-400" />
        <span>Career Intelligence & Skill Development Platform</span>
      </div>

      {/* Main Headline */}
      <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-100 tracking-tight max-w-4xl leading-tight">
        SkillForge <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">AI</span>
      </h1>

      {/* Tagline */}
      <p className="mt-4 text-xl sm:text-2xl font-semibold text-slate-300">
        Forge Your Skills. Build Your Future.
      </p>

      {/* Short Description */}
      <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed">
        SkillForge AI analyzes your resume, GitHub, and target job roles to pinpoint skill gaps and deliver personalized daily learning roadmaps designed for student developers.
      </p>

      {/* Call to Action Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full max-w-xs sm:max-w-none justify-center">
        <Link to="/register">
          <Button variant="primary" className="w-full sm:w-auto px-8 py-3 text-base flex items-center justify-center gap-2">
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
        <Link to="/login">
          <Button variant="outline" className="w-full sm:w-auto px-8 py-3 text-base">
            Log In
          </Button>
        </Link>
      </div>

      {/* Feature Highlights Grid */}
      <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl text-left">
        <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-xl">
          <div className="p-2 bg-sky-500/10 w-fit rounded-lg text-sky-400 mb-4">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-slate-200 text-lg">Target Role Alignment</h3>
          <p className="mt-2 text-sm text-slate-400">Compare your current technical skills against actual software developer job descriptions.</p>
        </div>

        <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-xl">
          <div className="p-2 bg-indigo-500/10 w-fit rounded-lg text-indigo-400 mb-4">
            <Cpu className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-slate-200 text-lg">AI Resume Parsing</h3>
          <p className="mt-2 text-sm text-slate-400">Extract technical skills and projects directly from your PDF resume using AI.</p>
        </div>

        <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-xl">
          <div className="p-2 bg-emerald-500/10 w-fit rounded-lg text-emerald-400 mb-4">
            <LineChart className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-slate-200 text-lg">Personalized Roadmaps</h3>
          <p className="mt-2 text-sm text-slate-400">Get daily bite-sized learning tasks tailored to bridge your exact career skill gaps.</p>
        </div>
      </div>
    </div>
  );
};
