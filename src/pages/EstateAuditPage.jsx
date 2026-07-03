import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { parseEstateAudit } from '../utils/excelParser';
import EstateAuditReport from '../reports/EstateAuditReport';
import { exportToPDF } from '../utils/exportUtils';

export default function EstateAuditPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [view, setView] = useState('dashboard');
  const reportRef = useRef(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const parsed = await parseEstateAudit(file);
      setData(parsed);
      setView('dashboard');
    } catch (err) {
      setError('Failed to parse workbook: ' + err.message);
    }
    setLoading(false);
  };

  // Show full web report
  if (data && view === 'report') {
    return (
      <div>
        <div className="no-print sticky top-0 z-50 bg-[#0D2338] border-b border-[#1A334F] px-6 py-3 flex items-center justify-between">
          <button onClick={() => setView('dashboard')} className="text-[#5A7A95] hover:text-[#059669] text-sm">← Back to Dashboard</button>
          <div className="flex items-center gap-3">
            <button onClick={() => exportToPDF(reportRef.current)} className="bg-[#059669] text-white text-xs font-semibold px-4 py-2 rounded hover:bg-[#059669]/80">Export PDF</button>
            <button onClick={() => window.print()} className="bg-[#5A7A95] text-white text-xs font-semibold px-4 py-2 rounded hover:bg-[#5A7A95]/80">Print</button>
          </div>
        </div>
        <div ref={reportRef}>
          <EstateAuditReport data={data} />
        </div>
      </div>
    );
  }

  // Dashboard view after upload
  if (data && view === 'dashboard') {
    const schools = data.schools || [];
    let totalRed = 0, totalAmber = 0, totalGreen = 0;
    schools.forEach(s => {
      s.data.forEach(row => row.forEach(cell => {
        const v = String(cell || '').toLowerCase().trim();
        if (v === 'red') totalRed++;
        else if (v === 'amber') totalAmber++;
        else if (v === 'green') totalGreen++;
      }));
    });

    return (
      <div className="min-h-screen bg-[#0D2338]">
        <header className="bg-[#0D2338] border-b border-[#1A334F] px-8 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link to="/" className="text-[#5A7A95] hover:text-[#059669] text-sm">← Home</Link>
            <img src={import.meta.env.BASE_URL + 'assets/logo-white.png'} alt="Unleashed" className="h-8" />
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white">Estate Audit Dashboard</h1>
              <p className="text-[#5A7A95] text-sm mt-1">{schools.length} Schools Assessed</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setView('report')} className="bg-[#1A334F] border border-[#2A4A6F] text-white text-xs font-semibold px-4 py-2 rounded hover:bg-[#2A4A6F]">
                View Web Report
              </button>
              <button onClick={() => { setView('report'); setTimeout(() => exportToPDF(reportRef.current), 500); }} className="bg-[#059669] text-white text-xs font-semibold px-4 py-2 rounded hover:bg-[#059669]/80">
                Export PDF
              </button>
            </div>
          </div>

          {/* KPI Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="border border-blue-500/30 bg-blue-500/10 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white">{schools.length}</div>
              <div className="text-xs text-white font-medium mt-1">Schools</div>
            </div>
            <div className="border border-red-500/30 bg-red-500/10 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white">{totalRed}</div>
              <div className="text-xs text-white font-medium mt-1">Red Items</div>
              <div className="text-[10px] text-[#5A7A95] mt-0.5">immediate action</div>
            </div>
            <div className="border border-amber-500/30 bg-amber-500/10 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white">{totalAmber}</div>
              <div className="text-xs text-white font-medium mt-1">Amber Items</div>
              <div className="text-[10px] text-[#5A7A95] mt-0.5">attention needed</div>
            </div>
            <div className="border border-green-500/30 bg-green-500/10 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white">{totalGreen}</div>
              <div className="text-xs text-white font-medium mt-1">Green Items</div>
              <div className="text-[10px] text-[#5A7A95] mt-0.5">satisfactory</div>
            </div>
          </div>

          {/* School List */}
          <div className="bg-[#1A334F] border border-[#2A4A6F] rounded-xl p-6">
            <h3 className="text-white font-semibold text-sm mb-4">School RAG Summary</h3>
            <div className="space-y-2">
              {schools.map((school, i) => {
                let r = 0, a = 0, g = 0;
                school.data.forEach(row => row.forEach(cell => {
                  const v = String(cell || '').toLowerCase().trim();
                  if (v === 'red') r++;
                  else if (v === 'amber') a++;
                  else if (v === 'green') g++;
                }));
                return (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-[#2A4A6F] last:border-0">
                    <span className="text-white text-xs font-medium">{school.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-red-400 text-xs font-semibold">{r} R</span>
                      <span className="text-amber-400 text-xs font-semibold">{a} A</span>
                      <span className="text-green-400 text-xs font-semibold">{g} G</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${r > 3 ? 'bg-red-500/20 text-red-400' : r > 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-green-500/20 text-green-400'}`}>
                        {r > 3 ? 'RED' : r > 0 ? 'AMBER' : 'GREEN'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upload another */}
          <div className="text-center mt-6">
            <label className="inline-block bg-[#1A334F] border border-[#2A4A6F] text-[#5A7A95] text-xs px-4 py-2 rounded cursor-pointer hover:bg-[#2A4A6F] hover:text-white transition-colors">
              Upload Different File
              <input type="file" accept=".xlsx,.xls" onChange={handleUpload} className="hidden" />
            </label>
          </div>
        </div>
      </div>
    );
  }

  // Upload screen
  return (
    <div className="min-h-screen bg-[#0D2338]">
      <header className="bg-[#0D2338] border-b border-[#1A334F] px-8 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-[#5A7A95] hover:text-[#059669] text-sm">← Back to Home</Link>
          <img src={import.meta.env.BASE_URL + 'assets/logo-white.png'} alt="Unleashed" className="h-8" />
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-8 py-16">
        <h1 className="text-3xl font-bold text-white mb-4">Estate Audit & Roadmap Report</h1>
        <p className="text-[#5A7A95] mb-8">
          Upload your Estate Audit & Roadmap workbook (.xlsx) to view the dashboard
          and generate PDF or web reports.
        </p>

        <div className="bg-[#1A334F] border border-[#2A4A6F] rounded-xl p-12 text-center">
          {loading ? (
            <div>
              <div className="animate-spin w-12 h-12 border-4 border-[#059669] border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-[#5A7A95]">Parsing audit data...</p>
            </div>
          ) : (
            <>
              <svg className="w-16 h-16 text-[#5A7A95] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <p className="text-white font-semibold mb-2">Upload Estate Audit & Roadmap</p>
              <p className="text-[#5A7A95] text-sm mb-6">Select your .xlsx file to view dashboard and generate reports</p>
              <label className="inline-block bg-[#059669] text-white font-semibold px-6 py-3 rounded-lg cursor-pointer hover:bg-[#059669]/80 transition-colors">
                Select File
                <input type="file" accept=".xlsx,.xls" onChange={handleUpload} className="hidden" />
              </label>
            </>
          )}
          {error && <p className="text-red-400 mt-4 text-sm">{error}</p>}
        </div>
      </div>
    </div>
  );
}
