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
    <>
      <style>{`
        :root {
          --canvas: #f5f3f3;
          --surface: #ffffff;
          --border: #dddcdc;
          --blue: #1944f1;
          --azure: #4d6ff5;
          --lavender: #eef1fe;
          --ink: #111111;
          --graphite: #707070;
          --ash: #adadad;
          --fog: #ededed;
          --mist: #f2f2f2;
        }
        .heading-font { font-family: 'Nunito', sans-serif; }
        .body-font { font-family: 'Open Sans', sans-serif; }
      `}</style>
      <footer className="relative border-t border-[var(--border)] bg-[var(--surface)] mt-auto overflow-hidden body-font">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-8 lg:gap-10">
            
            {/* Logo & Description (4 cols) */}
            <div className="lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left space-y-4 lg:space-y-6">
              <PathWiseLogo href="/" size={32} />
              <p className="text-sm text-[var(--graphite)] leading-relaxed max-w-sm hidden lg:block">
                Intelligent student career path-finder and course advisory system custom-tailored for Delta State University (DELSU) students.
              </p>
              <div className="flex gap-4 pt-2">
                <a href="#" className="w-10 h-10 rounded-xl bg-[var(--fog)] border border-[var(--border)] flex items-center justify-center text-[var(--graphite)] hover:bg-[var(--blue)] hover:text-white hover:border-[var(--blue)] transition-all duration-300 hover:-translate-y-1">
                  <Globe className="w-4.5 h-4.5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-xl bg-[var(--fog)] border border-[var(--border)] flex items-center justify-center text-[var(--graphite)] hover:bg-[var(--blue)] hover:text-white hover:border-[var(--blue)] transition-all duration-300 hover:-translate-y-1">
                  <Mail className="w-4.5 h-4.5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-xl bg-[var(--fog)] border border-[var(--border)] flex items-center justify-center text-[var(--graphite)] hover:bg-[var(--blue)] hover:text-white hover:border-[var(--blue)] transition-all duration-300 hover:-translate-y-1">
                  <Phone className="w-4.5 h-4.5" />
                </a>
              </div>
            </div>

            {/* Links Container (4 cols total) */}
            <div className="lg:col-span-4 grid grid-cols-2 gap-6 lg:gap-8 text-center lg:text-left">
              {/* Platform Links */}
              <div>
                <h3 className="text-sm font-bold text-[var(--ink)] heading-font mb-6">Platform</h3>
                <ul className="space-y-4 text-sm text-[var(--graphite)] list-none p-0 m-0">
                  <li><Link to="/explore" className="hover:text-[var(--blue)] hover:translate-x-1 inline-flex items-center gap-1 transition-all duration-200" style={{ textDecoration: 'none' }}>Explore Careers</Link></li>
                  <li><Link to="/advisor" className="hover:text-[var(--blue)] hover:translate-x-1 inline-flex items-center gap-1 transition-all duration-200" style={{ textDecoration: 'none' }}>AI Advisor</Link></li>
                  <li><Link to="/quiz" className="hover:text-[var(--blue)] hover:translate-x-1 inline-flex items-center gap-1 transition-all duration-200" style={{ textDecoration: 'none' }}>Assessment</Link></li>
                  <li><Link to="/dashboard" className="hover:text-[var(--blue)] hover:translate-x-1 inline-flex items-center gap-1 transition-all duration-200" style={{ textDecoration: 'none' }}>Dashboard</Link></li>
                </ul>
              </div>

              {/* DELSU Portals */}
              <div>
                <h3 className="text-sm font-bold text-[var(--ink)] heading-font mb-6">DELSU Portal</h3>
                <ul className="space-y-4 text-sm text-[var(--graphite)] list-none p-0 m-0">
                  <li><a href="https://delsu.edu.ng" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--blue)] hover:translate-x-1 inline-flex items-center gap-1 transition-all duration-200" style={{ textDecoration: 'none' }}>Main Website</a></li>
                  <li><a href="#" className="hover:text-[var(--blue)] hover:translate-x-1 inline-flex items-center gap-1 transition-all duration-200" style={{ textDecoration: 'none' }}>Student Portal</a></li>
                  <li><a href="#" className="hover:text-[var(--blue)] hover:translate-x-1 inline-flex items-center gap-1 transition-all duration-200" style={{ textDecoration: 'none' }}>Academic Calendar</a></li>
                  <li><a href="#" className="hover:text-[var(--blue)] hover:translate-x-1 inline-flex items-center gap-1 transition-all duration-200" style={{ textDecoration: 'none' }}>Admissions</a></li>
                </ul>
              </div>
            </div>

            {/* Newsletter / Community Widget (4 cols) */}
            <div className="lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left space-y-4 lg:space-y-5">
              <h3 className="text-sm font-bold text-[var(--ink)] heading-font mb-2 lg:mb-6">Stay Updated</h3>
              <p className="text-sm text-[var(--graphite)] leading-relaxed max-w-sm hidden lg:block">
                Get notified about DELSU course revisions, academic updates, and newly unlocked advisor features.
              </p>
              <form onSubmit={handleSubscribe} className="relative flex items-center w-full max-w-sm bg-[var(--surface)] border border-[var(--border)] rounded-xl focus-within:border-[var(--blue)] transition-all overflow-hidden p-1.5 mt-2 lg:mt-0">
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email" 
                  className="w-full bg-transparent px-4 py-2.5 text-sm text-[var(--ink)] placeholder-[var(--ash)] focus:outline-none"
                  required
                />
                <button type="submit" className="w-10 h-10 rounded-lg bg-[var(--blue)] hover:bg-[var(--azure)] flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95 flex-shrink-0">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>

          </div>

          {/* Bottom Line & Meta Info */}
          <div className="mt-10 lg:mt-16 pt-8 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-6">
            <p 
              className="text-xs text-[var(--graphite)] cursor-default select-none hover:text-[var(--ink)] transition-colors text-center"
              onClick={handleSecretClick}
              title="Double-click to access admin gateway"
              style={{ userSelect: 'none' }}
            >
              © {new Date().getFullYear()} PathWise. All rights reserved.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-8">
              <div className="flex items-center gap-1.5 text-xs text-[var(--graphite)] text-center">
                Made with <Heart className="w-4 h-4 text-[var(--blue)] fill-[var(--blue)] animate-pulse inline" /> for DELSU Students
              </div>
              
              <button 
                onClick={scrollToTop}
                className="text-xs font-semibold text-[var(--graphite)] hover:text-[var(--blue)] flex items-center justify-center gap-1.5 transition-all hover:-translate-y-0.5 bg-[var(--fog)] hover:bg-[var(--lavender)] px-3 py-1.5 rounded-full"
              >
                Back to Top <ArrowUp className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
