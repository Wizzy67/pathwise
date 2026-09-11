import { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Loader2,
  Briefcase,
  ExternalLink,
  MapPin,
  Flame,
  RefreshCw,
  ChevronRight,
  ArrowRight,
  Laptop,
  Stethoscope,
  Scale,
  TrendingUp,
  Palette,
  FlaskConical,
  Users,
  Sparkles,
  Filter,
  X,
  Building2,
  GraduationCap,
  Globe2,
  Clock
} from 'lucide-react';
import api from '../services/api';

// ─────────────────────────────────────────────────────────────────────────────
// Category Metadata & Theming
// ─────────────────────────────────────────────────────────────────────────────
const CATEGORY_META = {
  STEM: {
    label: 'STEM & Technology',
    shortLabel: 'STEM & Tech',
    icon: Laptop,
    emoji: '💻',
    color: '#1944f1',
    bgColor: 'var(--lavender)',
    borderColor: '#d0d9fc',
    faculty: 'Faculty of Science & Engineering',
    desc: 'Software, Data, Cybersecurity, and Engineering systems'
  },
  Medicine: {
    label: 'Health & Medical Sciences',
    shortLabel: 'Health & Medicine',
    icon: Stethoscope,
    emoji: '🩺',
    color: '#0284c7',
    bgColor: '#e0f2fe',
    borderColor: '#bae6fd',
    faculty: 'College of Health Sciences',
    desc: 'Clinical medicine, Pharmacy, Nursing, and Health research'
  },
  Business: {
    label: 'Business & Management',
    shortLabel: 'Business & Finance',
    icon: TrendingUp,
    emoji: '💼',
    color: '#059669',
    bgColor: '#d1fae5',
    borderColor: '#a7f3d0',
    faculty: 'Faculty of Management Sciences',
    desc: 'Accounting, Banking, Consulting, and Corporate strategy'
  },
  Engineering: {
    label: 'Engineering & Applied Tech',
    shortLabel: 'Engineering',
    icon: Laptop,
    emoji: '🏗️',
    color: '#0891b2',
    bgColor: '#cffafe',
    borderColor: '#a5f3fc',
    faculty: 'Faculty of Engineering',
    desc: 'Civil, Petroleum, Electrical, and Mechanical engineering'
  },
  Arts: {
    label: 'Arts, Design & Media',
    shortLabel: 'Arts & Media',
    icon: Palette,
    emoji: '🎨',
    color: '#7c3aed',
    bgColor: '#ede9fe',
    borderColor: '#ddd6fe',
    faculty: 'Faculty of Arts',
    desc: 'UI/UX Design, Mass Media, Public Relations, and Creative arts'
  },
  Science: {
    label: 'Natural & Applied Sciences',
    shortLabel: 'Applied Sciences',
    icon: FlaskConical,
    emoji: '🔬',
    color: '#d97706',
    bgColor: '#fef3c7',
    borderColor: '#fde68a',
    faculty: 'Faculty of Science & Agriculture',
    desc: 'Biotechnology, Microbiology, Food Science, and Geology'
  },
  'Social Sciences': {
    label: 'Social Sciences & Policy',
    shortLabel: 'Social Sciences',
    icon: Users,
    emoji: '🌍',
    color: '#ea580c',
    bgColor: '#ffedd5',
    borderColor: '#fed7aa',
    faculty: 'Faculty of the Social Sciences',
    desc: 'Economics, Psychology, Political analysis, and Planning'
  },
  Law: {
    label: 'Law & Legal Studies',
    shortLabel: 'Law & Legal',
    icon: Scale,
    emoji: '⚖️',
    color: '#dc2626',
    bgColor: '#fee2e2',
    borderColor: '#fecaca',
    faculty: 'Faculty of Law',
    desc: 'Corporate practice, Litigation, and Advocacy'
  }
};

const ORDERED_FIELDS = ['STEM', 'Medicine', 'Business', 'Arts', 'Science', 'Social Sciences', 'Law'];
const JOB_ORDERED_FIELDS = ['STEM', 'Medicine', 'Business', 'Engineering', 'Science', 'Arts', 'Social Sciences', 'Law'];

const CareerExplorer = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [activeField, setActiveField] = useState(searchParams.get('category') || '');
  const [activeTab, setActiveTab] = useState('careers'); // 'careers' | 'jobs'

  // Jobs state
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [jobSearch, setJobSearch] = useState('');
  const [jobField, setJobField] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState(''); // '' | 'siwes' | 'graduate' | 'remote' | 'delta'
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Sync URL search params
  useEffect(() => {
    const urlQuery = searchParams.get('search');
    if (urlQuery !== null && urlQuery !== search) {
      setSearch(urlQuery);
    }
    const urlCat = searchParams.get('category');
    if (urlCat !== null && urlCat !== activeField) {
      setActiveField(urlCat);
    }
  }, [searchParams]);

  // Fetch careers
  useEffect(() => {
    const fetchCareers = async () => {
      try {
        const res = await api.get('/data/careers');
        setCareers(res.data || []);
      } catch (err) {
        console.error('Failed to load careers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCareers();
  }, []);

  // Fetch live jobs when jobs tab is active
  useEffect(() => {
    if (activeTab !== 'jobs') return;
    const fetchJobs = async () => {
      setLoadingJobs(true);
      try {
        const params = new URLSearchParams();
        params.set('limit', '60');
        const res = await api.get(`/jobs/all?${params.toString()}`);
        setJobs(res.data.jobs || []);
      } catch {
        setJobs([]);
      } finally {
        setLoadingJobs(false);
      }
    };
    fetchJobs();
  }, [activeTab, refreshTrigger]);

  // Group careers by field
  const careersByField = useMemo(() => {
    const map = {};
    careers.forEach(c => {
      const f = c.field || 'STEM';
      if (!map[f]) map[f] = [];
      map[f].push(c);
    });
    return map;
  }, [careers]);

  // Group jobs by field
  const jobsByField = useMemo(() => {
    const map = {};
    jobs.forEach(j => {
      const f = j.field || 'STEM';
      if (!map[f]) map[f] = [];
      map[f].push(j);
    });
    return map;
  }, [jobs]);

  // Filtered careers
  const filteredCareers = useMemo(() => {
    return careers.filter(c => {
      const matchSearch = !search.trim() ||
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.description?.toLowerCase().includes(search.toLowerCase()) ||
        c.field.toLowerCase().includes(search.toLowerCase()) ||
        (Array.isArray(c.core_skills) && c.core_skills.some(s => s.toLowerCase().includes(search.toLowerCase())));
      const matchField = !activeField || c.field === activeField;
      return matchSearch && matchField;
    });
  }, [careers, search, activeField]);

  // Filtered jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter(j => {
      // 1. Text search
      const q = jobSearch.trim().toLowerCase();
      const matchSearch = !q ||
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.location.toLowerCase().includes(q) ||
        (Array.isArray(j.tags) && j.tags.some(t => t.toLowerCase().includes(q)));

      // 2. Field filter
      const matchField = !jobField || j.field === jobField;

      // 3. Type / Special tag filter
      let matchType = true;
      if (jobTypeFilter === 'siwes') {
        matchType = j.type.toLowerCase().includes('intern') ||
                    j.type.toLowerCase().includes('siwes') ||
                    (Array.isArray(j.tags) && j.tags.some(t => t.toLowerCase().includes('siwes') || t.toLowerCase().includes('intern')));
      } else if (jobTypeFilter === 'graduate') {
        matchType = j.type.toLowerCase().includes('graduate') ||
                    (Array.isArray(j.tags) && j.tags.some(t => t.toLowerCase().includes('graduate') || t.toLowerCase().includes('nysc')));
      } else if (jobTypeFilter === 'remote') {
        matchType = j.location.toLowerCase().includes('remote');
      } else if (jobTypeFilter === 'delta') {
        matchType = j.location.toLowerCase().includes('delta') ||
                    j.location.toLowerCase().includes('asaba') ||
                    j.location.toLowerCase().includes('warri') ||
                    j.location.toLowerCase().includes('oghara') ||
                    j.location.toLowerCase().includes('sapele') ||
                    (Array.isArray(j.tags) && j.tags.some(t => t.toLowerCase().includes('delta')));
      }

      return matchSearch && matchField && matchType;
    });
  }, [jobs, jobSearch, jobField, jobTypeFilter]);

  // Quick field select handler
  const handleSelectField = (field) => {
    if (activeField === field) {
      setActiveField('');
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        next.delete('category');
        return next;
      });
    } else {
      setActiveField(field);
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        if (field) next.set('category', field);
        else next.delete('category');
        return next;
      });
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setActiveField('');
    setSearchParams({});
  };

  const handleClearJobFilters = () => {
    setJobSearch('');
    setJobField('');
    setJobTypeFilter('');
  };

  // Job counts summary
  const siwesCount = useMemo(() => jobs.filter(j => j.type.toLowerCase().includes('intern') || j.type.toLowerCase().includes('siwes') || (j.tags || []).some(t => t.toLowerCase().includes('siwes'))).length, [jobs]);
  const graduateCount = useMemo(() => jobs.filter(j => j.type.toLowerCase().includes('graduate') || (j.tags || []).some(t => t.toLowerCase().includes('graduate') || t.toLowerCase().includes('nysc'))).length, [jobs]);
  const deltaCount = useMemo(() => jobs.filter(j => j.location.toLowerCase().includes('delta') || (j.tags || []).some(t => t.toLowerCase().includes('delta'))).length, [jobs]);
  const remoteCount = useMemo(() => jobs.filter(j => j.location.toLowerCase().includes('remote')).length, [jobs]);

  return (
    <div className="max-w-6xl mx-auto w-full space-y-4 pb-12 select-none">
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
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* ── TOP APP EXPLORE HEADER ── */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[var(--ink)] heading-font leading-tight">
            {activeTab === 'careers' ? 'Explore Pathways' : 'Live Opportunities'}
          </h1>
          <p className="text-xs text-[var(--graphite)] font-medium mt-0.5">
            {activeTab === 'careers'
              ? '50 career tracks mapped to DELSU disciplines'
              : `${jobs.length} verified internships, SIWES, & graduate openings`}
          </p>
        </div>

        {/* Tab Toggle (Careers vs Jobs) */}
        <div className="flex items-center p-1 bg-[var(--mist)] rounded-2xl border border-[var(--border)] shadow-sm">
          <button
            onClick={() => setActiveTab('careers')}
            className={`text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all ${
              activeTab === 'careers'
                ? 'bg-[var(--surface)] text-[var(--blue)] shadow-sm'
                : 'text-[var(--graphite)] hover:text-[var(--ink)]'
            }`}
          >
            Careers
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'jobs'
                ? 'bg-[var(--surface)] text-[var(--blue)] shadow-sm'
                : 'text-[var(--graphite)] hover:text-[var(--ink)]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Jobs</span>
          </button>
        </div>
      </div>

      {/* ── SEARCH INPUT ── */}
      <div className="relative w-full">
        <input
          type="text"
          value={activeTab === 'careers' ? search : jobSearch}
          onChange={(e) => {
            if (activeTab === 'careers') {
              setSearch(e.target.value);
              setSearchParams(prev => {
                const next = new URLSearchParams(prev);
                if (e.target.value.trim()) next.set('search', e.target.value.trim());
                else next.delete('search');
                return next;
              });
            } else {
              setJobSearch(e.target.value);
            }
          }}
          placeholder={
            activeTab === 'careers'
              ? "Search careers, skills, e.g. 'Software', 'Pharmacist', 'Law'..."
              : "Search jobs, roles, or locations, e.g. 'SIWES', 'Warri', 'React'..."
          }
          className="w-full bg-[var(--surface)] border border-[var(--border)] text-[var(--ink)] placeholder-[var(--ash)] text-xs sm:text-sm rounded-2xl pl-10 pr-10 py-3 focus:outline-none focus:border-[var(--blue)] transition-all shadow-sm"
          style={{ fontFamily: 'Open Sans, sans-serif' }}
        />
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--graphite)]" />
        {((activeTab === 'careers' && search) || (activeTab === 'jobs' && jobSearch)) && (
          <button
            onClick={() => {
              if (activeTab === 'careers') {
                setSearch('');
                setSearchParams(prev => {
                  const next = new URLSearchParams(prev);
                  next.delete('search');
                  return next;
                });
              } else {
                setJobSearch('');
              }
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[var(--mist)] text-[var(--graphite)] flex items-center justify-center hover:text-[var(--ink)]"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* ── CAREERS TAB ── */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'careers' && (
        <>
          {/* Category Quick Filter Pills */}
          <div className="flex gap-2 overflow-x-auto snap-x no-scrollbar -mx-1 px-1 pb-1">
            <button
              onClick={() => handleSelectField('')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex-shrink-0 flex items-center gap-1.5 ${
                !activeField
                  ? 'bg-[var(--blue)] text-white shadow-sm'
                  : 'bg-[var(--surface)] text-[var(--graphite)] border border-[var(--border)] hover:border-[var(--blue)]'
              }`}
            >
              <span>🌟 All Disciplines</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${!activeField ? 'bg-white/20 text-white' : 'bg-[var(--mist)] text-[var(--graphite)]'}`}>
                {careers.length}
              </span>
            </button>

            {ORDERED_FIELDS.map(f => {
              const meta = CATEGORY_META[f];
              const count = careersByField[f]?.length || 0;
              const isSelected = activeField === f;
              return (
                <button
                  key={f}
                  onClick={() => handleSelectField(f)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex-shrink-0 flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[var(--blue)] text-white shadow-sm'
                      : 'bg-[var(--surface)] text-[var(--graphite)] border border-[var(--border)] hover:border-[var(--blue)]'
                  }`}
                >
                  <span>{meta?.emoji || '📁'}</span>
                  <span>{meta?.shortLabel || f}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-[var(--mist)] text-[var(--graphite)]'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--blue)] mb-3" />
              <p className="text-xs text-[var(--graphite)] font-medium">Loading DELSU career tracks...</p>
            </div>
          ) : (
            <>
              {/* MODE 1: FOCUSED FILTERED GRID (When searching OR single category selected) */}
              {(activeField || search.trim()) ? (
                <div className="space-y-4">
                  {/* Filter Status Bar */}
                  <div className="flex items-center justify-between bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-3.5 shadow-sm">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-[var(--lavender)] text-[var(--blue)] flex items-center justify-center flex-shrink-0">
                        <Filter className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-xs sm:text-sm font-bold text-[var(--ink)] heading-font truncate">
                          {activeField ? (CATEGORY_META[activeField]?.label || activeField) : 'Search Results'}
                        </h2>
                        <p className="text-[11px] text-[var(--graphite)]">
                          {filteredCareers.length} career{filteredCareers.length !== 1 ? 's' : ''} found {search.trim() ? `for "${search.trim()}"` : ''}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleClearFilters}
                      className="text-xs font-bold text-[var(--blue)] hover:underline flex items-center gap-1 flex-shrink-0"
                    >
                      <span>Show All</span>
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {filteredCareers.length === 0 ? (
                    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-10 text-center shadow-sm">
                      <Briefcase className="w-10 h-10 text-[var(--ash)] mx-auto mb-3 opacity-60" />
                      <h3 className="text-sm font-bold text-[var(--ink)] heading-font">No careers match your search</h3>
                      <p className="text-xs text-[var(--graphite)] mt-1 mb-4">Try searching for a broader term or select another discipline.</p>
                      <button
                        onClick={handleClearFilters}
                        className="px-4 py-2 rounded-xl bg-[var(--blue)] text-white text-xs font-bold shadow-sm inline-flex items-center gap-1.5"
                      >
                        <span>Reset All Filters</span>
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      {filteredCareers.map((c) => (
                        <CareerCard key={c.id} career={c} />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* MODE 2: CATEGORICALLY GROUPED AISLES (Default All View) */
                <div className="space-y-5">
                  {ORDERED_FIELDS.map(f => {
                    const group = careersByField[f] || [];
                    if (group.length === 0) return null;
                    const meta = CATEGORY_META[f];
                    const IconComp = meta?.icon || Briefcase;

                    return (
                      <div
                        key={f}
                        className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-sm space-y-3"
                      >
                        {/* Category Section Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm"
                              style={{ backgroundColor: meta?.bgColor || 'var(--lavender)', color: meta?.color || 'var(--blue)' }}
                            >
                              <IconComp className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h2 className="text-sm sm:text-base font-black text-[var(--ink)] heading-font leading-tight truncate">
                                  {meta?.label || f}
                                </h2>
                                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[var(--mist)] text-[var(--graphite)]">
                                  {group.length}
                                </span>
                              </div>
                              <p className="text-[11px] text-[var(--graphite)] truncate mt-0.5">
                                {meta?.desc || meta?.faculty}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => handleSelectField(f)}
                            className="text-xs font-bold text-[var(--blue)] hover:underline flex items-center gap-0.5 flex-shrink-0 ml-2"
                          >
                            <span>See all</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Horizontal Swipe Rail for Category */}
                        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory no-scrollbar -mx-1 px-1 pb-1">
                          {group.map((career) => (
                            <div key={career.id} className="w-[240px] sm:w-[270px] snap-start flex-shrink-0">
                              <CareerCard career={career} />
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* ── LIVE JOBS TAB (Categorically Structured) ── */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'jobs' && (
        <div className="space-y-4">
          {/* 1. Placement Type Filter Pills (High Student Priority) */}
          <div className="flex gap-2 overflow-x-auto snap-x no-scrollbar -mx-1 px-1 pb-0.5">
            <button
              onClick={() => setJobTypeFilter('')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex-shrink-0 flex items-center gap-1.5 ${
                !jobTypeFilter
                  ? 'bg-[var(--blue)] text-white shadow-sm'
                  : 'bg-[var(--surface)] text-[var(--graphite)] border border-[var(--border)] hover:border-[var(--blue)]'
              }`}
            >
              <span>🌟 All Types</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${!jobTypeFilter ? 'bg-white/20 text-white' : 'bg-[var(--mist)] text-[var(--graphite)]'}`}>
                {jobs.length}
              </span>
            </button>

            <button
              onClick={() => setJobTypeFilter(jobTypeFilter === 'siwes' ? '' : 'siwes')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex-shrink-0 flex items-center gap-1.5 ${
                jobTypeFilter === 'siwes'
                  ? 'bg-[var(--blue)] text-white shadow-sm'
                  : 'bg-[var(--surface)] text-[var(--graphite)] border border-[var(--border)] hover:border-[var(--blue)]'
              }`}
            >
              <span>🎓 SIWES & Interns</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${jobTypeFilter === 'siwes' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700 font-extrabold'}`}>
                {siwesCount}
              </span>
            </button>

            <button
              onClick={() => setJobTypeFilter(jobTypeFilter === 'delta' ? '' : 'delta')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex-shrink-0 flex items-center gap-1.5 ${
                jobTypeFilter === 'delta'
                  ? 'bg-[var(--blue)] text-white shadow-sm'
                  : 'bg-[var(--surface)] text-[var(--graphite)] border border-[var(--border)] hover:border-[var(--blue)]'
              }`}
            >
              <span>📍 Delta & South-South</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${jobTypeFilter === 'delta' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700 font-extrabold'}`}>
                {deltaCount}
              </span>
            </button>

            <button
              onClick={() => setJobTypeFilter(jobTypeFilter === 'graduate' ? '' : 'graduate')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex-shrink-0 flex items-center gap-1.5 ${
                jobTypeFilter === 'graduate'
                  ? 'bg-[var(--blue)] text-white shadow-sm'
                  : 'bg-[var(--surface)] text-[var(--graphite)] border border-[var(--border)] hover:border-[var(--blue)]'
              }`}
            >
              <span>🚀 Graduate Trainees</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${jobTypeFilter === 'graduate' ? 'bg-white/20 text-white' : 'bg-[var(--mist)] text-[var(--graphite)]'}`}>
                {graduateCount}
              </span>
            </button>

            <button
              onClick={() => setJobTypeFilter(jobTypeFilter === 'remote' ? '' : 'remote')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex-shrink-0 flex items-center gap-1.5 ${
                jobTypeFilter === 'remote'
                  ? 'bg-[var(--blue)] text-white shadow-sm'
                  : 'bg-[var(--surface)] text-[var(--graphite)] border border-[var(--border)] hover:border-[var(--blue)]'
              }`}
            >
              <span>🌐 Remote Roles</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${jobTypeFilter === 'remote' ? 'bg-white/20 text-white' : 'bg-[var(--mist)] text-[var(--graphite)]'}`}>
                {remoteCount}
              </span>
            </button>
          </div>

          {/* 2. Industry Field Pills */}
          <div className="flex gap-2 overflow-x-auto snap-x no-scrollbar -mx-1 px-1 pb-1">
            <button
              onClick={() => setJobField('')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex-shrink-0 ${
                !jobField
                  ? 'bg-[var(--ink)] text-white'
                  : 'bg-[var(--mist)] text-[var(--graphite)] hover:text-[var(--ink)]'
              }`}
            >
              All Industries
            </button>
            {JOB_ORDERED_FIELDS.map(f => {
              const count = jobs.filter(j => j.field === f).length;
              if (count === 0) return null;
              const isSelected = jobField === f;
              return (
                <button
                  key={f}
                  onClick={() => setJobField(isSelected ? '' : f)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex-shrink-0 flex items-center gap-1 ${
                    isSelected
                      ? 'bg-[var(--blue)] text-white'
                      : 'bg-[var(--mist)] text-[var(--graphite)] hover:text-[var(--ink)]'
                  }`}
                >
                  <span>{CATEGORY_META[f]?.shortLabel || f}</span>
                  <span className="text-[10px] opacity-75">({count})</span>
                </button>
              );
            })}
          </div>

          {/* 3. Live Board Status Bar */}
          <div className="flex items-center justify-between bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-3 shadow-sm">
            <div className="flex items-center gap-2 min-w-0">
              <span className="relative flex h-2 w-2 flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <p className="text-xs font-bold text-[var(--ink)] heading-font truncate">
                {filteredJobs.length} Verified Position{filteredJobs.length !== 1 ? 's' : ''} Listed
              </p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {(jobSearch || jobField || jobTypeFilter) && (
                <button
                  onClick={handleClearJobFilters}
                  className="text-xs font-bold text-[var(--blue)] hover:underline flex items-center gap-1"
                >
                  <span>Reset</span>
                  <X className="w-3 h-3" />
                </button>
              )}
              <button
                onClick={() => setRefreshTrigger(prev => prev + 1)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[var(--mist)] text-[var(--graphite)] hover:text-[var(--blue)] text-[11px] font-bold transition-all"
              >
                <RefreshCw className="w-3 h-3" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>

          {/* 4. Content Area */}
          {loadingJobs ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--blue)] mb-3" />
              <p className="text-xs text-[var(--graphite)]">Fetching live opportunities...</p>
            </div>
          ) : (
            <>
              {/* MODE A: FOCUSED VIEW (When user has searched, picked a type, or picked a field) */}
              {(jobSearch.trim() || jobField || jobTypeFilter) ? (
                <div>
                  {filteredJobs.length === 0 ? (
                    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-10 text-center shadow-sm">
                      <Briefcase className="w-10 h-10 text-[var(--ash)] mx-auto mb-3 opacity-60" />
                      <h3 className="text-sm font-bold text-[var(--ink)] heading-font">No openings match your criteria</h3>
                      <p className="text-xs text-[var(--graphite)] mt-1 mb-4">Try broadening your search query or reset filters.</p>
                      <button
                        onClick={handleClearJobFilters}
                        className="px-4 py-2 rounded-xl bg-[var(--blue)] text-white text-xs font-bold shadow-sm inline-flex items-center gap-1.5"
                      >
                        <span>Reset All Filters</span>
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      {filteredJobs.map((job) => (
                        <JobCard key={job.id} job={job} />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* MODE B: CATEGORICALLY GROUPED AISLES (Default View) */
                <div className="space-y-5">
                  {JOB_ORDERED_FIELDS.map(f => {
                    const group = jobsByField[f] || [];
                    if (group.length === 0) return null;
                    const meta = CATEGORY_META[f];
                    const IconComp = meta?.icon || Briefcase;

                    return (
                      <div
                        key={f}
                        className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-sm space-y-3"
                      >
                        {/* Section Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
                              style={{ backgroundColor: meta?.bgColor || 'var(--lavender)', color: meta?.color || 'var(--blue)' }}
                            >
                              <IconComp className="w-4.5 h-4.5" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h2 className="text-xs sm:text-sm font-black text-[var(--ink)] heading-font leading-tight truncate">
                                  {meta?.label || f}
                                </h2>
                                <span className="text-[10px] font-extrabold px-2 py-0.2 rounded-full bg-[var(--mist)] text-[var(--graphite)]">
                                  {group.length}
                                </span>
                              </div>
                              <p className="text-[10px] text-[var(--graphite)] truncate mt-0.5">
                                Verified placements in {meta?.shortLabel || f}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => setJobField(f)}
                            className="text-xs font-bold text-[var(--blue)] hover:underline flex items-center gap-0.5 flex-shrink-0 ml-2"
                          >
                            <span>See all</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Horizontal Swipe Rail */}
                        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory no-scrollbar -mx-1 px-1 pb-1">
                          {group.map((job) => (
                            <div key={job.id} className="w-[250px] sm:w-[280px] snap-start flex-shrink-0">
                              <JobCard job={job} />
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Reusable Mobile-First Career Card Component
// ─────────────────────────────────────────────────────────────────────────────
const CareerCard = ({ career }) => {
  const holland = Array.isArray(career.holland_code) ? career.holland_code.join('') : (career.holland_code || '');
  const demand = career.demand || 'High';
  const isVeryHigh = demand.toLowerCase().includes('very high');

  return (
    <Link to={`/career/${career.id}`} className="block h-full">
      <motion.div
        whileTap={{ scale: 0.98 }}
        className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-3.5 sm:p-4 shadow-sm hover:border-[var(--blue)] transition-all flex flex-col justify-between h-full group"
      >
        <div>
          {/* Top Chips Row */}
          <div className="flex items-center justify-between gap-1.5 mb-2">
            {holland ? (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-[var(--lavender)] text-[var(--blue)] heading-font tracking-wider">
                {holland}
              </span>
            ) : (
              <span className="text-[10px] font-medium text-[var(--graphite)]">{career.field}</span>
            )}

            <span className={`inline-flex items-center gap-1 text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
              isVeryHigh
                ? 'bg-amber-50 text-amber-600 border border-amber-200'
                : 'bg-[var(--mist)] text-[var(--graphite)]'
            }`}>
              {isVeryHigh && <Flame className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />}
              {demand}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-xs sm:text-sm font-bold text-[var(--ink)] group-hover:text-[var(--blue)] transition-colors heading-font line-clamp-1 mb-1">
            {career.title}
          </h3>

          {/* Description */}
          <p className="text-[11px] text-[var(--graphite)] line-clamp-2 leading-relaxed mb-2.5">
            {career.description}
          </p>

          {/* Core Skills Chips */}
          {Array.isArray(career.core_skills) && career.core_skills.length > 0 && (
            <div className="flex gap-1 flex-wrap mb-3">
              {career.core_skills.slice(0, 2).map((s, idx) => (
                <span key={idx} className="text-[9px] font-medium px-1.5 py-0.5 rounded-md bg-[var(--mist)] text-[var(--graphite)] truncate max-w-[120px]">
                  {s}
                </span>
              ))}
              {career.core_skills.length > 2 && (
                <span className="text-[9px] font-medium px-1 py-0.5 rounded-md bg-[var(--mist)] text-[var(--ash)]">
                  +{career.core_skills.length - 2}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Card Footer */}
        <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between">
          <div>
            <span className="text-[9px] text-[var(--ash)] block uppercase tracking-wider font-bold">Est. Salary</span>
            <span className="text-xs font-black text-[var(--blue)] heading-font">
              {career.salary_range?.split('/')[0] || 'Competitive'}
            </span>
          </div>

          <div className="flex items-center gap-0.5 text-xs font-bold text-[var(--blue)] group-hover:translate-x-0.5 transition-transform">
            <span>Path</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Reusable Mobile-First Job Card Component
// ─────────────────────────────────────────────────────────────────────────────
const JobCard = ({ job }) => {
  const isSiwes = (job.type || '').toLowerCase().includes('siwes') ||
                  (job.type || '').toLowerCase().includes('intern') ||
                  (job.tags || []).some(t => t.toLowerCase().includes('siwes'));
  const isGrad = (job.type || '').toLowerCase().includes('graduate') ||
                 (job.tags || []).some(t => t.toLowerCase().includes('graduate'));
  const isDelta = (job.location || '').toLowerCase().includes('delta') ||
                  (job.tags || []).some(t => t.toLowerCase().includes('delta'));

  return (
    <motion.a
      href={job.url}
      target="_blank"
      rel="noopener noreferrer"
      whileTap={{ scale: 0.98 }}
      className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-3.5 sm:p-4 shadow-sm hover:border-[var(--blue)] transition-all flex flex-col justify-between h-full group block"
    >
      <div>
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-9 h-9 rounded-xl bg-[var(--mist)] flex items-center justify-center text-lg flex-shrink-0 border border-[var(--border)]">
              {job.logo || '💼'}
            </span>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-bold text-[var(--ink)] group-hover:text-[var(--blue)] transition-colors truncate heading-font">
                {job.title}
              </h3>
              <p className="text-[10px] text-[var(--graphite)] truncate font-medium">
                {job.company}
              </p>
            </div>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-[var(--ash)] group-hover:text-[var(--blue)] transition-colors flex-shrink-0 mt-1" />
        </div>

        {/* Location Row */}
        <div className="flex items-center gap-1.5 text-[11px] text-[var(--graphite)] mb-2">
          <MapPin className={`w-3 h-3 flex-shrink-0 ${isDelta ? 'text-emerald-600' : 'text-[var(--ash)]'}`} />
          <span className={`truncate ${isDelta ? 'font-bold text-emerald-700' : ''}`}>{job.location}</span>
        </div>

        {/* Tags */}
        <div className="flex gap-1 flex-wrap mb-3">
          {/* Type Pill */}
          <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md ${
            isSiwes
              ? 'bg-amber-50 text-amber-700 border border-amber-200'
              : isGrad
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'bg-[var(--mist)] text-[var(--graphite)]'
          }`}>
            {job.type}
          </span>

          {(job.tags || []).slice(0, 2).map((t, idx) => (
            <span key={idx} className="text-[9px] font-medium px-1.5 py-0.5 rounded-md bg-[var(--fog)] text-[var(--graphite)]">
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Card Footer: Salary + Time */}
      <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-xs">
        <div>
          <span className="text-[9px] text-[var(--ash)] block uppercase tracking-wider font-bold">Stipend / Salary</span>
          <span className="text-xs font-black text-[var(--blue)] heading-font">
            {job.salary?.split('/')[0] || 'Competitive'}
          </span>
        </div>

        <div className="flex items-center gap-1 text-[10px] text-[var(--ash)]">
          <Clock className="w-3 h-3" />
          <span>{job.posted || 'Recent'}</span>
        </div>
      </div>
    </motion.a>
  );
};

export default CareerExplorer;
