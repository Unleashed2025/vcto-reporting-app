import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0D2338]">
      {/* Header */}
      <header className="bg-[#0D2338] border-b border-[#1A334F] px-8 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={import.meta.env.BASE_URL + 'assets/logo-white.png'} alt="Unleashed Solutions" className="h-12" />
          </div>
          <div className="text-right">
            <p className="text-[#0EA5E9] text-sm font-semibold">vCTO Reporting Platform</p>
            <p className="text-[#5A7A95] text-xs">West Country Schools Trust</p>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-8 py-16">
        <h1 className="text-4xl font-bold text-white mb-4">vCTO Management Reporting</h1>
        <p className="text-[#5A7A95] text-lg mb-2">
          Generate comprehensive, board-ready reports from your vCTO management data.
        </p>
        <p className="text-[#5A7A95] text-sm mb-12">
          Upload your Excel workbooks to produce detailed analysis covering RAID, tasks, portfolio, skills, time utilisation, and estate audits.
        </p>

        {/* Report Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Master Tracker Card */}
          <Link to="/master-tracker" className="group block bg-[#1A334F] border border-[#2A4A6F] rounded-xl p-8 hover:border-[#0EA5E9] transition-all duration-300 hover:shadow-lg hover:shadow-[#0EA5E9]/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-[#0EA5E9]/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-[#0EA5E9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white group-hover:text-[#0EA5E9] transition-colors">Master Tracker Report</h2>
            </div>
            <p className="text-[#5A7A95] text-sm mb-4">
              Upload your vCTO Master Tracker workbook to generate a full management report covering:
            </p>
            <ul className="text-[#5A7A95] text-xs space-y-1 mb-4">
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> RAID Analysis - risks, issues, red flags, mitigation status</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Task Management - overdue, blocked, workload per engineer</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span> Portfolio - project status, timeline, at-risk projects</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Time Utilisation - burn rate, allocation, pace</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Skills & Capability - engineer levels, gaps, eligibility</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span> Governance - workshops, decisions, actions</li>
            </ul>
            <p className="text-[#0EA5E9] text-xs font-semibold group-hover:underline">Upload Excel and Generate Report →</p>
          </Link>

          {/* Estate Audit Card */}
          <Link to="/estate-audit" className="group block bg-[#1A334F] border border-[#2A4A6F] rounded-xl p-8 hover:border-[#0EA5E9] transition-all duration-300 hover:shadow-lg hover:shadow-[#0EA5E9]/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-[#059669]/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-[#059669]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white group-hover:text-[#059669] transition-colors">Estate Audit & Roadmap Report</h2>
            </div>
            <p className="text-[#5A7A95] text-sm mb-4">
              Upload your Estate Audit workbook to generate trust-wide and per-school reports:
            </p>
            <ul className="text-[#5A7A95] text-xs space-y-1 mb-4">
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Trust-wide RAG heatmap across all 31 schools</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Per-school detailed findings and recommendations</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Infrastructure assessment - networks, servers, endpoints</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Security posture - MFA, AV, backup, patching</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span> Priority actions and roadmap recommendations</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span> Budget and resource implications</li>
            </ul>
            <p className="text-[#059669] text-xs font-semibold group-hover:underline">Upload Excel and Generate Report →</p>
          </Link>
        </div>

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#1A334F]/50 border border-[#2A4A6F] rounded-lg p-6">
            <h3 className="text-white font-semibold text-sm mb-2">PDF Export</h3>
            <p className="text-[#5A7A95] text-xs">Professional branded reports with chapters on separate pages, ready for board presentations.</p>
          </div>
          <div className="bg-[#1A334F]/50 border border-[#2A4A6F] rounded-lg p-6">
            <h3 className="text-white font-semibold text-sm mb-2">Word Export</h3>
            <p className="text-[#5A7A95] text-xs">Editable Word documents with full Unleashed branding, tables, and formatting.</p>
          </div>
          <div className="bg-[#1A334F]/50 border border-[#2A4A6F] rounded-lg p-6">
            <h3 className="text-white font-semibold text-sm mb-2">Web View</h3>
            <p className="text-[#5A7A95] text-xs">Interactive web-based reports with charts, drill-down tables, and real-time filtering.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1A334F] px-8 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <p className="text-[#5A7A95] text-xs">Unleashed Solutions Ltd - Managed IT & Cyber Security</p>
          <p className="text-[#5A7A95] text-xs">vCTO Service - West Country Schools Trust</p>
        </div>
      </footer>
    </div>
  );
}
