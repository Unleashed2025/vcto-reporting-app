import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { parseMasterTracker, computeAnalytics } from '../utils/excelParser';
import MasterTrackerReport from '../reports/MasterTrackerReport';
import { exportToPDF, exportToWord } from '../utils/exportUtils';

export default function MasterTrackerPage() {
  const [data, setData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [view, setView] = useState('dashboard'); // 'dashboard' or 'report'
  const reportRef = useRef(null);

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
      setView('dashboard');
    } catch (err) {
      setError('Failed to parse workbook: ' + err.message);
    }
    setLoading(false);
  };

  // Show full web report
  if (data && analytics && view === 'report') {
    return (
      <div>
        <div className="no-print sticky top-0 z-50 bg-[#0D2338] border-b border-[#1A334F] px-6 py-3 flex items-center justify-between">
          <button onClick={() => setView('dashboard')} className="text-[#5A7A95] hover:text-[#0EA5E9] text-sm">← Back to Dashboard</button>
          <div className="flex items-center gap-3">
            <button onClick={() => exportToPDF(reportRef.current)} className="bg-[#0EA5E9] text-white text-xs font-semibold px-4 py-2 rounded hover:bg-[#0EA5E9]/80">Export PDF</button>
            <button onClick={() => exportToWord(data, analytics)} className="bg-[#059669] text-white text-xs font-semibold px-4 py-2 rounded hover:bg-[#059669]/80">Export Word</button>
            <button onClick={() => window.print()} className="bg-[#5A7A95] text-white text-xs font-semibold px-4 py-2 rounded hover:bg-[#5A7A95]/80">Print</button>
          </div>
        </div>
        <div ref={reportRef}>
          <MasterTrackerReport data={data} analytics={analytics} />
        </div>
      </div>
    );
  }

  // Show dashboard after upload
  if (data && analytics && view === 'dashboard') {
    const a = analytics;
    return (
      <div className="min-h-screen bg-[#0D2338]">
        <header className="bg-[#0D2338] border-b border-[#1A334F] px-8 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link to="/" className="text-[#5A7A95] hover:text-[#0EA5E9] text-sm">← Home</Link>
            <img src={import.meta.env.BASE_URL + 'assets/logo-white.png'} alt="Unleashed" className="h-8" />
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white">vCTO Management Dashboard</h1>
              <p className="text-[#5A7A95] text-sm mt-1">West Country Schools Trust - Live Data</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setView('report')} className="bg-[#1A334F] border border-[#2A4A6F] text-white text-xs font-semibold px-4 py-2 rounded hover:bg-[#2A4A6F]">
                View Web Report
              </button>
              <button onClick={() => { setView('report'); setTimeout(() => exportToPDF(reportRef.current), 500); }} className="bg-[#0EA5E9] text-white text-xs font-semibold px-4 py-2 rounded hover:bg-[#0EA5E9]/80">
                Export PDF
              </button>
              <button onClick={() => exportToWord(data, analytics)} className="bg-[#059669] text-white text-xs font-semibold px-4 py-2 rounded hover:bg-[#059669]/80">
                Export Word
              </button>
            </div>
          </div>

          {/* KPI Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
            <KPI label="Days Used" value={a.time?.totalDays?.toFixed(1) || '0'} sub={`of 48 (${a.time?.utilisation || 0}%)`} color="blue" />
            <KPI label="RAID Open" value={a.raid?.open || 0} sub={`${a.raid?.critical?.length || 0} critical`} color={a.raid?.critical?.length > 0 ? 'red' : 'green'} />
            <KPI label="Tasks Active" value={a.tasks?.byStatus?.['In Progress'] || 0} sub={`${a.tasks?.total || 0} total`} color="blue" />
            <KPI label="Tasks Blocked" value={a.tasks?.blocked?.length || 0} sub="need escalation" color={a.tasks?.blocked?.length > 0 ? 'red' : 'green'} />
            <KPI label="Projects Active" value={a.portfolio?.byStatus?.['In Progress'] || 0} sub={`${a.portfolio?.total || 0} in portfolio`} color="blue" />
            <KPI label="Decisions Made" value={a.governance?.totalDecisions || 0} sub={`${a.governance?.totalWorkshops || 0} workshops`} color="green" />
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* RAID Summary */}
            <div className="bg-[#1A334F] border border-[#2A4A6F] rounded-xl p-6">
              <h3 className="text-white font-semibold text-sm mb-4">RAID Register</h3>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {['Critical','High','Medium','Low'].map(sev => (
                  <div key={sev} className={`text-center p-2 rounded ${sev==='Critical'?'bg-red-500/20':''}${sev==='High'?'bg-orange-500/20':''}${sev==='Medium'?'bg-amber-500/20':''}${sev==='Low'?'bg-green-500/20':''}`}>
                    <div className="text-lg font-bold text-white">{a.raid?.bySeverity?.[sev] || 0}</div>
                    <div className="text-[10px] text-[#5A7A95]">{sev}</div>
                  </div>
                ))}
              </div>
              {a.raid?.critical?.length > 0 && (
                <div className="border-t border-[#2A4A6F] pt-3">
                  <p className="text-red-400 text-xs font-semibold mb-2">Critical Items:</p>
                  {a.raid.critical.slice(0, 3).map((r, i) => (
                    <p key={i} className="text-[#5A7A95] text-xs mb-1">{r.id}: {r.title}</p>
                  ))}
                </div>
              )}
            </div>

            {/* Tasks Summary */}
            <div className="bg-[#1A334F] border border-[#2A4A6F] rounded-xl p-6">
              <h3 className="text-white font-semibold text-sm mb-4">Task Status</h3>
              <div className="space-y-3">
                {Object.entries(a.tasks?.byStatus || {}).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-[#5A7A95] text-xs">{status}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-[#0D2338] rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${status==='Complete'?'bg-green-500':status==='Blocked'?'bg-red-500':status==='In Progress'?'bg-blue-500':'bg-gray-500'}`} style={{width: `${(count/(a.tasks?.total||1))*100}%`}}></div>
                      </div>
                      <span className="text-white text-xs font-semibold w-6 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
              {a.tasks?.blocked?.length > 0 && (
                <div className="border-t border-[#2A4A6F] pt-3 mt-3">
                  <p className="text-red-400 text-xs font-semibold mb-1">Blocked:</p>
                  {a.tasks.blocked.slice(0, 3).map((t, i) => (
                    <p key={i} className="text-[#5A7A95] text-xs mb-1">{t.id}: {t.task}</p>
                  ))}
                </div>
              )}
            </div>

            {/* Portfolio */}
            <div className="bg-[#1A334F] border border-[#2A4A6F] rounded-xl p-6">
              <h3 className="text-white font-semibold text-sm mb-4">Project Portfolio</h3>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {['Not Started','In Progress','Complete','At Risk'].map(s => (
                  <div key={s} className="text-center p-2 rounded bg-[#0D2338]">
                    <div className="text-lg font-bold text-white">{a.portfolio?.byStatus?.[s] || 0}</div>
                    <div className="text-[10px] text-[#5A7A95]">{s}</div>
                  </div>
                ))}
              </div>
              {data.portfolio?.slice(0, 4).map((p, i) => (
                <div key={i} className="flex items-center justify-between py-1 border-t border-[#2A4A6F]">
                  <span className="text-[#5A7A95] text-xs truncate mr-2">{p.project}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${p.status==='Complete'?'bg-green-500/20 text-green-400':p.status==='In Progress'?'bg-blue-500/20 text-blue-400':p.status==='At Risk'?'bg-red-500/20 text-red-400':'bg-gray-500/20 text-gray-400'}`}>{p.status}</span>
                </div>
              ))}
            </div>

            {/* Time & Utilisation */}
            <div className="bg-[#1A334F] border border-[#2A4A6F] rounded-xl p-6">
              <h3 className="text-white font-semibold text-sm mb-4">Time & Utilisation</h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="relative w-20 h-20">
                  <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#0D2338" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#0EA5E9" strokeWidth="3" strokeDasharray={`${a.time?.utilisation || 0} ${100 - (a.time?.utilisation || 0)}`} />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white text-sm font-bold">{a.time?.utilisation || 0}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{a.time?.totalDays?.toFixed(1) || 0} days used</p>
                  <p className="text-[#5A7A95] text-xs">{(48 - (a.time?.totalDays || 0)).toFixed(1)} remaining of 48</p>
                </div>
              </div>
              {a.time?.byType && Object.entries(a.time.byType).slice(0, 4).map(([type, days]) => (
                <div key={type} className="flex items-center justify-between py-1">
                  <span className="text-[#5A7A95] text-xs">{type}</span>
                  <span className="text-white text-xs font-semibold">{days.toFixed(1)}d</span>
                </div>
              ))}
            </div>
          </div>

          {/* Red Flags */}
          {(a.raid?.critical?.length > 0 || a.tasks?.blocked?.length > 0) && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 mb-8">
              <h3 className="text-red-400 font-semibold text-sm mb-3">Red Flags - Immediate Attention Required</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {a.raid?.critical?.map((r, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="mt-0.5 w-2 h-2 rounded-full bg-red-500 flex-shrink-0"></span>
                    <span className="text-red-300 text-xs"><strong>{r.id}:</strong> {r.title} - {r.description}</span>
                  </div>
                ))}
                {a.tasks?.blocked?.map((t, i) => (
                  <div key={`t${i}`} className="flex items-start gap-2">
                    <span className="mt-0.5 w-2 h-2 rounded-full bg-amber-500 flex-shrink-0"></span>
                    <span className="text-amber-300 text-xs"><strong>BLOCKED:</strong> {t.task} ({t.assignedTo})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload another file */}
          <div className="text-center">
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
          <Link to="/" className="text-[#5A7A95] hover:text-[#0EA5E9] text-sm">← Back to Home</Link>
          <img src={import.meta.env.BASE_URL + 'assets/logo-white.png'} alt="Unleashed" className="h-8" />
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-8 py-16">
        <h1 className="text-3xl font-bold text-white mb-4">Master Tracker Report</h1>
        <p className="text-[#5A7A95] mb-8">
          Upload your vCTO Master Tracker workbook (.xlsx) to view the management dashboard
          and generate PDF, Word, or web reports.
        </p>

        <div className="bg-[#1A334F] border border-[#2A4A6F] rounded-xl p-12 text-center">
          {loading ? (
            <div>
              <div className="animate-spin w-12 h-12 border-4 border-[#0EA5E9] border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-[#5A7A95]">Parsing workbook...</p>
            </div>
          ) : (
            <>
              <svg className="w-16 h-16 text-[#5A7A95] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-white font-semibold mb-2">Upload vCTO Master Tracker</p>
              <p className="text-[#5A7A95] text-sm mb-6">Select your .xlsx file to view dashboard and generate reports</p>
              <label className="inline-block bg-[#0EA5E9] text-white font-semibold px-6 py-3 rounded-lg cursor-pointer hover:bg-[#0EA5E9]/80 transition-colors">
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

function KPI({ label, value, sub, color }) {
  const colors = {
    blue: 'border-blue-500/30 bg-blue-500/10',
    red: 'border-red-500/30 bg-red-500/10',
    green: 'border-green-500/30 bg-green-500/10',
    amber: 'border-amber-500/30 bg-amber-500/10',
  };
  return (
    <div className={`border rounded-xl p-4 text-center ${colors[color] || colors.blue}`}>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-white font-medium mt-1">{label}</div>
      <div className="text-[10px] text-[#5A7A95] mt-0.5">{sub}</div>
    </div>
  );
}
