import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../common/Button';
import {
  Flame,
  LogOut,
  LayoutDashboard,
  User,
  FileText,
  Target,
  Compass
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/resumes', label: 'Resumes', icon: FileText },
    { to: '/skill-gap', label: 'Skill Gap', icon: Target },
    { to: '/roadmap', label: 'Roadmap', icon: Compass },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 text-sky-400 font-bold text-lg sm:text-xl tracking-tight hover:opacity-90 shrink-0">
          <div className="p-1.5 bg-sky-500/10 border border-sky-500/30 rounded-lg">
            <Flame className="w-5 h-5 text-sky-400" />
          </div>
          <span>SkillForge <span className="text-slate-100 font-extrabold">AI</span></span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-1 sm:gap-2">
          {user ? (
            <>
              <div className="hidden md:flex items-center gap-1 mr-2">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = location.pathname === link.to;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        isActive
                          ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                          : 'text-slate-300 hover:text-white hover:bg-slate-900'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Mobile Quick Navigation */}
              <div className="flex md:hidden items-center gap-1">
                <Link to="/dashboard">
                  <Button variant="outline" className="p-2 text-xs">
                    <LayoutDashboard className="w-4 h-4 text-sky-400" />
                  </Button>
                </Link>
                <Link to="/resumes">
                  <Button variant="outline" className="p-2 text-xs">
                    <FileText className="w-4 h-4 text-emerald-400" />
                  </Button>
                </Link>
                <Link to="/skill-gap">
                  <Button variant="outline" className="p-2 text-xs">
                    <Target className="w-4 h-4 text-indigo-400" />
                  </Button>
                </Link>
                <Link to="/roadmap">
                  <Button variant="outline" className="p-2 text-xs">
                    <Compass className="w-4 h-4 text-amber-400" />
                  </Button>
                </Link>
              </div>

              <Button onClick={handleLogout} variant="secondary" className="flex items-center gap-1.5 py-1.5 px-2.5 sm:px-3 text-xs">
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline" className="py-1.5 text-xs sm:text-sm">
                  Log In
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" className="py-1.5 text-xs sm:text-sm">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
