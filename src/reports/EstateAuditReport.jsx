import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { BRAND, COMPANY } from '../utils/branding';
import { exportToPDF } from '../utils/exportUtils';

export default function EstateAuditReport({ data }) {
  const reportRef = useRef(null);
  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const schools = data.schools || [];

  // Compute trust-wide analytics from school data
  const trustAnalytics = computeTrustAnalytics(schools);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Toolbar */}
      <div className="no-print sticky top-0 z-50 bg-[#0D2338] border-b border-[#1A334F] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/estate-audit" className="text-[#5A7A95] hover:text-[#059669] text-sm">← Upload New</Link>
          <span className="text-white font-semibold text-sm">Estate Audit & Roadmap Report</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => exportToPDF(reportRef.current)} className="bg-[#059669] text-white text-xs font-semibold px-4 py-2 rounded hover:bg-[#059669]/80">Export PDF</button>
          <button onClick={() => window.print()} className="bg-[#5A7A95] text-white text-xs font-semibold px-4 py-2 rounded hover:bg-[#5A7A95]/80">Print</button>
        </div>
      </div>

      {/* Report Content */}
      <div ref={reportRef} className="max-w-[210mm] mx-auto bg-white shadow-xl">
        
        {/* === COVER PAGE === */}
        <div className="report-page min-h-[297mm] flex flex-col justify-between p-16 bg-[#0D2338] text-white">
          <div>
            <img src={import.meta.env.BASE_URL + 'assets/logo-white.png'} alt="Unleashed Solutions" className="h-16 mb-12" />
          </div>
          <div>
            <p className="text-[#059669] text-sm font-semibold uppercase tracking-wider mb-4">Technology Assessment</p>
            <h1 className="text-4xl font-bold mb-4">Estate Audit & Technology Roadmap</h1>
            <h2 className="text-2xl text-[#5A7A95] mb-8">Trust-Wide Infrastructure Assessment - {schools.length} Schools</h2>
            <div className="border-t border-[#1A334F] pt-8 mt-8">
              <table className="text-sm">
                <tbody>
                  <tr><td className="text-[#5A7A95] pr-8 py-1">Client</td><td className="text-white font-semibold">{COMPANY.client}</td></tr>
                  <tr><td className="text-[#5A7A95] pr-8 py-1">Schools Assessed</td><td className="text-white">{schools.length}</td></tr>
                  <tr><td className="text-[#5A7A95] pr-8 py-1">Provider</td><td className="text-white">{COMPANY.name}</td></tr>
                  <tr><td className="text-[#5A7A95] pr-8 py-1">Report Date</td><td className="text-white">{today}</td></tr>
                  <tr><td className="text-[#5A7A95] pr-8 py-1">Classification</td><td className="text-white">CONFIDENTIAL</td></tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="text-[#5A7A95] text-xs">
            <p>This document contains detailed infrastructure and security assessments. Handle with care.</p>
          </div>
        </div>

        {/* === EXECUTIVE SUMMARY === */}
        <div className="report-page p-12">
          <ReportHeader title="Executive Summary" chapter={1} />
          
          <div className="mb-6">
            <p className="text-sm text-gray-700 mb-4">
              This report presents the findings from the technology estate audit conducted across {schools.length} schools 
              within {COMPANY.client}. The assessment covers infrastructure, security, connectivity, end-user computing, 
              and cloud services to provide a baseline for strategic planning and investment decisions.
            </p>
          </div>

          {/* Trust-Wide KPIs */}
          <h3 className="text-lg font-bold text-[#0D2338] mb-3">Trust-Wide Indicators</h3>
          <div className="grid grid-cols-4 gap-3 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded p-3 text-center">
              <div className="text-2xl font-bold text-blue-700">{schools.length}</div>
              <div className="text-xs text-blue-600">Schools Assessed</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded p-3 text-center">
              <div className="text-2xl font-bold text-red-700">{trustAnalytics.redCount}</div>
              <div className="text-xs text-red-600">Red RAG Items</div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded p-3 text-center">
              <div className="text-2xl font-bold text-amber-700">{trustAnalytics.amberCount}</div>
              <div className="text-xs text-amber-600">Amber RAG Items</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded p-3 text-center">
              <div className="text-2xl font-bold text-green-700">{trustAnalytics.greenCount}</div>
              <div className="text-xs text-green-600">Green RAG Items</div>
            </div>
          </div>

          {/* Red Flags */}
          {trustAnalytics.criticalFindings.length > 0 && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <h4 className="text-red-800 font-bold text-sm mb-2">CRITICAL FINDINGS - Immediate Action Required</h4>
              <ul className="text-red-700 text-xs space-y-1">
                {trustAnalytics.criticalFindings.slice(0, 10).map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-0.5 w-2 h-2 rounded-full bg-red-500 flex-shrink-0"></span>
                    <span><strong>{f.school}:</strong> {f.finding}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* What This Means */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
            <h4 className="text-blue-800 font-bold text-sm mb-2">WHAT THIS MEANS FOR THE TRUST</h4>
            <ul className="text-blue-700 text-xs space-y-1">
              <li>• {trustAnalytics.redCount > 0 ? `${trustAnalytics.redCount} critical infrastructure or security gaps require immediate investment and remediation` : 'No critical gaps identified - strong baseline position'}</li>
              <li>• {trustAnalytics.amberCount > 0 ? `${trustAnalytics.amberCount} items need attention within the next 3-6 months to prevent escalation to critical` : 'Few medium-risk items - proactive maintenance working well'}</li>
              <li>• The audit provides the evidence base for the Technology Roadmap and budget planning</li>
              <li>• Findings should be presented to the board alongside cost estimates for remediation</li>
            </ul>
          </div>
        </div>

        {/* === TRUST-WIDE OVERVIEW === */}
        <div className="report-page p-12">
          <ReportHeader title="Trust-Wide RAG Overview" chapter={2} />
          
          <div className="mb-6">
            <p className="text-sm text-gray-700 mb-4">
              The following table provides a RAG (Red/Amber/Green) summary across all schools. This enables 
              quick identification of which schools need the most urgent attention and where common patterns exist.
            </p>
          </div>

          {/* School Summary Table */}
          <h3 className="text-base font-bold text-[#0D2338] mb-2">School-by-School Summary</h3>
          <table className="w-full text-[9px] border-collapse mb-6">
            <thead>
              <tr className="bg-[#0D2338] text-white">
                <th className="p-1.5 text-left">School</th>
                <th className="p-1.5 text-center">Data Rows</th>
                <th className="p-1.5 text-center">Red Items</th>
                <th className="p-1.5 text-center">Amber Items</th>
                <th className="p-1.5 text-center">Green Items</th>
                <th className="p-1.5 text-center">Overall RAG</th>
              </tr>
            </thead>
            <tbody>
              {schools.map((school, i) => {
                const stats = getSchoolStats(school);
                return (
                  <tr key={i} className={`${stats.red > 3 ? 'bg-red-50' : i % 2 ? 'bg-gray-50' : ''}`}>
                    <td className="p-1.5 font-semibold">{school.name}</td>
                    <td className="p-1.5 text-center">{school.data.length}</td>
                    <td className="p-1.5 text-center font-bold text-red-600">{stats.red || '-'}</td>
                    <td className="p-1.5 text-center font-bold text-amber-600">{stats.amber || '-'}</td>
                    <td className="p-1.5 text-center font-bold text-green-600">{stats.green || '-'}</td>
                    <td className="p-1.5 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold ${stats.red > 3 ? 'bg-red-100 text-red-700' : stats.red > 0 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                        {stats.red > 3 ? 'RED' : stats.red > 0 ? 'AMBER' : 'GREEN'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Observations */}
          <div className="bg-gray-50 border border-gray-200 rounded p-4">
            <h4 className="font-bold text-sm text-[#0D2338] mb-2">Trust-Wide Observations</h4>
            <ul className="text-xs text-gray-700 space-y-1">
              <li>• {schools.length} schools assessed with varying levels of technology maturity</li>
              <li>• Common themes across RED-rated schools should inform trust-wide investment decisions</li>
              <li>• Schools with high RED counts should be prioritised in the remediation roadmap</li>
              <li>• GREEN-rated schools can serve as reference sites for best practice</li>
            </ul>
          </div>
        </div>

        {/* === PER-SCHOOL FINDINGS === */}
        {schools.slice(0, 10).map((school, schoolIdx) => {
          const stats = getSchoolStats(school);
          return (
            <div key={schoolIdx} className="report-page p-12">
              <ReportHeader title={school.name} chapter={`3.${schoolIdx + 1}`} />
              
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-red-50 border border-red-200 rounded p-2 text-center">
                  <div className="text-lg font-bold text-red-700">{stats.red}</div>
                  <div className="text-[10px] text-red-600">Red Items</div>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded p-2 text-center">
                  <div className="text-lg font-bold text-amber-700">{stats.amber}</div>
                  <div className="text-[10px] text-amber-600">Amber Items</div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded p-2 text-center">
                  <div className="text-lg font-bold text-green-700">{stats.green}</div>
                  <div className="text-[10px] text-green-600">Green Items</div>
                </div>
              </div>

              {/* School data table */}
              <table className="w-full text-[9px] border-collapse mb-4">
                <thead>
                  <tr className="bg-[#1A334F] text-white">
                    {school.data[0]?.slice(0, 6).map((h, hi) => (
                      <th key={hi} className="p-1.5 text-left">{h || `Col ${hi + 1}`}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {school.data.slice(1, 20).map((row, ri) => (
                    <tr key={ri} className={ri % 2 ? 'bg-gray-50' : ''}>
                      {row.slice(0, 6).map((cell, ci) => (
                        <td key={ci} className={`p-1.5 ${
                          String(cell).toLowerCase() === 'red' ? 'text-red-700 font-bold bg-red-50' :
                          String(cell).toLowerCase() === 'amber' ? 'text-amber-700 font-bold bg-amber-50' :
                          String(cell).toLowerCase() === 'green' ? 'text-green-700 font-bold bg-green-50' : ''
                        }`}>{cell || ''}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>

              {stats.red > 0 && (
                <div className="bg-red-50 border-l-4 border-red-500 p-3">
                  <h4 className="text-red-800 font-bold text-xs mb-1">Priority Actions for {school.name}</h4>
                  <p className="text-red-700 text-xs">{stats.red} items require immediate attention. Review RED-rated items above and schedule remediation within the next audit cycle.</p>
                </div>
              )}
            </div>
          );
        })}

        {/* === PRIORITY ACTIONS === */}
        <div className="report-page p-12">
          <ReportHeader title="Priority Actions & Roadmap Recommendations" chapter={4} />
          
          <div className="mb-6">
            <p className="text-sm text-gray-700 mb-4">
              Based on the estate audit findings, the following priority actions are recommended. These should 
              be incorporated into the Technology Roadmap and presented to the board with budget estimates.
            </p>
          </div>

          <h3 className="text-base font-bold text-red-700 mb-3">Immediate Actions (0-3 Months)</h3>
          <div className="bg-red-50 border border-red-200 rounded p-4 mb-6">
            <ul className="text-xs text-gray-800 space-y-2">
              <li className="flex items-start gap-2"><span className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-[10px] font-bold">1</span><span>Address all critical security findings (MFA, shared accounts, expired certificates)</span></li>
              <li className="flex items-start gap-2"><span className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-[10px] font-bold">2</span><span>Remediate RED-rated infrastructure items that pose immediate risk to operations</span></li>
              <li className="flex items-start gap-2"><span className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-[10px] font-bold">3</span><span>Ensure backup verification across all schools - test restore procedures</span></li>
              <li className="flex items-start gap-2"><span className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-[10px] font-bold">4</span><span>Update all out-of-support firmware and operating systems</span></li>
            </ul>
          </div>

          <h3 className="text-base font-bold text-amber-700 mb-3">Short-Term Actions (3-6 Months)</h3>
          <div className="bg-amber-50 border border-amber-200 rounded p-4 mb-6">
            <ul className="text-xs text-gray-800 space-y-2">
              <li className="flex items-start gap-2"><span className="bg-amber-500 text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-[10px] font-bold">5</span><span>Address AMBER-rated items before they escalate to critical status</span></li>
              <li className="flex items-start gap-2"><span className="bg-amber-500 text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-[10px] font-bold">6</span><span>Standardise tooling across schools (AV, backup, RMM, monitoring)</span></li>
              <li className="flex items-start gap-2"><span className="bg-amber-500 text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-[10px] font-bold">7</span><span>Complete network assessments and plan refresh where capacity is insufficient</span></li>
              <li className="flex items-start gap-2"><span className="bg-amber-500 text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-[10px] font-bold">8</span><span>Begin device lifecycle planning for end-of-life endpoints</span></li>
            </ul>
          </div>

          <h3 className="text-base font-bold text-green-700 mb-3">Strategic Actions (6-12 Months)</h3>
          <div className="bg-green-50 border border-green-200 rounded p-4 mb-6">
            <ul className="text-xs text-gray-800 space-y-2">
              <li className="flex items-start gap-2"><span className="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-[10px] font-bold">9</span><span>Implement trust-wide cloud strategy aligned with M365 licensing</span></li>
              <li className="flex items-start gap-2"><span className="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-[10px] font-bold">10</span><span>Execute network refresh programme at priority sites</span></li>
              <li className="flex items-start gap-2"><span className="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-[10px] font-bold">11</span><span>Achieve Cyber Essentials certification for all schools</span></li>
              <li className="flex items-start gap-2"><span className="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-[10px] font-bold">12</span><span>Establish ongoing audit cadence - annual refresh with quarterly spot-checks</span></li>
            </ul>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
            <h4 className="text-blue-800 font-bold text-sm mb-2">NEXT STEPS</h4>
            <ul className="text-blue-700 text-xs space-y-1">
              <li>• Present this report to the Trust board with cost estimates for remediation phases</li>
              <li>• Use findings to prioritise the Technology Roadmap delivery sequence</li>
              <li>• Schedule follow-up audits for RED-rated schools within 90 days</li>
              <li>• Establish baseline metrics for Year 2 comparison</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="report-page p-12 bg-[#0D2338] min-h-[200px] flex flex-col justify-center items-center text-center">
          <img src={import.meta.env.BASE_URL + 'assets/logo-white.png'} alt="Unleashed Solutions" className="h-12 mb-6" />
          <p className="text-white text-sm font-semibold">Unleashed Solutions Ltd</p>
          <p className="text-[#5A7A95] text-xs mt-2">Managed IT & Cyber Security Services</p>
          <p className="text-[#5A7A95] text-xs mt-1">Report generated: {today}</p>
          <p className="text-[#5A7A95] text-xs mt-4">CONFIDENTIAL</p>
        </div>
      </div>
    </div>
  );
}

function ReportHeader({ title, chapter }) {
  return (
    <div className="mb-6 pb-4 border-b-2 border-[#059669]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[#059669] text-xs font-semibold uppercase tracking-wider">Chapter {chapter}</p>
          <h2 className="text-2xl font-bold text-[#0D2338]">{title}</h2>
        </div>
        <img src={import.meta.env.BASE_URL + 'assets/mark.png'} alt="" className="h-8 opacity-50" />
      </div>
    </div>
  );
}

function getSchoolStats(school) {
  let red = 0, amber = 0, green = 0;
  school.data.forEach(row => {
    row.forEach(cell => {
      const val = String(cell || '').toLowerCase().trim();
      if (val === 'red') red++;
      else if (val === 'amber') amber++;
      else if (val === 'green') green++;
    });
  });
  return { red, amber, green };
}

function computeTrustAnalytics(schools) {
  let redCount = 0, amberCount = 0, greenCount = 0;
  const criticalFindings = [];

  schools.forEach(school => {
    const stats = getSchoolStats(school);
    redCount += stats.red;
    amberCount += stats.amber;
    greenCount += stats.green;
    
    if (stats.red > 3) {
      criticalFindings.push({ school: school.name, finding: `${stats.red} RED-rated items requiring immediate attention` });
    }
  });

  return { redCount, amberCount, greenCount, criticalFindings };
}
