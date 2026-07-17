import { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import api from '../services/api';
import { 
  Calculator, 
  Plus, 
  Trash2, 
  Upload, 
  TrendingUp, 
  AlertTriangle, 
  Compass, 
  BookOpen, 
  Brain,
  GraduationCap
} from 'lucide-react';

const ResultsAnalysis = () => {
  const [courses, setCourses] = useState([{ courseCode: '', courseTitle: '', grade: 'A' }]);
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addNotification } = useNotification();

  // Load existing results analysis on mount
  useEffect(() => {
    const fetchAnalysis = async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/results/analysis');
        if (res.data.results && res.data.results.length > 0) {
          setCourses(res.data.results);
          setAnalysis(res.data.analysis);
        }
      } catch (err) {
        console.error('Failed to load results analysis', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalysis();
  }, []);

  const handleAddRow = () => {
    setCourses([...courses, { courseCode: '', courseTitle: '', grade: 'A' }]);
  };

  const handleRemoveRow = (index) => {
    const updated = courses.filter((_, i) => i !== index);
    setCourses(updated.length > 0 ? updated : [{ courseCode: '', courseTitle: '', grade: 'A' }]);
  };

  const handleChangeRow = (index, field, value) => {
    const updated = [...courses];
    updated[index][field] = value;
    setCourses(updated);
  };

  // Mock CSV File Parser
  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const lines = text.split('\n');
        const parsedCourses = [];

        lines.forEach(line => {
          const parts = line.split(',');
          if (parts.length >= 2) {
            const courseCode = parts[0].trim().toUpperCase();
            const grade = parts[parts.length - 1].trim().toUpperCase();
            
            // Validate code prefix (e.g. CSC301 or CSC 301)
            if (courseCode.match(/^[A-Z]{2,4}\s?\d{3}/) && ['A', 'B', 'C', 'D', 'E', 'F'].includes(grade)) {
              parsedCourses.push({
                courseCode,
                courseTitle: parts.length > 2 ? parts[1].trim() : '',
                grade
              });
            }
          }
        });

        if (parsedCourses.length > 0) {
          setCourses(parsedCourses);
          addNotification(`Successfully imported ${parsedCourses.length} courses from CSV!`, 'success');
        } else {
          addNotification('Could not find any valid DELSU courses in the uploaded CSV format.', 'error');
        }
      } catch (err) {
        addNotification('Failed to read CSV file.', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleSubmitAnalysis = async (e) => {
    e.preventDefault();
    
    // Filter out incomplete rows
    const validCourses = courses.filter(c => c.courseCode.trim().length > 0);
    if (validCourses.length === 0) {
      addNotification('Please enter at least one valid course code.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post('/results/analyze', { results: validCourses });
      setAnalysis(res.data.analysis);
      addNotification('Academic performance analysis updated successfully!', 'success');
    } catch (err) {
      console.error(err);
      addNotification('Failed to analyze results.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto w-full space-y-8 pb-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-pw-white flex items-center gap-3">
          <Calculator className="w-8 h-8 text-pw-blue" />
          Academic Results Analysis
        </h1>
        <p className="text-pw-gray text-sm max-w-2xl leading-relaxed">
          Upload your DELSU course codes and grades to analyze your technical/analytical strengths and dynamically align your career recommendations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Course Entry Form Workspace */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-pw-surface border border-pw-white/10 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-pw-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-pw-blue" /> Course Inputs
              </h2>

              {/* MOCK CSV UPLOAD BUTTON */}
              <label className="flex items-center gap-2 px-4 py-2 bg-pw-blue/10 border border-pw-blue/20 rounded-xl text-pw-blue text-xs font-bold hover:bg-pw-blue/20 transition-all cursor-pointer">
                <Upload className="w-4 h-4" />
                Upload CSV
                <input type="file" accept=".csv" onChange={handleCSVUpload} className="hidden" />
              </label>
            </div>

            <form onSubmit={handleSubmitAnalysis} className="space-y-4">
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2">
                {courses.map((course, idx) => (
                  <div key={idx} className="flex gap-3 items-center">
                    <input
                      type="text"
                      placeholder="e.g. CSC 301"
                      value={course.courseCode}
                      onChange={(e) => handleChangeRow(idx, 'courseCode', e.target.value)}
                      className="w-1/3 bg-pw-black border border-pw-white/10 text-pw-white rounded-xl p-3 focus:ring-2 focus:ring-pw-blue focus:border-transparent text-sm uppercase"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Course Title (Optional)"
                      value={course.courseTitle}
                      onChange={(e) => handleChangeRow(idx, 'courseTitle', e.target.value)}
                      className="flex-1 bg-pw-black border border-pw-white/10 text-pw-white rounded-xl p-3 focus:ring-2 focus:ring-pw-blue focus:border-transparent text-sm"
                    />
                    <select
                      value={course.grade}
                      onChange={(e) => handleChangeRow(idx, 'grade', e.target.value)}
                      className="bg-pw-black border border-pw-white/10 text-pw-white rounded-xl p-3 focus:ring-2 focus:ring-pw-blue focus:border-transparent text-sm w-20 appearance-none text-center"
                    >
                      {['A', 'B', 'C', 'D', 'E', 'F'].map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(idx)}
                      className="p-3 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-xl transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 pt-4 border-t border-pw-white/5">
                <button
                  type="button"
                  onClick={handleAddRow}
                  className="flex items-center gap-2 px-4 py-3 bg-pw-surface2 border border-pw-white/10 rounded-xl text-pw-white text-sm font-bold hover:bg-pw-white/5 transition-all"
                >
                  <Plus className="w-4 h-4" /> Add Row
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-pw-blue text-white text-sm font-bold rounded-xl hover:bg-pw-azure transition-all shadow-[0_0_20px_rgba(0,86,255,0.3)] disabled:opacity-50"
                >
                  {isSubmitting ? 'Analyzing Performance...' : 'Analyze Academic Performance →'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Real-time Insights Sidebar */}
        <div className="space-y-6">
          <div className="bg-pw-surface border border-pw-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-pw-white flex items-center gap-2 mb-6">
              <Brain className="w-5 h-5 text-pw-blue" /> Insights &amp; Alignment
            </h2>

            {isLoading ? (
              <div className="py-12 flex justify-center items-center">
                <div className="w-8 h-8 border-4 border-pw-blue border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : analysis ? (
              <div className="space-y-6">
                
                {/* Academic Strengths */}
                {analysis.strengths && analysis.strengths.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-pw-gray tracking-wider uppercase flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-emerald-400" /> Academic Strengths
                    </h3>
                    <div className="space-y-2">
                      {analysis.strengths.map((s, idx) => (
                        <div key={idx} className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 space-y-1 text-left">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-emerald-400">{s.name}</span>
                            <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">Strength</span>
                          </div>
                          <p className="text-[11px] text-pw-gray leading-relaxed">{s.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Areas for Improvement */}
                {analysis.weaknesses && analysis.weaknesses.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-pw-gray tracking-wider uppercase flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-400" /> Areas for Improvement
                    </h3>
                    <div className="space-y-2">
                      {analysis.weaknesses.map((w, idx) => (
                        <div key={idx} className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 space-y-1 text-left">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-amber-400">{w.name}</span>
                            <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400">Alert</span>
                          </div>
                          <p className="text-[11px] text-pw-gray leading-relaxed">{w.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* dynamic career alignment */}
                {analysis.recommendations && analysis.recommendations.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-pw-white/5">
                    <h3 className="text-xs font-bold text-pw-gray tracking-wider uppercase flex items-center gap-1.5">
                      <Compass className="w-4 h-4 text-pw-blue" /> Dynamic Career Alignment
                    </h3>
                    <div className="space-y-2">
                      {analysis.recommendations.map((rec, idx) => (
                        <div key={idx} className="p-4 rounded-2xl bg-pw-surface2 border border-pw-white/10 flex justify-between items-center">
                          <div className="text-left">
                            <h4 className="text-sm font-bold text-pw-white">{rec.title}</h4>
                            <p className="text-[10px] text-pw-gray">{rec.field}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-black text-pw-blue">{rec.matchingScore}%</span>
                            <p className="text-[9px] text-pw-gray">Fit Score</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            ) : (
              <div className="py-12 text-center text-pw-gray space-y-3">
                <GraduationCap className="w-12 h-12 text-pw-white/10 mx-auto" />
                <p className="text-sm">No analysis loaded. Submit your course grades to run your cognitive profile analysis!</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ResultsAnalysis;
