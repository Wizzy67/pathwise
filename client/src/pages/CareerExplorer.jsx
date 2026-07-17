import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Loader2, Briefcase, ExternalLink, MapPin, Flame, RefreshCw } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import api from '../services/api';

const FIELD_COLORS = {
  STEM:            { text: '#0056FF', bg: 'rgba(0,86,255,0.12)',  border: 'rgba(0,86,255,0.3)' },
  Technology:      { text: '#0056FF', bg: 'rgba(0,86,255,0.12)',  border: 'rgba(0,86,255,0.3)' },
  Medicine:        { text: '#0056FF', bg: 'rgba(0,86,255,0.12)',  border: 'rgba(0,86,255,0.3)' },
  Law:             { text: '#0056FF', bg: 'rgba(0,86,255,0.12)',  border: 'rgba(0,86,255,0.3)' },
  Business:        { text: '#0056FF', bg: 'rgba(0,86,255,0.12)',  border: 'rgba(0,86,255,0.3)' },
  Engineering:     { text: '#0056FF', bg: 'rgba(0,86,255,0.12)',  border: 'rgba(0,86,255,0.3)' },
  Arts:            { text: '#0056FF', bg: 'rgba(0,86,255,0.12)',  border: 'rgba(0,86,255,0.3)' },
  'Social Sciences':{ text: '#0056FF', bg: 'rgba(0,86,255,0.12)',  border: 'rgba(0,86,255,0.3)' },
  Science:         { text: '#0056FF', bg: 'rgba(0,86,255,0.12)',  border: 'rgba(0,86,255,0.3)' },
};

const renderCareerIcon = (iconName) => {
  if (!iconName) return <Briefcase className="w-6 h-6" />;
  const IconComp = LucideIcons[iconName];
  if (IconComp) return <IconComp className="w-6 h-6" />;
  return <Briefcase className="w-6 h-6" />;
};

const DEMAND_COLORS = { 'Very High': '#0056FF', High: '#2277FF', Medium: '#8B9CC8', Low: '#EF4444' };

const CareerExplorer = () => {
  const [careers, setCareers] = useState([]);
  const [visibleCount, setVisibleCount] = useState(15);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeField, setActiveField] = useState('');
  const [activeTab, setActiveTab] = useState('careers'); // 'careers' | 'jobs'
  const [jobs, setJobs] = useState([]);
  const [visibleJobsCount, setVisibleJobsCount] = useState(15);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [jobSearch, setJobSearch] = useState('');
  const [jobField, setJobField] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchCareers = async () => {
      try {
        const res = await api.get('/data/careers');
        setCareers(res.data);
      } catch {
        // use empty
      } finally {
        setLoading(false);
      }
    };
    fetchCareers();
  }, []);

  // Fetch jobs when tab switches or filters change
  useEffect(() => {
    if (activeTab !== 'jobs') return;
    const fetchJobs = async () => {
      setLoadingJobs(true);
      try {
        const params = new URLSearchParams();
        if (jobField) params.set('field', jobField);
        if (jobSearch) params.set('search', jobSearch);
        params.set('limit', '100');
        const res = await api.get(`/jobs/all?${params.toString()}`);
        setJobs(res.data.jobs || []);
      } catch {
        setJobs([]);
      } finally {
        setLoadingJobs(false);
      }
    };
    fetchJobs();
  }, [activeTab, jobField, jobSearch, refreshTrigger]);

  const fields = useMemo(() => [...new Set(careers.map(c => c.field))], [careers]);

  const filtered = useMemo(() => {
    return careers.filter(c => {
      const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
                          c.description?.toLowerCase().includes(search.toLowerCase());
      const matchField  = !activeField || c.field === activeField;
      return matchSearch && matchField;
    });
  }, [careers, search, activeField]);

  useEffect(() => {
    setVisibleCount(15);
  }, [search, activeField]);

  useEffect(() => {
    setVisibleJobsCount(15);
  }, [jobSearch, jobField]);

  return (
    <div className="max-w-6xl mx-auto w-full pb-8">
      {/* Heading */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-pw-white mb-2">
          Explore All Careers
          <span className="block w-24 h-1 bg-pw-blue rounded-full mt-3" />
        </h1>
        <p className="text-pw-gray mt-3">Click any career to get an AI-generated roadmap personalized for you.</p>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('careers')}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'careers' ? 'bg-pw-blue text-white shadow-[0_0_15px_rgba(0,86,255,0.3)]' : 'bg-pw-surface2 text-pw-gray border border-pw-white/10 hover:border-pw-blue/30 hover:text-pw-white'}`}
        >
          <Briefcase className="w-4 h-4 inline mr-1.5 -mt-0.5" /> Career Paths
        </button>
        <button
          onClick={() => setActiveTab('jobs')}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center ${activeTab === 'jobs' ? 'bg-pw-blue text-white shadow-[0_0_15px_rgba(0,86,255,0.3)]' : 'bg-pw-surface2 text-pw-gray border border-pw-white/10 hover:border-pw-blue/30 hover:text-pw-white'}`}
        >
          <span className="relative flex h-2 w-2 mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0056FF] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0056FF]"></span>
          </span>
          Live Job Board
        </button>
      </div>

      {/* ═══ CAREERS TAB ═══ */}
      {activeTab === 'careers' && (
        <>
          {/* Search */}
          <div className="relative mb-5">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-pw-gray" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search careers..."
              className="w-full bg-transparent border-2 border-pw-blue/60 rounded-xl pl-14 pr-6 py-4 text-pw-white placeholder-pw-gray/50 focus:outline-none focus:border-pw-blue transition-all text-base"
            />
          </div>

          {/* Field Filter Chips */}
          {!loading && (
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
              <button
                onClick={() => setActiveField('')}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all flex-shrink-0 ${!activeField ? 'border-pw-blue bg-pw-blue/10 text-pw-blue' : 'border-pw-white/15 bg-pw-white/5 text-pw-gray/90 hover:border-pw-blue hover:text-pw-blue'}`}
              >
                All
              </button>
              {fields.map(f => (
                <button
                  key={f}
                  onClick={() => setActiveField(f === activeField ? '' : f)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-all flex-shrink-0 ${activeField === f ? 'border-pw-blue bg-pw-blue/10 text-pw-blue' : 'border-pw-white/15 bg-pw-white/5 text-pw-gray/90 hover:border-pw-blue hover:text-pw-blue'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          )}

          {/* Results count */}
          {!loading && <p className="text-pw-azure font-semibold text-sm mb-5">{filtered.length} career{filtered.length !== 1 ? 's' : ''} found</p>}

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="w-10 h-10 animate-spin text-pw-blue" />
            </div>
          ) : (
            <>
              {/* Career Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.slice(0, visibleCount).map((career, i) => {
                const iconElement = renderCareerIcon(career.icon);
                return (
                  <motion.div
                    key={career.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Link to={`/career/${career.id}`}>
                      <div className="bg-pw-surface border border-pw-white/10 rounded-2xl p-5 hover:border-pw-white/20 hover:bg-pw-surface2 transition-all group cursor-pointer h-full flex flex-col justify-between">
                        <div>
                          {/* Icon + Field Badge */}
                          <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-pw-blue/10 border border-pw-blue/20 text-pw-blue group-hover:bg-pw-blue group-hover:text-white transition-all duration-300">
                              {iconElement}
                            </div>
                            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md bg-pw-blue/10 border border-pw-blue/20 text-pw-blue">
                              {career.field}
                            </span>
                          </div>

                          {/* Title */}
                          <h3 className="text-pw-white font-bold text-lg leading-tight group-hover:text-pw-blue transition-colors mb-2">
                            {career.title}
                          </h3>

                          {/* Description */}
                          <p className="text-pw-gray text-xs leading-relaxed mb-4 line-clamp-2">{career.description}</p>
                        </div>

                        <div>
                          {/* Salary */}
                          <p className="font-bold text-sm text-pw-blue mb-4">{career.salary_range}</p>

                          {/* Demand + CGPA */}
                          <div className="flex items-center justify-between pt-3 border-t border-pw-white/5">
                            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-pw-blue/10 text-pw-blue border border-pw-blue/20">
                              {career.demand} Demand
                            </span>
                            <span className="text-xs text-pw-gray">
                              CGPA: <strong className="text-pw-blue">{career.required_cgpa_hint}</strong>
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
              </div>

              {/* View More Button */}
              {visibleCount < filtered.length && (
                <div className="mt-8 flex justify-center">
                  <button 
                    onClick={() => setVisibleCount(filtered.length)} 
                    className="px-6 py-2.5 rounded-full border border-pw-blue/40 text-pw-blue hover:bg-pw-blue hover:text-white font-bold transition-all hover:shadow-[0_0_15px_rgba(0,86,255,0.3)] flex items-center gap-2 text-sm"
                  >
                    View all careers
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ═══ JOB BOARD TAB ═══ */}
      {activeTab === 'jobs' && (
        <>
          {/* Job Search */}
          <div className="relative mb-5">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-pw-gray" />
            <input
              type="text"
              value={jobSearch}
              onChange={e => setJobSearch(e.target.value)}
              placeholder="Search jobs by title, company, or skill..."
              className="w-full bg-transparent border-2 border-pw-blue/60 rounded-xl pl-14 pr-6 py-4 text-pw-white placeholder-pw-gray/50 focus:outline-none focus:border-pw-blue transition-all text-base"
            />
          </div>

          {/* Job Field Chips */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
            <button
              onClick={() => setJobField('')}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all flex-shrink-0 ${!jobField ? 'border-pw-blue bg-pw-blue/10 text-pw-blue' : 'border-pw-white/15 bg-pw-white/5 text-pw-gray/90 hover:border-pw-blue hover:text-pw-blue'}`}
            >
              All Fields
            </button>
            {fields.map(f => (
              <button
                key={f}
                onClick={() => setJobField(f === jobField ? '' : f)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all flex-shrink-0 ${jobField === f ? 'border-pw-blue bg-pw-blue/10 text-pw-blue' : 'border-pw-white/15 bg-pw-white/5 text-pw-gray/90 hover:border-pw-blue hover:text-pw-blue'}`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Job Count */}
          <div className="flex justify-between items-center mb-5">
            <p className="text-pw-blue font-semibold text-sm flex items-center">
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0056FF] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0056FF]"></span>
              </span>
              {jobs.length} live position{jobs.length !== 1 ? 's' : ''} available
            </p>
            <button
              onClick={() => setRefreshTrigger(prev => prev + 1)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-pw-surface2 border border-pw-white/10 rounded-xl text-pw-gray hover:text-pw-white hover:border-pw-blue/30 text-xs font-bold transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh Board
            </button>
          </div>

          {/* Job Grid */}
          {loadingJobs ? (
            <div className="flex justify-center py-24">
              <Loader2 className="w-10 h-10 animate-spin text-pw-blue" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {jobs.slice(0, visibleJobsCount).map((job, i) => (
                <motion.a
                  key={job.id}
                  href={job.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="group bg-pw-surface border border-pw-white/10 rounded-2xl p-5 hover:border-pw-blue/30 hover:bg-pw-surface2 transition-all cursor-pointer h-full flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{job.logo}</span>
                        <div>
                          <h3 className="text-pw-white font-bold text-base leading-tight group-hover:text-pw-blue transition-colors">{job.title}</h3>
                          <p className="text-xs text-pw-gray mt-0.5">{job.company}</p>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-pw-gray group-hover:text-pw-blue transition-colors flex-shrink-0 mt-1" />
                    </div>

                    <div className="flex items-center gap-2 text-xs text-pw-gray mb-3">
                      <MapPin className="w-3.5 h-3.5" />
                      {job.location}
                    </div>

                    <div className="flex gap-1.5 flex-wrap mb-4">
                      {job.tags.map(t => (
                        <span key={t} className="text-[9px] px-2 py-0.5 rounded-md bg-pw-blue/5 border border-pw-blue/10 text-pw-blue font-bold">{t}</span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-pw-white/5">
                    <span className="text-sm font-bold text-pw-blue">{job.salary}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-pw-white/5 text-pw-gray font-bold">{job.type}</span>
                      <span className="text-[9px] text-pw-gray">{job.posted}</span>
                    </div>
                  </div>
                </motion.a>
              ))}
              </div>
              
              {/* View More Button */}
              {visibleJobsCount < jobs.length && (
                <div className="mt-8 flex justify-center">
                  <button 
                    onClick={() => setVisibleJobsCount(jobs.length)} 
                    className="px-6 py-2.5 rounded-full border border-pw-blue/40 text-pw-blue hover:bg-pw-blue hover:text-white font-bold transition-all hover:shadow-[0_0_15px_rgba(0,86,255,0.3)] flex items-center gap-2 text-sm"
                  >
                    View all live jobs
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default CareerExplorer;

