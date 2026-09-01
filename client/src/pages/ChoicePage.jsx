import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PathWiseLogo from '../components/PathWiseLogo';

const ChoicePage = () => {
  const [activeTab, setActiveTab] = useState('register');
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);

  useEffect(() => {
    const container = document.getElementById('particles');
    if (!container) return;
    container.innerHTML = '';
    const colors = ['var(--blue)', 'var(--azure)'];
    for (let i = 0; i < 20; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      const size = Math.random() * 4 + 2;
      p.style.cssText = `
        width:${size}px;
        height:${size}px;
        left:${Math.random() * 100}%;
        animation-duration:${Math.random() * 16 + 10}s;
        animation-delay:${Math.random() * -20}s;
        background:${colors[Math.floor(Math.random() * colors.length)]};
      `;
      container.appendChild(p);
    }
  }, []);

  const handleTouchStart = (e) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    const swipeDistance = touchStartX - touchEndX;
    if (swipeDistance > 50) {
      setActiveTab('login');
    } else if (swipeDistance < -50) {
      setActiveTab('register');
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--canvas)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        main {
          position: relative; z-index: 1;
          flex: 1; display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 3rem 1.5rem 6rem;
          font-family: 'Open Sans', sans-serif;
        }
        .step-indicator {
          display: flex; align-items: center; gap: 0.5rem;
          color: var(--blue); font-size: 0.8rem; font-weight: 600;
          background: var(--lavender); border: 1px solid var(--border);
          border-radius: 50px; padding: 0.35rem 1rem;
          margin-bottom: 2.5rem;
          animation: fadeDown 0.6s ease both;
        }
        .choice-heading {
          font-family: 'Nunito', sans-serif; font-size: clamp(1.8rem,4vw,2.6rem);
          font-weight: 900; text-align: center; margin-bottom: 0.8rem; color: var(--ink);
          animation: fadeDown 0.7s ease 0.1s both;
        }
        .choice-sub {
          color: var(--graphite); text-align: center; font-size: 1rem;
          max-width: 440px; line-height: 1.6; margin-bottom: 3.5rem;
          animation: fadeDown 0.7s ease 0.2s both;
        }
        
        .cards-row {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 1.6rem; max-width: 820px; width: 100%;
        }
        @media (max-width: 768px) { .cards-row { display: none; } }

        .choice-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 24px; padding: 2.5rem 2rem;
          display: flex; flex-direction: column; align-items: center;
          text-align: center; gap: 1.2rem;
          cursor: pointer; transition: all 0.4s;
          position: relative; overflow: hidden;
          text-decoration: none; color: var(--ink);
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
          width: 100%;
          box-sizing: border-box;
        }
        .choice-card::before {
          content: ''; position: absolute; inset: 0;
          border-radius: 24px; opacity: 0;
          transition: opacity 0.4s;
        }
        .choice-card.register { animation: slideIn 0.7s ease 0.3s both; }
        .choice-card.login    { animation: slideIn2 0.7s ease 0.4s both; }
        .choice-card.register::before {
          background: var(--mist);
          border: 1px solid var(--border);
        }
        .choice-card.login::before {
          background: var(--mist);
          border: 1px solid var(--border);
        }
        .choice-card:hover { transform: translateY(-8px); }
        .choice-card.register:hover { border-color: var(--blue); box-shadow: 0 8px 20px rgba(25,68,241,0.08); }
        .choice-card.login:hover    { border-color: var(--blue);  box-shadow: 0 8px 20px rgba(25,68,241,0.08); }
        .choice-card:hover::before  { opacity: 1; }
        .card-icon-wrap {
          width: 80px; height: 80px; border-radius: 22px;
          display: flex; align-items: center; justify-content: center;
          font-size: 2rem; position: relative;
        }
        .register .card-icon-wrap {
          background: var(--lavender);
        }
        .login .card-icon-wrap {
          background: var(--mist);
        }
        .card-badge {
          position: absolute; top: -6px; right: -6px;
          background: var(--blue);
          color: #fff; font-size: 0.65rem; font-weight: 700;
          border-radius: 50px; padding: 0.2rem 0.5rem;
        }
        .choice-card h3 { font-family: 'Nunito', sans-serif; font-size: 1.4rem; font-weight: 800; color: var(--ink); }
        .choice-card p { color: var(--graphite); font-size: 0.9rem; line-height: 1.65; max-width: 280px; }
        .perks { display: flex; flex-direction: column; gap: 0.5rem; width: 100%; text-align: left; }
        .perk { display: flex; align-items: center; gap: 0.6rem; font-size: 0.85rem; color: var(--graphite); }
        .perk-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; background: var(--blue); }
        .card-btn {
          width: 100%; padding: 0.9rem; border-radius: 14px;
          font-size: 1rem; font-weight: 700; cursor: pointer; border: none;
          transition: all 0.3s; text-decoration: none; display: block; text-align: center;
        }
        .register .card-btn { background: var(--blue); color: #fff; }
        .register .card-btn:hover { background: var(--azure); transform: translateY(-2px); }
        .login .card-btn { background: var(--lavender); color: var(--blue); border: 1px solid var(--border); }
        .login .card-btn:hover { background: var(--mist); transform: translateY(-2px); }

        .choice-nav {
          position: relative; z-index: 10;
          display: flex; align-items: center;
          width: 100%; box-sizing: border-box;
          padding: 1rem 2.5rem;
          background: var(--surface);
          border-bottom: 1px solid var(--border);
        }
        .back-home-btn {
          margin-left: auto;
          margin-right: 0;
          display: inline-flex; align-items: center; gap: 0.4rem;
          padding: 0.4rem 1rem 0.4rem 0.7rem;
          border-radius: 50px;
          border: 1px solid var(--border);
          background: var(--mist);
          color: var(--blue);
          text-decoration: none;
          font-size: 0.82rem;
          font-weight: 700;
          letter-spacing: 0.01em;
          transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
        }
        .back-home-btn:hover {
          background: var(--lavender);
          border-color: var(--blue);
          transform: translateX(-2px);
        }
        .back-home-text-mobile {
          display: none;
        }
        @media (max-width: 640px) {
          .choice-nav {
            padding: 1rem 1.2rem;
          }
          .back-home-text-desktop {
            display: none;
          }
          .back-home-text-mobile {
            display: inline;
          }
        }
      `}</style>
      <div className="particles" id="particles"></div>

      <nav className="choice-nav">
        {/* Logo — Left */}
        <PathWiseLogo href="/" size={32} />

        {/* Back Button — Right */}
        <Link to="/" className="back-home-btn">
          <span className="back-home-text-desktop">← Back to Home</span>
          <span className="back-home-text-mobile">← Home</span>
        </Link>
      </nav>

      <main>
        <div className="step-indicator">✦ Step 2 of 6 — Account Access</div>
        <h2 className="choice-heading">How would you like to continue?</h2>
        <p className="choice-sub">Join thousands of DELSU students already finding their perfect career paths with PathWise.</p>

        {/* Desktop Layout — Displays both cards side-by-side */}
        <div className="cards-row">
          <Link to="/register" className="choice-card register">
            <div className="card-icon-wrap">
              <div className="card-badge">FREE</div>
              <PathWiseLogo size={52} text={false} />
            </div>
            <h3>New to PathWise?</h3>
            <p>Create your free account and start discovering your ideal career path, course roadmap, and AI-powered guidance today.</p>
            <div className="perks">
              <div className="perk"><span className="perk-dot"></span>AI career matching</div>
              <div className="perk"><span className="perk-dot"></span>DELSU course roadmap</div>
              <div className="perk"><span className="perk-dot"></span>AI Advisor access</div>
              <div className="perk"><span className="perk-dot"></span>Save and compare careers</div>
            </div>
            <div className="card-btn">Join Us — Create Account →</div>
          </Link>

          <Link to="/login" className="choice-card login">
            <div className="card-icon-wrap">
              <div className="card-badge">WELCOME BACK</div>
              <PathWiseLogo size={52} text={false} />
            </div>
            <h3>Already have an account?</h3>
            <p>Welcome back! Log in to continue your career journey, view your saved results, and pick up right where you left off.</p>
            <div className="perks">
              <div className="perk"><span className="perk-dot"></span>View your career matches</div>
              <div className="perk"><span className="perk-dot"></span>Resume your roadmap</div>
              <div className="perk"><span className="perk-dot"></span>Continue AI conversations</div>
              <div className="perk"><span className="perk-dot"></span>Track your progress</div>
            </div>
            <div className="card-btn">Log In to PathWise →</div>
          </Link>
        </div>

        {/* Mobile Layout — Displays only one card at a time with tab & swipe control */}
        <div className="md:hidden flex flex-col items-center w-full max-w-[340px]">
          {/* Mobile Sliding Tabs Selector */}
          <div className="flex p-1 bg-[var(--fog)] border border-[var(--border)] rounded-full mb-6 w-full relative">
            <button 
              type="button"
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-2 text-xs font-bold rounded-full transition-all duration-300 relative z-10 ${activeTab === 'register' ? 'text-white' : 'text-[var(--graphite)]'}`}
              style={{ background: 'none', border: 'none', cursor: 'pointer', outline: 'none' }}
            >
              Create Account
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-2 text-xs font-bold rounded-full transition-all duration-300 relative z-10 ${activeTab === 'login' ? 'text-white' : 'text-[var(--graphite)]'}`}
              style={{ background: 'none', border: 'none', cursor: 'pointer', outline: 'none' }}
            >
              Sign In
            </button>
            <div 
              className="absolute top-1 bottom-1 bg-[var(--blue)] rounded-full transition-all duration-300"
              style={{
                width: 'calc(50% - 4px)',
                left: activeTab === 'register' ? '4px' : 'calc(50%)',
              }}
            />
          </div>

          {/* Active Card with Swipe Handlers */}
          <div 
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="w-full transition-all duration-300"
          >
            {activeTab === 'register' ? (
              <Link to="/register" className="choice-card register w-full">
                <div className="card-icon-wrap">
                  <div className="card-badge">FREE</div>
                  <PathWiseLogo size={52} text={false} />
                </div>
                <h3>New to PathWise?</h3>
                <p>Create your free account and start discovering your ideal career path, course roadmap, and AI-powered guidance today.</p>
                <div className="perks">
                  <div className="perk"><span className="perk-dot"></span>AI career matching</div>
                  <div className="perk"><span className="perk-dot"></span>DELSU course roadmap</div>
                  <div className="perk"><span className="perk-dot"></span>AI Advisor access</div>
                  <div className="perk"><span className="perk-dot"></span>Save and compare careers</div>
                </div>
                <div className="card-btn">Join Us — Create Account →</div>
              </Link>
            ) : (
              <Link to="/login" className="choice-card login w-full">
                <div className="card-icon-wrap">
                  <div className="card-badge">WELCOME BACK</div>
                  <PathWiseLogo size={52} text={false} />
                </div>
                <h3>Already have an account?</h3>
                <p>Welcome back! Log in to continue your career journey, view your saved results, and pick up right where you left off.</p>
                <div className="perks">
                  <div className="perk"><span className="perk-dot"></span>View your career matches</div>
                  <div className="perk"><span className="perk-dot"></span>Resume your roadmap</div>
                  <div className="perk"><span className="perk-dot"></span>Continue AI conversations</div>
                  <div className="perk"><span className="perk-dot"></span>Track your progress</div>
                </div>
                <div className="card-btn">Log In to PathWise →</div>
              </Link>
            )}
          </div>

          {/* Carousel Dots Indicator */}
          <div className="flex gap-2.5 justify-center mt-6">
            <button 
              type="button"
              onClick={() => setActiveTab('register')}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${activeTab === 'register' ? 'bg-[var(--blue)] scale-125' : 'bg-[var(--ash)]'}`}
              style={{ border: 'none', cursor: 'pointer', padding: 0 }}
              aria-label="Register card"
            />
            <button 
              type="button"
              onClick={() => setActiveTab('login')}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${activeTab === 'login' ? 'bg-[var(--blue)] scale-125' : 'bg-[var(--ash)]'}`}
              style={{ border: 'none', cursor: 'pointer', padding: 0 }}
              aria-label="Login card"
            />
          </div>
        </div>
      </main>

    </div>
  );
};

export default ChoicePage;
