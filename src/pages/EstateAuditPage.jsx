import { useState } from 'react';
import { Link } from 'react-router-dom';
import { parseEstateAudit } from '../utils/excelParser';
import EstateAuditReport from '../reports/EstateAuditReport';

export default function EstateAuditPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const parsed = await parseEstateAudit(file);
      setData(parsed);
    } catch (err) {
      setError('Failed to parse workbook: ' + err.message);
    }
    setLoading(false);
  };

  if (data) {
    return <EstateAuditReport data={data} />;
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
        <h1 className="text-3xl font-bold text-white mb-4">Estate Audit & Roadmap Report</h1>
        <p className="text-[#5A7A95] mb-8">
          Upload your Estate Audit & Roadmap workbook (.xlsx) to generate a comprehensive trust-wide
          infrastructure report covering all 31 schools.
        </p>

        <div className="bg-[#1A334F] border border-[#2A4A6F] rounded-xl p-12 text-center">
          {loading ? (
            <div>
              <div className="animate-spin w-12 h-12 border-4 border-[#059669] border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-[#5A7A95]">Parsing audit data across 31 schools...</p>
            </div>
          ) : (
            <>
              <svg className="w-16 h-16 text-[#5A7A95] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <p className="text-white font-semibold mb-2">Upload Estate Audit & Roadmap</p>
              <p className="text-[#5A7A95] text-sm mb-6">Select your Estate Audit .xlsx file</p>
              <label className="inline-block bg-[#059669] text-white font-semibold px-6 py-3 rounded-lg cursor-pointer hover:bg-[#059669]/80 transition-colors">
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
            <div>1. Executive Summary</div>
            <div>2. Trust-Wide RAG Overview</div>
            <div>3. Infrastructure Heatmap</div>
            <div>4. Security Posture Analysis</div>
            <div>5. Per-School Findings</div>
            <div>6. Critical Red Flags</div>
            <div>7. Priority Actions</div>
            <div>8. Roadmap Recommendations</div>
            <div>9. Budget Implications</div>
            <div>10. Next Steps</div>
          </div>
        </div>
      </div>
    </div>
  );
}
