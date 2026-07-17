import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Globe, Mail, Phone, Heart, ArrowUp, ArrowRight, Send } from 'lucide-react';
import PathWiseLogo from './PathWiseLogo';
import { useNotification } from '../contexts/NotificationContext';

const Footer = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const [email, setEmail] = useState('');

  const handleSecretClick = (e) => {
    // Hidden trigger: double click the copyright text to go to admin
    if (e.detail === 2) {
      navigate('/secure-admin-access');
    }
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    addNotification('Thanks for subscribing to PathWise updates! 🚀', 'success');
    setEmail('');
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative border-t border-pw-white/5 bg-gradient-to-b from-pw-surface/90 to-pw-black mt-auto overflow-hidden">
      {/* Ambient glowing orbs */}
      <div className="absolute -bottom-20 left-1/4 w-[400px] h-[150px] rounded-full blur-[120px] pointer-events-none" style={{ background: 'rgba(0,86,255,0.06)' }} aria-hidden="true" />
      <div className="absolute top-0 right-1/4 w-[300px] h-[100px] rounded-full blur-[100px] pointer-events-none" style={{ background: 'rgba(34,119,255,0.03)' }} aria-hidden="true" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-8 lg:gap-10">
          
          {/* Logo & Description (4 cols) */}
          <div className="lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left space-y-4 lg:space-y-6">
            <PathWiseLogo href="/" size={32} />
            <p className="text-sm text-pw-gray leading-relaxed max-w-sm hidden lg:block">
              Intelligent student career path-finder and course advisory system custom-tailored for Delta State University (DELSU) students.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="#" className="w-10 h-10 rounded-xl bg-pw-white/5 border border-pw-white/10 flex items-center justify-center text-pw-gray hover:bg-pw-blue hover:text-white hover:border-pw-blue transition-all duration-300 hover:-translate-y-1 shadow-lg">
                <Globe className="w-4.5 h-4.5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-pw-white/5 border border-pw-white/10 flex items-center justify-center text-pw-gray hover:bg-pw-blue hover:text-white hover:border-pw-blue transition-all duration-300 hover:-translate-y-1 shadow-lg">
                <Mail className="w-4.5 h-4.5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-pw-white/5 border border-pw-white/10 flex items-center justify-center text-pw-gray hover:bg-pw-blue hover:text-white hover:border-pw-blue transition-all duration-300 hover:-translate-y-1 shadow-lg">
                <Phone className="w-4.5 h-4.5" />
              </a>
            </div>
          </div>

          {/* Links Container (4 cols total) */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-6 lg:gap-8 text-center lg:text-left">
            {/* Platform Links */}
            <div>
              <h3 className="text-sm font-bold text-pw-white mb-6">Platform</h3>
              <ul className="space-y-4 text-sm text-pw-gray list-none p-0 m-0">
                <li><Link to="/explore" className="hover:text-pw-blue hover:translate-x-1 inline-flex items-center gap-1 transition-all duration-200" style={{ textDecoration: 'none' }}>Explore Careers</Link></li>
                <li><Link to="/advisor" className="hover:text-pw-blue hover:translate-x-1 inline-flex items-center gap-1 transition-all duration-200" style={{ textDecoration: 'none' }}>AI Advisor</Link></li>
                <li><Link to="/quiz" className="hover:text-pw-blue hover:translate-x-1 inline-flex items-center gap-1 transition-all duration-200" style={{ textDecoration: 'none' }}>Assessment</Link></li>
                <li><Link to="/dashboard" className="hover:text-pw-blue hover:translate-x-1 inline-flex items-center gap-1 transition-all duration-200" style={{ textDecoration: 'none' }}>Dashboard</Link></li>
              </ul>
            </div>

            {/* DELSU Portals */}
            <div>
              <h3 className="text-sm font-bold text-pw-white mb-6">DELSU Portal</h3>
              <ul className="space-y-4 text-sm text-pw-gray list-none p-0 m-0">
                <li><a href="https://delsu.edu.ng" target="_blank" rel="noopener noreferrer" className="hover:text-pw-blue hover:translate-x-1 inline-flex items-center gap-1 transition-all duration-200" style={{ textDecoration: 'none' }}>Main Website</a></li>
                <li><a href="#" className="hover:text-pw-blue hover:translate-x-1 inline-flex items-center gap-1 transition-all duration-200" style={{ textDecoration: 'none' }}>Student Portal</a></li>
                <li><a href="#" className="hover:text-pw-blue hover:translate-x-1 inline-flex items-center gap-1 transition-all duration-200" style={{ textDecoration: 'none' }}>Academic Calendar</a></li>
                <li><a href="#" className="hover:text-pw-blue hover:translate-x-1 inline-flex items-center gap-1 transition-all duration-200" style={{ textDecoration: 'none' }}>Admissions</a></li>
              </ul>
            </div>
          </div>

          {/* Newsletter / Community Widget (4 cols) */}
          <div className="lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left space-y-4 lg:space-y-5">
            <h3 className="text-sm font-bold text-pw-white mb-2 lg:mb-6">Stay Updated</h3>
            <p className="text-sm text-pw-gray leading-relaxed max-w-sm hidden lg:block">
              Get notified about DELSU course revisions, academic updates, and newly unlocked advisor features.
            </p>
            <form onSubmit={handleSubscribe} className="relative flex items-center w-full max-w-sm bg-pw-surface2 border border-pw-white/10 rounded-xl focus-within:border-pw-blue focus-within:shadow-[0_0_20px_rgba(0,86,255,0.15)] transition-all overflow-hidden p-1.5 mt-2 lg:mt-0">
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email" 
                className="w-full bg-transparent px-4 py-2.5 text-sm text-pw-white placeholder-pw-gray/50 focus:outline-none"
                required
              />
              <button type="submit" className="w-10 h-10 rounded-lg bg-pw-blue hover:bg-pw-azure flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95 flex-shrink-0 shadow-[0_4px_12px_rgba(0,86,255,0.3)]">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Line & Meta Info */}
        <div className="mt-10 lg:mt-16 pt-8 border-t border-pw-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p 
            className="text-xs text-pw-gray cursor-default select-none hover:text-pw-white transition-colors text-center"
            onClick={handleSecretClick}
            title="Double-click to access admin gateway"
            style={{ userSelect: 'none' }}
          >
            © {new Date().getFullYear()} PathWise. All rights reserved.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-8">
            <div className="flex items-center gap-1.5 text-xs text-pw-gray text-center">
              Made with <Heart className="w-4 h-4 text-pw-blue fill-pw-blue animate-pulse inline" /> for DELSU Students
            </div>
            
            <button 
              onClick={scrollToTop}
              className="text-xs font-semibold text-pw-gray hover:text-pw-white flex items-center justify-center gap-1.5 transition-all hover:-translate-y-0.5 bg-pw-surface2 hover:bg-pw-blue px-3 py-1.5 rounded-full"
            >
              Back to Top <ArrowUp className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
