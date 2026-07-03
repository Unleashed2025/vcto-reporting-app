import { useState } from 'react';
import { Link } from 'react-router-dom';
import { parseMasterTracker, computeAnalytics } from '../utils/excelParser';
import MasterTrackerReport from '../reports/MasterTrackerReport';

export default function MasterTrackerPage() {
  const [data, setData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const parsed = await parseMasterTracker(file);
      const computed = computeAnalytics(parsed);
      setData(parsed);
      setAnalytics(computed);
    } catch (err) {
      setError('Failed to parse workbook: ' + err.message);
    }
    setLoading(false);
  };

  if (data && analytics) {
    return <MasterTrackerReport data={data} analytics={analytics} />;
  }

  return (
    <div className="min-h-screen bg-[#0D2338]">
      <header className="bg-[#0D2338] border-b border-[#1A334F] px-8 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-[#5A7A95] hover:text-[#0EA5E9] text-sm">← Back to Home</Link>
          <img src={import.meta.env.BASE_URL + 'assets/logo-white.png'} alt="Unleashed" className="h-8" />
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-8 py-16">
        <h1 className="text-3xl font-bold text-white mb-4">Master Tracker Report</h1>
        <p className="text-[#5A7A95] mb-8">
          Upload your vCTO Master Tracker workbook (.xlsx) to generate a comprehensive management report.
          The report will analyse all 13 tabs and produce detailed findings across RAID, tasks, portfolio,
          time utilisation, skills capability, governance, and training.
        </p>

        <div className="bg-[#1A334F] border border-[#2A4A6F] rounded-xl p-12 text-center">
          {loading ? (
            <div>
              <div className="animate-spin w-12 h-12 border-4 border-[#0EA5E9] border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-[#5A7A95]">Parsing workbook and generating report...</p>
            </div>
          ) : (
            <>
              <svg className="w-16 h-16 text-[#5A7A95] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-white font-semibold mb-2">Upload vCTO Master Tracker</p>
              <p className="text-[#5A7A95] text-sm mb-6">Drag and drop or click to select your .xlsx file</p>
              <label className="inline-block bg-[#0EA5E9] text-white font-semibold px-6 py-3 rounded-lg cursor-pointer hover:bg-[#0EA5E9]/80 transition-colors">
                Select File
                <input type="file" accept=".xlsx,.xls" onChange={handleUpload} className="hidden" />
              </label>
            </>
          )}
          {error && <p className="text-red-400 mt-4 text-sm">{error}</p>}
        </div>

        <div className="mt-8 bg-[#1A334F]/50 border border-[#2A4A6F] rounded-lg p-6">
          <h3 className="text-white font-semibold text-sm mb-3">Report Contents</h3>
          <div className="grid grid-cols-2 gap-2 text-xs text-[#5A7A95]">
            <div>1. Executive Summary & KPIs</div>
            <div>2. Time & Utilisation Analysis</div>
            <div>3. RAID Register - Full Analysis</div>
            <div>4. Task Management & Workload</div>
            <div>5. Project Portfolio Status</div>
            <div>6. Governance & Decision Log</div>
            <div>7. Skills & Capability Assessment</div>
            <div>8. Engineer Level Qualification</div>
            <div>9. Project Eligibility Matrix</div>
            <div>10. Training & Development</div>
            <div>11. Red Flags & Priorities</div>
            <div>12. Next Actions & Recommendations</div>
          </div>
        </div>
      </div>
    </div>
  );
}
