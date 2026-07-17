import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Download, Bookmark, MessageCircle, ChevronDown, ChevronUp, ChevronLeft, Loader2, Sparkles, Building2, DollarSign, GraduationCap, MapPin, TrendingUp, ExternalLink, Flame, RefreshCw } from 'lucide-react';

const FIELD_COLORS = {
  Technology: '#0056FF', Medicine: '#0056FF', Law: '#0056FF',
  Business: '#0056FF', Engineering: '#0056FF', Science: '#0056FF',
  STEM: '#0056FF', Arts: '#0056FF', 'Social Sciences': '#0056FF',
};

const CareerDetail = () => {
  const { id } = useParams();
  const { addNotification } = useNotification();
  const { user, setUser } = useAuth();
  const [career, setCareer] = useState(null);      // base data from careers.json
  const [aiData, setAiData] = useState(null);       // rich AI-generated data
  const [loadingBase, setLoadingBase] = useState(true);
  const [loadingAi, setLoadingAi] = useState(false);
  const [openSem, setOpenSem] = useState(0);
  const [saved, setSaved] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Check if already saved
  useEffect(() => {
    if (user?.savedCareers?.includes(id)) setSaved(true);
  }, [user, id]);

  // Fetch base career data from careers.json
  useEffect(() => {
    const fetchCareer = async () => {
      try {
        const res = await api.get('/data/careers');
        const found = res.data.find(c => c.id === id);
        if (found) setCareer(found);
        else addNotification('Career not found.', 'error');
      } catch {
        addNotification('Failed to load career data.', 'error');
      } finally {
        setLoadingBase(false);
      }
    };
    fetchCareer();
  }, [id]);

  // Once base data is loaded, fetch AI-enriched detail
  useEffect(() => {
    if (!career) return;
    const fetchAiDetail = async () => {
      setLoadingAi(true);
      try {
        const res = await api.post('/gemini/career-detail', {
          careerId: career.id,
          careerTitle: career.title,
          careerField: career.field,
        });
        setAiData(res.data);
      } catch {
        // Silently fall back to static data — no error shown to user
      } finally {
        setLoadingAi(false);
      }
    };
    fetchAiDetail();
  }, [career]);

  // Fetch live job openings for this career
  useEffect(() => {
    if (!career) return;
    const fetchJobs = async () => {
      setLoadingJobs(true);
      try {
        const res = await api.get(`/jobs?career=${encodeURIComponent(career.title)}&field=${encodeURIComponent(career.field)}&limit=4`);
        setJobs(res.data.jobs || []);
      } catch {
        // Silently fail — jobs section is supplementary
      } finally {
        setLoadingJobs(false);
      }
    };
    fetchJobs();
  }, [career, refreshTrigger]);

  const handleSave = async () => {
    if (saved) {
      addNotification('Career already saved! ✓', 'info');
      return;
    }
    try {
      const res = await api.post('/users/save-career', { careerId: id });
      setSaved(true);
      if (res.data.savedCareers && user) {
        setUser({ ...user, savedCareers: res.data.savedCareers });
      }
      addNotification(`${career.title} saved to your list! 🔖`, 'success');
    } catch (err) {
      const msg = err?.response?.data?.error || 'Failed to save career.';
      addNotification(msg, 'error');
    }
  };

  if (loadingBase) {
    return (
      <div className="min-h-screen bg-pw-black flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-pw-blue" />
      </div>
    );
  }

  if (!career) {
    return (
      <div className="min-h-screen bg-pw-black flex items-center justify-center">
        <p className="text-pw-gray text-lg">Career not found.</p>
      </div>
    );
  }

  const fieldColor = FIELD_COLORS[career.field] || '#0056FF';
  const overview = aiData?.overview || career.description;
  const skills = aiData?.skills || career.core_skills || [];
  const roadmap = aiData?.roadmap || [];
  const skillGapData = aiData?.skillGapData || [];
  const qualifications = aiData?.qualifications;
  const careerOutlook = aiData?.careerOutlook;
  const topEmployers = aiData?.topEmployers || [];
  const whyItMatters = aiData?.whyItMatters;

  return (
    <div className="min-h-screen bg-pw-black pb-12">

      {/* Header Banner */}
      <div className="relative px-4 py-10 mb-8 overflow-hidden" style={{ background: `linear-gradient(135deg, ${fieldColor}dd, ${fieldColor}88)` }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px)' }} />
        <div className="max-w-5xl mx-auto relative z-10">
          {/* Back Button */}
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full text-white/90 text-xs font-bold bg-white/10 border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-200 hover:-translate-x-1 group"
          >
            <ChevronLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
            Back to Careers
          </Link>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-white/70 uppercase tracking-widest">{career.field}</span>
                {loadingAi && (
                  <span className="flex items-center gap-1 text-xs text-white/60 bg-white/10 px-2 py-0.5 rounded-full">
                    <Sparkles className="w-3 h-3 animate-pulse" /> AI generating...
                  </span>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3">{career.title}</h1>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur-sm flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" /> {career.demand} Demand</span>
                <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur-sm flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> {career.salary_range}</span>
                <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur-sm flex items-center gap-1"><GraduationCap className="w-3.5 h-3.5" /> Min. CGPA: {career.required_cgpa_hint}</span>
              </div>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <button
                onClick={handleSave}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all border text-sm ${saved ? 'bg-white/20 text-white border-white/40' : 'bg-white text-gray-900 border-transparent hover:bg-white/90'}`}
              >
                <Bookmark className="w-4 h-4" /> {saved ? 'Saved ✓' : 'Save Career'}
              </button>
              <Link to="/advisor" className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all bg-white/10 text-white border border-white/25 hover:bg-white/20 text-sm">
                <MessageCircle className="w-4 h-4" /> Ask AI
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 space-y-8">

        {/* Overview Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-pw-surface border border-pw-white/10 rounded-2xl p-6">
            <h2 className="text-pw-white font-bold text-lg mb-4 flex items-center gap-2">
              Career Overview
              {aiData && <span className="text-xs text-pw-blue bg-pw-blue/10 border border-pw-blue/20 px-2 py-0.5 rounded-full flex items-center gap-1"><Sparkles className="w-3 h-3" />AI</span>}
            </h2>
            {loadingAi && !aiData ? (
              <div className="space-y-2">
                {[1,2,3].map(i => <div key={i} className="h-4 bg-pw-white/5 rounded animate-pulse" style={{ width: `${90 - i*10}%` }} />)}
              </div>
            ) : (
              <p className="text-pw-gray text-sm leading-relaxed">{overview}</p>
            )}
            {whyItMatters && (
              <div className="mt-4 p-4 bg-pw-blue/5 border border-pw-blue/15 rounded-xl">
                <p className="text-xs font-bold text-pw-blue mb-1 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Why it Matters in Nigeria</p>
                <p className="text-pw-gray text-sm leading-relaxed">{whyItMatters}</p>
              </div>
            )}
          </div>

          {/* Career Outlook */}
          <div className="bg-pw-surface border border-pw-white/10 rounded-2xl p-6">
            <h2 className="text-pw-white font-bold text-lg mb-4">Career Outlook</h2>
            {loadingAi && !aiData ? (
              <div className="space-y-2">{[1,2].map(i => <div key={i} className="h-4 bg-pw-white/5 rounded animate-pulse" />)}</div>
            ) : careerOutlook ? (
              <p className="text-pw-gray text-sm leading-relaxed mb-4">{careerOutlook}</p>
            ) : (
              <p className="text-pw-gray text-sm">Strong and growing demand in Nigeria.</p>
            )}
            {topEmployers.length > 0 && (
              <div>
                <p className="text-xs font-bold text-pw-blue mb-2 flex items-center gap-1"><Building2 className="w-3 h-3" />Top Employers</p>
                <ul className="space-y-1">
                  {topEmployers.map((e, i) => (
                    <li key={i} className="text-pw-gray text-xs flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-pw-blue flex-shrink-0" />
                      {e}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Skills + Qualifications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-pw-surface border border-pw-white/10 rounded-2xl p-6">
            <h2 className="text-pw-white font-bold text-lg mb-4">Required Skills</h2>
            {loadingAi && !aiData ? (
              <div className="flex flex-wrap gap-2">{[1,2,3,4,5,6].map(i => <div key={i} className="h-8 w-24 bg-pw-white/5 rounded-full animate-pulse" />)}</div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, i) => {
                  const colors = ['#0056FF', '#2277FF'];
                  const c = colors[i % colors.length];
                  return (
                    <span key={skill} className="px-3 py-1.5 rounded-full text-sm font-semibold border" style={{ borderColor: c + '60', color: c, backgroundColor: c + '15' }}>
                      {skill}
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-pw-surface border border-pw-white/10 rounded-2xl p-6">
            <h2 className="text-pw-white font-bold text-lg mb-4">Qualifications</h2>
            {loadingAi && !aiData ? (
              <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-4 bg-pw-white/5 rounded animate-pulse" />)}</div>
            ) : qualifications ? (
              <div className="text-sm space-y-3">
                <p className="text-pw-gray"><span className="text-pw-white font-bold">Degree:</span> {qualifications.degree}</p>
                {qualifications.certifications?.length > 0 && (
                  <div>
                    <p className="text-pw-white font-bold mb-1">Key Certifications:</p>
                    <ul className="space-y-1">
                      {qualifications.certifications.map((c, i) => (
                        <li key={i} className="text-pw-gray flex items-center gap-2"><span className="w-1.5 h-1.5 bg-pw-blue rounded-full" />{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <p className="text-pw-gray"><span className="text-pw-white font-bold">Also Relevant:</span> {qualifications.relevant}</p>
                {career.professional_bodies?.length > 0 && (
                  <div>
                    <p className="text-pw-white font-bold mb-1">Professional Bodies:</p>
                    {career.professional_bodies.map((b, i) => (
                      <p key={i} className="text-pw-gray text-xs">{b}</p>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-pw-gray text-sm">Loading qualifications...</p>
            )}
          </div>
        </div>

        {/* Roadmap + Skill Gap */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-pw-surface border border-pw-white/10 rounded-2xl p-6">
            <h2 className="text-pw-white font-bold text-lg mb-5 flex items-center gap-2">
              Your Course Roadmap (DELSU)
              {aiData && <span className="text-xs text-pw-blue bg-pw-blue/10 border border-pw-blue/20 px-2 py-0.5 rounded-full flex items-center gap-1"><Sparkles className="w-3 h-3" />AI</span>}
            </h2>
            {loadingAi && !aiData ? (
              <div className="space-y-3">
                {[1,2,3,4].map(i => <div key={i} className="h-12 bg-pw-white/5 rounded-xl animate-pulse" />)}
              </div>
            ) : roadmap.length > 0 ? (
              <div className="space-y-3">
                {roadmap.map((sem, i) => (
                  <div key={i} className="relative pl-5">
                    <div className="absolute left-0 top-3.5 w-3 h-3 rounded-full border-2 flex-shrink-0"
                      style={{ borderColor: i % 2 === 0 ? '#0056FF' : '#2277FF', backgroundColor: i % 2 === 0 ? '#0056FF' : '#2277FF' }}
                    />
                    {i < roadmap.length - 1 && (
                      <div className="absolute left-[5px] top-6 w-px h-full bg-white/10" />
                    )}
                    <button
                      onClick={() => setOpenSem(openSem === i ? -1 : i)}
                      className="w-full flex items-center justify-between bg-pw-surface2 border border-white/6 rounded-xl px-4 py-3 hover:border-white/15 transition-all"
                    >
                      <span className="text-pw-white font-semibold text-sm">{sem.sem}</span>
                      {openSem === i ? <ChevronUp className="w-4 h-4 text-pw-gray" /> : <ChevronDown className="w-4 h-4 text-pw-gray" />}
                    </button>
                    {openSem === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="bg-pw-surface border border-pw-white/5 border-t-0 rounded-b-xl px-4 pb-3 overflow-hidden"
                      >
                        <ol className="list-decimal list-inside space-y-1 pt-3">
                          {sem.courses.map((c, j) => (
                            <li key={j} className="text-pw-gray text-sm font-bold">{c}</li>
                          ))}
                        </ol>
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-pw-gray text-sm">Roadmap will appear here once AI generates it.</p>
            )}
          </div>

          {/* Skill Gap Chart */}
          <div className="bg-pw-surface border border-pw-white/10 rounded-2xl p-6">
            <h2 className="text-pw-white font-bold text-lg mb-4">Skill Gap Analyzer</h2>
            {loadingAi && !aiData ? (
              <div className="h-48 bg-pw-white/5 rounded-xl animate-pulse" />
            ) : skillGapData.length > 0 ? (
              <>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={skillGapData} barSize={10} barGap={2}>
                      <XAxis dataKey="skill" stroke="#8B9CC8" fontSize={9} tickLine={false} axisLine={false} />
                      <YAxis domain={[0, 100]} stroke="#8B9CC8" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#080818', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                      <Bar dataKey="current" name="Current skills" fill="#2277FF" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="required" name="Required skills" fill="#0056FF" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex gap-4 mt-2">
                  <div className="flex items-center gap-1.5 text-xs text-pw-gray"><div className="w-3 h-3 rounded-sm bg-pw-lavender" /> Current skills</div>
                  <div className="flex items-center gap-1.5 text-xs text-pw-gray"><div className="w-3 h-3 rounded-sm bg-pw-blue" /> Required skills</div>
                </div>
              </>
            ) : (
              <p className="text-pw-gray text-sm">Skill gap data will appear here.</p>
            )}

            {/* 🔥 Live Job Openings */}
            <div className="mt-6 pt-6 border-t border-pw-white/5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-pw-white font-bold text-lg flex items-center">
                  <span className="relative flex h-2 w-2 mr-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0056FF] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0056FF]"></span>
                  </span>
                  Live Openings
                </h2>
                <button
                  onClick={() => setRefreshTrigger(prev => prev + 1)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-pw-surface2 border border-pw-white/10 rounded-lg text-pw-gray hover:text-pw-white hover:border-pw-blue/30 text-[10px] font-bold transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh
                </button>
              </div>
              {loadingJobs ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[1,2].map(i => <div key={i} className="h-28 bg-pw-white/5 rounded-xl animate-pulse" />)}
                </div>
              ) : jobs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {jobs.map(job => (
                    <a
                      key={job.id}
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group p-4 rounded-2xl bg-pw-surface2 border border-pw-white/5 hover:border-pw-blue/30 transition-all"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{job.logo}</span>
                          <div>
                            <h4 className="text-sm font-bold text-pw-white group-hover:text-pw-blue transition-colors leading-tight">{job.title}</h4>
                            <p className="text-[10px] text-pw-gray">{job.company}</p>
                          </div>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-pw-gray group-hover:text-pw-blue transition-colors flex-shrink-0 mt-0.5" />
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-pw-gray mb-2">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-pw-blue">{job.salary}</span>
                        <span className="text-[9px] text-pw-gray">{job.posted}</span>
                      </div>
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        {job.tags.map(t => (
                          <span key={t} className="text-[8px] px-1.5 py-0.5 rounded-md bg-pw-blue/5 border border-pw-blue/10 text-pw-blue font-bold">{t}</span>
                        ))}
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-pw-gray text-sm">No live openings found for this career at the moment.</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-pw-blue text-white font-bold hover:bg-pw-azure transition-all shadow-[0_0_15px_rgba(0,86,255,0.3)] text-sm">
                <Download className="w-4 h-4" /> Download Report
              </button>
              <button
                onClick={handleSave}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold transition-all border text-sm ${saved ? 'bg-pw-blue/10 text-pw-blue border-pw-blue/30' : 'bg-pw-blue text-white border-transparent hover:bg-pw-azure'}`}
              >
                <Bookmark className="w-4 h-4" /> {saved ? 'Saved ✓' : 'Save Career'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareerDetail;
