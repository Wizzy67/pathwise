import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ConnectivityBanner from './components/ConnectivityBanner';
import ToastNotification from './components/ToastNotification';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

import LandingPage from './pages/LandingPage';
import ChoicePage from './pages/ChoicePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import WelcomePage from './pages/WelcomePage';
import DashboardLayout from './components/DashboardLayout';
import Dashboard from './pages/Dashboard';
import QuizPage from './pages/QuizPage';
import ResultsPage from './pages/ResultsPage';
import CareerExplorer from './pages/CareerExplorer';
import CareerDetail from './pages/CareerDetail';
import SavedCareers from './pages/SavedCareers';
import ActivityLog from './pages/ActivityLog';
import MyProfile from './pages/MyProfile';
import AIAdvisor from './pages/AIAdvisor';
import StudyPlan from './pages/StudyPlan';
import PDFReport from './pages/PDFReport';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ResultsAnalysis from './pages/ResultsAnalysis';

// Pages that should NOT show the Navbar/Footer
const BARE_ROUTES = ['/login', '/register', '/quiz', '/welcome', '/secure-admin-access', '/choice'];

function App() {
  const location = useLocation();

  // Reset scroll to top on every page transition
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname]);

  const isBare = location.pathname === '/' || BARE_ROUTES.some(r => location.pathname === r || location.pathname.startsWith(r + '/'));

  return (
    <div className="flex flex-col min-h-screen bg-pw-black">
      <ConnectivityBanner />
      {!isBare && <Navbar />}

      <main className="flex-1 relative flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="w-full flex-1 flex flex-col"
          >
            <Routes location={location}>
              {/* Public */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/choice" element={<ChoicePage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/welcome" element={<WelcomePage />} />

              {/* Admin */}
              <Route path="/secure-admin-access" element={<AdminLogin />} />
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminDashboard />} />
              </Route>

              {/* Quiz — full-page, no dashboard sidebar */}
              <Route element={<ProtectedRoute />}>
                <Route path="/quiz" element={<QuizPage />} />
                <Route path="/results" element={<ResultsPage />} />
              </Route>

              {/* Student App — with sidebar */}
              <Route element={<ProtectedRoute />}>
                <Route element={<DashboardLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/explore" element={<CareerExplorer />} />
                  <Route path="/career/:id" element={<CareerDetail />} />
                  <Route path="/saved" element={<SavedCareers />} />
                  <Route path="/activity" element={<ActivityLog />} />
                  <Route path="/profile" element={<MyProfile />} />
                  <Route path="/results-analysis" element={<ResultsAnalysis />} />
                  <Route path="/advisor" element={<AIAdvisor />} />
                  <Route path="/study-plan" element={<StudyPlan />} />
                  <Route path="/report" element={<PDFReport />} />
                </Route>
              </Route>
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>

      {!isBare && <Footer />}
      <ToastNotification />
    </div>
  );
}

export default App;
