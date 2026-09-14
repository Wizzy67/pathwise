import { Link } from 'react-router-dom';

const PDFReport = () => {
  return (
    <div className="max-w-4xl mx-auto text-center py-20" style={{ fontFamily: 'var(--font-body, "Open Sans")' }}>
      <h1 className="text-3xl font-bold text-[var(--ink)] mb-4" style={{ fontFamily: 'var(--font-heading, "Nunito")' }}>PDF Report Generator</h1>
      <p className="text-[var(--graphite)] mb-8">This feature is coming soon in the next update.</p>
      <Link to="/dashboard" className="px-6 py-3 bg-[var(--blue)] text-white font-bold rounded-xl hover:bg-[var(--azure)] transition-colors">
        Back to Dashboard
      </Link>
    </div>
  );
};

export default PDFReport;
