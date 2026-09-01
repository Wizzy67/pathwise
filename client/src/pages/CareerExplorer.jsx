import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Loader2, Briefcase, ExternalLink, MapPin, Flame, RefreshCw } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import api from '../services/api';

const FIELD_COLORS = {
  STEM:            { text: 'var(--blue)', bg: 'var(--lavender)',  border: 'var(--border)' },
  Technology:      { text: 'var(--blue)', bg: 'var(--lavender)',  border: 'var(--border)' },
  Medicine:        { text: 'var(--blue)', bg: 'var(--lavender)',  border: 'var(--border)' },
  Law:             { text: 'var(--blue)', bg: 'var(--lavender)',  border: 'var(--border)' },
  Business:        { text: 'var(--blue)', bg: 'var(--lavender)',  border: 'var(--border)' },
  Engineering:     { text: 'var(--blue)', bg: 'var(--lavender)',  border: 'var(--border)' },
  Arts:            { text: 'var(--blue)', bg: 'var(--lavender)',  border: 'var(--border)' },
  'Social Sciences':{ text: 'var(--blue)', bg: 'var(--lavender)',  border: 'var(--border)' },
  Science:         { text: 'var(--blue)', bg: 'var(--lavender)',  border: 'var(--border)' },
};

const renderCareerIcon = (iconName) => {
  if (!iconName) return <Briefcase className="w-6 h-6" />;
  const IconComp = LucideIcons[iconName];
  if (IconComp) return <IconComp className="w-6 h-6" />;
  return <Briefcase className="w-6 h-6" />;
};

const DEMAND_COLORS = { 'Very High': 'var(--blue)', High: 'var(--azure)', Medium: 'var(--ash)', Low: '#EF4444' };

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
    <div className="max-w-6xl mx-auto w-full pb-8" style={{ fontFamily: 'Open Sans' }}>
      {/* Heading */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-[var(--ink)] mb-2" style={{ fontFamily: 'Nunito' }}>
          Explore All Careers
          <span className="block w-24 h-1 bg-[var(--blue)] rounded-full mt-3" />
        </h1>
        <p className="text-[var(--graphite)] mt-3">Click any career to get an AI-generated roadmap personalized for you.</p>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('careers')}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all border ${activeTab === 'careers' ? 'bg-[var(--blue)] text-white border-transparent' : 'bg-[var(--mist)] text-[var(--graphite)] border-[var(--border)] hover:border-[var(--blue)] hover:text-[var(--ink)]'}`}
        >
          <Briefcase className="w-4 h-4 inline mr-1.5 -mt-0.5" /> Career Paths
        </button>
        <button
          onClick={() => setActiveTab('jobs')}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all border flex items-center ${activeTab === 'jobs' ? 'bg-[var(--blue)] text-white border-transparent' : 'bg-[var(--mist)] text-[var(--graphite)] border-[var(--border)] hover:border-[var(--blue)] hover:text-[var(--ink)]'}`}
        >
          <span className="relative flex h-2 w-2 mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          Live Job Board
        </button>
      </div>

      {/* ═══ CAREERS TAB ═══ */}
      {activeTab === 'careers' && (
        <>
          {/* Search */}
          <div className="relative mb-5">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--graphite)]" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search careers..."
              className="w-full bg-[var(--fog)] border-2 border-[var(--border)] rounded-xl pl-14 pr-6 py-4 text-[var(--ink)] placeholder-[var(--ash)] focus:outline-none focus:border-[var(--blue)] transition-all text-base"
            />
          </div>

          {/* Field Filter Chips */}
          {!loading && (
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
              <button
                onClick={() => setActiveField('')}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all flex-shrink-0 ${!activeField ? 'border-[var(--blue)] bg-[var(--lavender)] text-[var(--blue)]' : 'border-[var(--border)] bg-[var(--fog)] text-[var(--graphite)] hover:border-[var(--blue)] hover:text-[var(--blue)]'}`}
              >
                All
              </button>
              {fields.map(f => (
                <button
                  key={f}
                  onClick={() => setActiveField(f === activeField ? '' : f)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-all flex-shrink-0 ${activeField === f ? 'border-[var(--blue)] bg-[var(--lavender)] text-[var(--blue)]' : 'border-[var(--border)] bg-[var(--fog)] text-[var(--graphite)] hover:border-[var(--blue)] hover:text-[var(--blue)]'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          )}

          {/* Results count */}
          {!loading && <p className="text-[var(--azure)] font-semibold text-sm mb-5">{filtered.length} career{filtered.length !== 1 ? 's' : ''} found</p>}

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="w-10 h-10 animate-spin text-[var(--blue)]" />
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
                      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 hover:border-[var(--blue)] transition-all group cursor-pointer h-full flex flex-col justify-between">
                        <div>
                          {/* Icon + Field Badge */}
                          <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[var(--lavender)] border border-[var(--lavender)] text-[var(--blue)] group-hover:bg-[var(--blue)] group-hover:text-white transition-all duration-300">
                              {iconElement}
                            </div>
                            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md bg-[var(--lavender)] text-[var(--blue)]">
                              {career.field}
                            </span>
                          </div>

                          {/* Title */}
                          <h3 className="text-[var(--ink)] font-bold text-lg leading-tight group-hover:text-[var(--blue)] transition-colors mb-2" style={{ fontFamily: 'Nunito' }}>
                            {career.title}
                          </h3>

                          {/* Description */}
                          <p className="text-[var(--graphite)] text-xs leading-relaxed mb-4 line-clamp-2">{career.description}</p>
                        </div>

                        <div>
                          {/* Salary */}
                          <p className="font-bold text-sm text-[var(--blue)] mb-4">{career.salary_range}</p>

                          {/* Demand + CGPA */}
                          <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
                            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[var(--lavender)] text-[var(--blue)]">
                              {career.demand} Demand
                            </span>
                            <span className="text-xs text-[var(--graphite)]">
                              CGPA: <strong className="text-[var(--blue)]">{career.required_cgpa_hint}</strong>
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
                    className="px-6 py-2.5 rounded-full border border-[var(--blue)] text-[var(--blue)] hover:bg-[var(--blue)] hover:text-white font-bold transition-all flex items-center gap-2 text-sm bg-[var(--surface)]"
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
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--graphite)]" />
            <input
              type="text"
              value={jobSearch}
              onChange={e => setJobSearch(e.target.value)}
              placeholder="Search jobs by title, company, or skill..."
              className="w-full bg-[var(--fog)] border-2 border-[var(--border)] rounded-xl pl-14 pr-6 py-4 text-[var(--ink)] placeholder-[var(--ash)] focus:outline-none focus:border-[var(--blue)] transition-all text-base"
            />
          </div>

          {/* Job Field Chips */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
            <button
              onClick={() => setJobField('')}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all flex-shrink-0 ${!jobField ? 'border-[var(--blue)] bg-[var(--lavender)] text-[var(--blue)]' : 'border-[var(--border)] bg-[var(--fog)] text-[var(--graphite)] hover:border-[var(--blue)] hover:text-[var(--blue)]'}`}
            >
              All Fields
            </button>
            {fields.map(f => (
              <button
                key={f}
                onClick={() => setJobField(f === jobField ? '' : f)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all flex-shrink-0 ${jobField === f ? 'border-[var(--blue)] bg-[var(--lavender)] text-[var(--blue)]' : 'border-[var(--border)] bg-[var(--fog)] text-[var(--graphite)] hover:border-[var(--blue)] hover:text-[var(--blue)]'}`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Job Count */}
          <div className="flex justify-between items-center mb-5">
            <p className="text-[var(--blue)] font-semibold text-sm flex items-center">
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--blue)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--blue)]"></span>
              </span>
              {jobs.length} live position{jobs.length !== 1 ? 's' : ''} available
            </p>
            <button
              onClick={() => setRefreshTrigger(prev => prev + 1)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[var(--mist)] border border-[var(--border)] rounded-xl text-[var(--graphite)] hover:text-[var(--ink)] hover:border-[var(--blue)] text-xs font-bold transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh Board
            </button>
          </div>

          {/* Job Grid */}
          {loadingJobs ? (
            <div className="flex justify-center py-24">
              <Loader2 className="w-10 h-10 animate-spin text-[var(--blue)]" />
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
                  className="group bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 hover:border-[var(--blue)] transition-all cursor-pointer h-full flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{job.logo}</span>
                        <div>
                          <h3 className="text-[var(--ink)] font-bold text-base leading-tight group-hover:text-[var(--blue)] transition-colors" style={{ fontFamily: 'Nunito' }}>{job.title}</h3>
                          <p className="text-xs text-[var(--graphite)] mt-0.5">{job.company}</p>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-[var(--graphite)] group-hover:text-[var(--blue)] transition-colors flex-shrink-0 mt-1" />
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[var(--graphite)] mb-3">
                      <MapPin className="w-3.5 h-3.5" />
                      {job.location}
                    </div>

                    <div className="flex gap-1.5 flex-wrap mb-4">
                      {job.tags.map(t => (
                        <span key={t} className="text-[9px] px-2 py-0.5 rounded-md bg-[var(--lavender)] border border-[var(--lavender)] text-[var(--blue)] font-bold">{t}</span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
                    <span className="text-sm font-bold text-[var(--blue)]">{job.salary}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-[var(--mist)] text-[var(--graphite)] font-bold">{job.type}</span>
                      <span className="text-[9px] text-[var(--graphite)]">{job.posted}</span>
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
                    className="px-6 py-2.5 rounded-full border border-[var(--blue)] text-[var(--blue)] hover:bg-[var(--blue)] hover:text-white font-bold transition-all flex items-center gap-2 text-sm bg-[var(--surface)]"
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
