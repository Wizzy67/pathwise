import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, BookOpen, Target, Sparkles, LogIn } from 'lucide-react';
import PathWiseLogo from '../components/PathWiseLogo';

/* ─── Falling Glass Embers ─── */
function Embers() {
  const embers = Array.from({ length: 35 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    left: Math.random() * 100,
    duration: Math.random() * 8 + 6,
    delay: Math.random() * -15,
    drift: Math.random() * 40 - 20,
  }));
  return (
    <div className="embers-container" aria-hidden="true">
      {embers.map(e => (
        <div
          key={e.id}
          className="ember"
          style={{
            width: e.size, height: e.size,
            left: `${e.left}%`,
            animationDuration: `${e.duration}s`,
            animationDelay: `${e.delay}s`,
            '--drift': `${e.drift}px`
          }}
        />
      ))}
    </div>
  );
}

const LandingPage = () => {
  return (
    <>
      <style>{`
        /* ─── FULL-PAGE BACKGROUND + GLASS PANEL ─────────── */
        .land-wrapper {
          position: relative;
          min-height: 100vh;
          min-height: 100dvh;
          width: 100%;
          overflow-x: hidden;
          font-family: 'Inter', 'Open Sans', sans-serif;
          color: #ffffff;
          background-color: #0A0C16;
        }

        /* Background image layer */
        .land-bg {
          position: absolute;
          inset: -10%; /* Oversize it slightly to allow panning */
          background:
            url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&q=80')
            center / cover no-repeat;
          z-index: 0;
          animation: kenBurns 20s ease-in-out infinite alternate;
        }
        
        @keyframes kenBurns {
          0% { transform: scale(1) translate(0, 0); }
          100% { transform: scale(1.08) translate(-1%, -1%); }
        }
        
        /* Smooth overlay gradient */
        .land-bg::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to right,
            rgba(10, 12, 22, 0.05) 0%,
            rgba(10, 12, 22, 0.3) 30%,
            rgba(10, 12, 22, 0.85) 65%,
            rgba(10, 12, 22, 0.98) 100%
          );
        }

        /* ── Falling Fire CSS ── */
        .embers-container {
          position: absolute;
          inset: 0;
          overflow: hidden;
          z-index: 1; /* Above background, behind glass panel */
          pointer-events: none;
        }
        .ember {
          position: absolute;
          top: -10px;
          background: rgba(255, 255, 255, 0.9); /* Glassy white core */
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(67, 97, 238, 0.8), 0 0 20px rgba(67, 97, 238, 0.4), inset 0 0 4px #ffffff;
          opacity: 0;
          animation: fall linear infinite;
        }
        @keyframes fall {
          0% { 
            transform: translateY(0) translateX(0) scale(1); 
            opacity: 0; 
          }
          10% { opacity: 0.8; }
          50% { 
            transform: translateY(50vh) translateX(var(--drift)) scale(0.8); 
            opacity: 1; 
          }
          90% { opacity: 0.6; }
          100% { 
            transform: translateY(105vh) translateX(calc(var(--drift) * 1.5)) scale(0.3); 
            opacity: 0; 
          }
        }

        /* ── Right Container ── */
        .land-glass {
          position: relative;
          z-index: 1;
          min-height: 100vh;
          min-height: 100dvh;
          width: 55%;
          max-width: 650px;
          margin-left: auto;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }

        /* ── Header ── */
        .land-header {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          padding: 2.5rem 4rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          z-index: 10;
        }
        
        .land-header-right a {
          color: rgba(255,255,255,0.7);
          text-decoration: none;
          font-weight: 600;
          font-size: 0.9rem;
          transition: color 0.2s;
        }
        .land-header-right a:hover {
          color: #fff;
        }

        /* ── Content area ── */
        .land-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 6rem 4rem 4rem 2rem;
          max-width: 500px;
          margin: 0 auto;
          width: 100%;
          box-sizing: border-box;
        }

        .land-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(67, 97, 238, 0.1);
          border: 1px solid rgba(67, 97, 238, 0.25);
          color: #4361EE;
          padding: 0.4rem 1rem;
          border-radius: 100px;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 1.5rem;
          width: fit-content;
        }

        .land-heading {
          font-family: 'Nunito', 'Outfit', sans-serif;
          font-size: 3rem;
          font-weight: 900;
          color: #ffffff;
          line-height: 1.1;
          margin-bottom: 1rem;
        }
        .land-heading span {
          color: #4361EE;
        }

        .land-sub {
          font-size: 0.95rem;
          color: rgba(255, 255, 255, 0.55);
          line-height: 1.6;
          margin-bottom: 2.5rem;
        }

        /* Features List */
        .land-features {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin-bottom: 3rem;
        }
        
        .land-feature {
          display: flex;
          align-items: flex-start;
          gap: 1.2rem;
        }
        .land-feature-icon {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #4361EE;
          flex-shrink: 0;
        }
        .land-feature-text h4 {
          font-size: 0.95rem;
          font-weight: 700;
          margin: 0 0 0.2rem 0;
          color: #fff;
        }
        .land-feature-text p {
          font-size: 0.8rem;
          color: rgba(255,255,255,0.45);
          margin: 0;
          line-height: 1.5;
        }

        /* ── Buttons ── */
        .land-actions {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .land-btn-fill {
          width: 100%;
          padding: 1rem;
          background: #4361EE;
          border: none;
          border-radius: 100px;
          color: #ffffff;
          font-size: 0.95rem;
          font-weight: 700;
          text-align: center;
          text-decoration: none;
          display: block;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 20px rgba(67,97,238,0.3);
          position: relative;
          overflow: hidden;
        }
        .land-btn-fill::before {
          content: '';
          position: absolute;
          top: -50%; left: -50%;
          width: 200%; height: 200%;
          background: linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%);
          transition: transform 0.6s;
          transform: translateX(-100%);
        }
        .land-btn-fill:hover::before { transform: translateX(100%); }
        .land-btn-fill:hover {
          background: #3651D4;
          box-shadow: 0 8px 35px rgba(67,97,238,0.5);
          transform: translateY(-2px) scale(1.02);
        }

        .land-btn-fill:active {
          transform: scale(0.98);
        }

        .land-btn-ghost {
          width: 100%;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 100px;
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.95rem;
          font-weight: 700;
          text-align: center;
          text-decoration: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.2s ease;
        }
        .land-btn-ghost:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #fff;
          border-color: rgba(255,255,255,0.3);
        }
        .land-btn-ghost:active {
          transform: scale(0.98);
          background: rgba(255, 255, 255, 0.12);
        }

        .land-mobile-logo {
          display: none;
        }

        /* ── MOBILE ── */
        @media (max-width: 768px) {
          .land-glass {
            width: 100%;
            max-width: 100%;
            background: rgba(13, 15, 28, 0.85);
            min-height: 100vh;
            min-height: 100dvh;
          }
          .land-header {
            display: none;
          }
          .land-logo-text { display: none; }
          
          .land-mobile-logo {
            display: flex;
            align-items: center;
            margin-bottom: 1.5rem;
          }

          .land-content {
            padding: max(2.5rem, env(safe-area-inset-top)) 1.5rem max(2.5rem, env(safe-area-inset-bottom));
            max-width: 100%;
          }
          .land-heading {
            font-size: clamp(1.85rem, 6.5vw, 2.3rem);
          }
          .land-sub {
            font-size: 0.9rem;
            margin-bottom: 2rem;
          }
          .land-features {
            gap: 1.15rem;
            margin-bottom: 2.25rem;
          }
          
          .land-bg::after {
            background: linear-gradient(to bottom, rgba(10,12,22,0.1) 0%, rgba(10,12,22,0.85) 50%, rgba(10,12,22,0.98) 100%);
          }
        }
      `}</style>

      <div className="land-wrapper">
        {/* Background */}
        <div className="land-bg"></div>
        <Embers />
        
        {/* Header */}
        <header className="land-header">
          <div className="land-logo">
            <PathWiseLogo href="/" size={28} />
          </div>
          <div className="land-header-right">
            <Link to="/login">Sign In</Link>
          </div>
        </header>

        {/* Content Panel */}
        <motion.div
          className="land-glass"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="land-content">
            
            <div className="land-mobile-logo">
              <PathWiseLogo href="/" size={30} />
            </div>
            
            <motion.div
              className="land-badge"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <Sparkles size={12} /> Mobile-First Design
            </motion.div>

            <motion.h1
              className="land-heading"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Discover Your<br />
              <span>Perfect Career</span>
            </motion.h1>

            <motion.p
              className="land-sub"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              Take the scientifically-backed RIASEC assessment and get AI-powered career matches tailored perfectly to your DELSU profile.
            </motion.p>

            <motion.div
              className="land-features"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <div className="land-feature">
                <div className="land-feature-icon"><Brain size={18} /></div>
                <div className="land-feature-text">
                  <h4>AI-Powered Matching</h4>
                  <p>Our algorithm matches your strengths to over 30+ career paths.</p>
                </div>
              </div>
              <div className="land-feature">
                <div className="land-feature-icon"><BookOpen size={18} /></div>
                <div className="land-feature-text">
                  <h4>DELSU Roadmap</h4>
                  <p>Get a semester-by-semester course plan to keep you on track.</p>
                </div>
              </div>
              <div className="land-feature">
                <div className="land-feature-icon"><Target size={18} /></div>
                <div className="land-feature-text">
                  <h4>Skill Gap Analysis</h4>
                  <p>See what skills you need to build to reach your dream job.</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="land-actions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <Link to="/register" className="land-btn-fill">
                Get Started for Free
              </Link>
              <Link to="/login" className="land-btn-ghost">
                I already have an account
              </Link>
            </motion.div>

          </div>
        </motion.div>
      </div>
    </>
  );
};

export default LandingPage;
