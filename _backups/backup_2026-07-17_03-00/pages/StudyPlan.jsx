import { Link } from 'react-router-dom';

const StudyPlan = () => {
  return (
    <div className="max-w-4xl mx-auto text-center py-20">
      <h1 className="text-3xl font-bold text-pw-white mb-4">Study Plan Generator</h1>
      <p className="text-pw-gray mb-8">This feature is coming soon in the next update.</p>
      <Link to="/dashboard" className="px-6 py-3 bg-pw-blue text-white font-bold rounded-xl hover:bg-pw-azure">
        Back to Dashboard
      </Link>
    </div>
  );
};

export default StudyPlan;
