import { BRAND, COMPANY } from '../utils/branding';

export default function MasterTrackerReport({ data, analytics }) {
  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Report Content */}
      <div className="max-w-[210mm] mx-auto bg-white shadow-xl">
        
        {/* === COVER PAGE === */}
        <div className="report-page min-h-[297mm] flex flex-col justify-between p-16 bg-[#0D2338] text-white">
          <div>
            <img src={import.meta.env.BASE_URL + 'assets/logo-white.png'} alt="Unleashed Solutions" className="h-16 mb-12" />
          </div>
          <div>
            <p className="text-[#0EA5E9] text-sm font-semibold uppercase tracking-wider mb-4">Management Report</p>
            <h1 className="text-4xl font-bold mb-4">vCTO Service Delivery Report</h1>
            <h2 className="text-2xl text-[#5A7A95] mb-8">Project Planning, Risk Management & Team Capability</h2>
            <div className="border-t border-[#1A334F] pt-8 mt-8">
              <table className="text-sm">
                <tbody>
                  <tr><td className="text-[#5A7A95] pr-8 py-1">Client</td><td className="text-white font-semibold">{COMPANY.client}</td></tr>
                  <tr><td className="text-[#5A7A95] pr-8 py-1">Service</td><td className="text-white">{COMPANY.service}</td></tr>
                  <tr><td className="text-[#5A7A95] pr-8 py-1">Provider</td><td className="text-white">{COMPANY.name}</td></tr>
                  <tr><td className="text-[#5A7A95] pr-8 py-1">Report Date</td><td className="text-white">{today}</td></tr>
                  <tr><td className="text-[#5A7A95] pr-8 py-1">Classification</td><td className="text-white">CONFIDENTIAL</td></tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="text-[#5A7A95] text-xs">
            <p>This document is confidential and intended for the named recipient only.</p>
          </div>
        </div>

        {/* === EXECUTIVE SUMMARY === */}
        <div className="report-page p-12">
          <ReportHeader title="Executive Summary" chapter={1} />
          
          <div className="mb-8">
            <h3 className="text-lg font-bold text-[#0D2338] mb-3">Overview</h3>
            <p className="text-sm text-gray-700 mb-4">
              This report provides a comprehensive analysis of the vCTO service delivery for {COMPANY.client}, 
              covering {COMPANY.schools} schools across Devon and Cornwall. The data is sourced from the vCTO 
              Master Tracker workbook and covers all operational, strategic, and capability dimensions of the engagement.
            </p>
          </div>

          {/* KPI Summary Grid */}
          <h3 className="text-lg font-bold text-[#0D2338] mb-3">Key Performance Indicators</h3>
          <div className="grid grid-cols-4 gap-3 mb-8">
            <KPICard label="Days Used" value={analytics.time?.totalDays?.toFixed(1) || '0'} sub={`of 48 (${analytics.time?.utilisation || 0}%)`} color={analytics.time?.utilisation > 80 ? 'red' : 'green'} />
            <KPICard label="Open RAID Items" value={analytics.raid?.open || 0} sub={`${analytics.raid?.critical?.length || 0} critical`} color={analytics.raid?.critical?.length > 0 ? 'red' : 'green'} />
            <KPICard label="Tasks In Progress" value={analytics.tasks?.byStatus?.['In Progress'] || 0} sub={`${analytics.tasks?.overdue?.length || 0} overdue`} color={analytics.tasks?.overdue?.length > 0 ? 'amber' : 'green'} />
            <KPICard label="Projects Active" value={analytics.portfolio?.byStatus?.['In Progress'] || 0} sub={`of ${analytics.portfolio?.total || 0} total`} color="blue" />
          </div>

          {/* Red Flags - Immediate Attention */}
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <h4 className="text-red-800 font-bold text-sm mb-2">RED FLAGS - Immediate Attention Required</h4>
            <ul className="text-red-700 text-xs space-y-1">
              {analytics.raid?.critical?.map((r, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-0.5 w-2 h-2 rounded-full bg-red-500 flex-shrink-0"></span>
                  <span><strong>{r.id}:</strong> {r.title} - {r.description}</span>
                </li>
              ))}
              {analytics.tasks?.overdue?.map((t, i) => (
                <li key={`t-${i}`} className="flex items-start gap-2">
                  <span className="mt-0.5 w-2 h-2 rounded-full bg-red-500 flex-shrink-0"></span>
                  <span><strong>OVERDUE:</strong> {t.task} (assigned to {t.assignedTo}) - due {formatDate(t.dueDate)}</span>
                </li>
              ))}
              {analytics.tasks?.blocked?.map((t, i) => (
                <li key={`b-${i}`} className="flex items-start gap-2">
                  <span className="mt-0.5 w-2 h-2 rounded-full bg-orange-500 flex-shrink-0"></span>
                  <span><strong>BLOCKED:</strong> {t.task} - {t.notes}</span>
                </li>
              ))}
              {(!analytics.raid?.critical?.length && !analytics.tasks?.overdue?.length && !analytics.tasks?.blocked?.length) && (
                <li className="text-green-700">No critical red flags at this time.</li>
              )}
            </ul>
          </div>

          {/* Priorities */}
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6">
            <h4 className="text-amber-800 font-bold text-sm mb-2">TOP PRIORITIES - This Period</h4>
            <ul className="text-amber-700 text-xs space-y-1">
              {data.tasks?.filter(t => t.priority === 'Critical' && t.status !== 'Complete').slice(0, 5).map((t, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="font-bold">{i + 1}.</span>
                  <span>{t.task} ({t.assignedTo}) - {t.status}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* What This Means */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
            <h4 className="text-blue-800 font-bold text-sm mb-2">WHAT THIS MEANS</h4>
            <p className="text-blue-700 text-xs">
              {analytics.time?.utilisation < 20 
                ? 'The engagement is in its early stages. Focus is on discovery, audit, and establishing governance frameworks. Time utilisation is on track for a front-loaded delivery model.'
                : analytics.time?.utilisation < 50
                ? 'Delivery is progressing well with significant audit and remediation activity. The team is transitioning from discovery into active project delivery.'
                : 'The engagement is in mature delivery phase. Focus should shift to roadmap execution, capability building, and preparing for Year 2 planning.'}
              {analytics.raid?.critical?.length > 2 && ' There are multiple critical risks that require immediate board-level attention and resource allocation.'}
              {analytics.tasks?.blocked?.length > 0 && ' Blocked tasks indicate dependencies or access issues that need escalation.'}
            </p>
          </div>
        </div>

        {/* === TIME & UTILISATION === */}
        <div className="report-page p-12">
          <ReportHeader title="Time & Utilisation Analysis" chapter={2} />
          
          <div className="mb-6">
            <h3 className="text-lg font-bold text-[#0D2338] mb-3">Contract Utilisation</h3>
            <p className="text-sm text-gray-700 mb-4">
              The vCTO contract provides {COMPANY.contract} at a day rate of {COMPANY.rate}. 
              This section analyses how time has been allocated, the current burn rate, and whether 
              delivery is on pace for the contract period.
            </p>
          </div>

          {/* Utilisation Table */}
          <table className="w-full text-xs border-collapse mb-6">
            <thead>
              <tr className="bg-[#0D2338] text-white">
                <th className="p-2 text-left">Metric</th>
                <th className="p-2 text-right">Value</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Commentary</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-2 font-semibold">Total Days Used</td>
                <td className="p-2 text-right font-bold">{analytics.time?.totalDays?.toFixed(1)}</td>
                <td className="p-2"><StatusBadge status={analytics.time?.utilisation > 90 ? 'Red' : analytics.time?.utilisation > 70 ? 'Amber' : 'Green'} /></td>
                <td className="p-2 text-gray-600">{analytics.time?.utilisation}% of annual allocation consumed</td>
              </tr>
              <tr className="border-b bg-gray-50">
                <td className="p-2 font-semibold">Days Remaining</td>
                <td className="p-2 text-right font-bold">{analytics.time?.remaining?.toFixed(1)}</td>
                <td className="p-2"><StatusBadge status={analytics.time?.remaining < 10 ? 'Red' : analytics.time?.remaining < 20 ? 'Amber' : 'Green'} /></td>
                <td className="p-2 text-gray-600">{analytics.time?.remaining < 10 ? 'Low allocation remaining - review scope' : 'Sufficient allocation for planned activity'}</td>
              </tr>
              <tr className="border-b">
                <td className="p-2 font-semibold">Total Hours Logged</td>
                <td className="p-2 text-right font-bold">{analytics.time?.totalHours}</td>
                <td className="p-2"><StatusBadge status="Green" /></td>
                <td className="p-2 text-gray-600">Across {analytics.time?.entryCount} time entries</td>
              </tr>
            </tbody>
          </table>

          {/* Time by Type */}
          <h3 className="text-lg font-bold text-[#0D2338] mb-3">Time Allocation by Activity Type</h3>
          <p className="text-sm text-gray-600 mb-3">How vCTO time has been distributed across different activity categories:</p>
          <table className="w-full text-xs border-collapse mb-6">
            <thead>
              <tr className="bg-[#1A334F] text-white">
                <th className="p-2 text-left">Activity Type</th>
                <th className="p-2 text-right">Days</th>
                <th className="p-2 text-right">% of Total</th>
                <th className="p-2 text-left">Visual</th>
              </tr>
            </thead>
            <tbody>
              {analytics.time?.byType && Object.entries(analytics.time.byType).sort((a, b) => b[1] - a[1]).map(([type, days], i) => (
                <tr key={i} className={i % 2 ? 'bg-gray-50' : ''}>
                  <td className="p-2 font-semibold">{type}</td>
                  <td className="p-2 text-right">{days.toFixed(1)}</td>
                  <td className="p-2 text-right">{Math.round((days / analytics.time.totalDays) * 100)}%</td>
                  <td className="p-2"><div className="h-3 bg-[#0EA5E9] rounded" style={{ width: `${Math.round((days / analytics.time.totalDays) * 100)}%` }}></div></td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Time by Deliverable */}
          <h3 className="text-lg font-bold text-[#0D2338] mb-3">Time by Deliverable Category</h3>
          <table className="w-full text-xs border-collapse mb-6">
            <thead>
              <tr className="bg-[#1A334F] text-white">
                <th className="p-2 text-left">Deliverable</th>
                <th className="p-2 text-right">Days</th>
                <th className="p-2 text-right">% of Total</th>
              </tr>
            </thead>
            <tbody>
              {analytics.time?.byDeliverable && Object.entries(analytics.time.byDeliverable).sort((a, b) => b[1] - a[1]).map(([del, days], i) => (
                <tr key={i} className={i % 2 ? 'bg-gray-50' : ''}>
                  <td className="p-2 font-semibold">{del}</td>
                  <td className="p-2 text-right">{days.toFixed(1)}</td>
                  <td className="p-2 text-right">{Math.round((days / analytics.time.totalDays) * 100)}%</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Time by Site */}
          <h3 className="text-lg font-bold text-[#0D2338] mb-3">Time by Location</h3>
          <p className="text-sm text-gray-600 mb-3">Breakdown of on-site vs remote activity:</p>
          <table className="w-full text-xs border-collapse mb-6">
            <thead>
              <tr className="bg-[#1A334F] text-white">
                <th className="p-2 text-left">Site/Location</th>
                <th className="p-2 text-right">Days</th>
                <th className="p-2 text-right">% of Total</th>
              </tr>
            </thead>
            <tbody>
              {analytics.time?.bySite && Object.entries(analytics.time.bySite).sort((a, b) => b[1] - a[1]).map(([site, days], i) => (
                <tr key={i} className={i % 2 ? 'bg-gray-50' : ''}>
                  <td className="p-2 font-semibold">{site}</td>
                  <td className="p-2 text-right">{days.toFixed(1)}</td>
                  <td className="p-2 text-right">{Math.round((days / analytics.time.totalDays) * 100)}%</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Challenges & Observations */}
          <div className="bg-gray-50 border border-gray-200 rounded p-4">
            <h4 className="font-bold text-sm text-[#0D2338] mb-2">Observations & Challenges</h4>
            <ul className="text-xs text-gray-700 space-y-1">
              <li>• {analytics.time?.totalDays > 0 ? `Current pace: ${(analytics.time.totalDays / Math.max(1, analytics.time.entryCount)).toFixed(1)} days per visit average` : 'No time logged yet'}</li>
              <li>• {analytics.time?.byType?.['On-site'] ? `${Math.round((analytics.time.byType['On-site'] / analytics.time.totalDays) * 100)}% of time spent on-site - indicates strong engagement with schools` : 'Remote/on-site split to be established'}</li>
              <li>• Contract is front-loaded by design - expect higher utilisation in first 6 months</li>
              <li>• Any site audit days not yet scheduled should be prioritised before October half-term</li>
            </ul>
          </div>
        </div>

        {/* === RAID ANALYSIS === */}
        <div className="report-page p-12">
          <ReportHeader title="RAID Register - Full Analysis" chapter={3} />
          
          <div className="mb-6">
            <h3 className="text-lg font-bold text-[#0D2338] mb-3">Risk, Assumption, Issue & Dependency Register</h3>
            <p className="text-sm text-gray-700 mb-4">
              The RAID register captures all known risks, assumptions, issues, and dependencies that may 
              impact the successful delivery of the vCTO programme. Items are categorised by type, severity, 
              and status. Critical and high-severity open items require immediate attention.
            </p>
          </div>

          {/* RAID Summary */}
          <div className="grid grid-cols-5 gap-2 mb-6">
            <div className="bg-red-50 border border-red-200 rounded p-3 text-center">
              <div className="text-2xl font-bold text-red-600">{analytics.raid?.critical?.length || 0}</div>
              <div className="text-xs text-red-700">Critical Open</div>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded p-3 text-center">
              <div className="text-2xl font-bold text-orange-600">{analytics.raid?.high?.length || 0}</div>
              <div className="text-xs text-orange-700">High Open</div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded p-3 text-center">
              <div className="text-2xl font-bold text-amber-600">{analytics.raid?.open - (analytics.raid?.critical?.length || 0) - (analytics.raid?.high?.length || 0)}</div>
              <div className="text-xs text-amber-700">Medium/Low</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded p-3 text-center">
              <div className="text-2xl font-bold text-blue-600">{analytics.raid?.mitigating || 0}</div>
              <div className="text-xs text-blue-700">Mitigating</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded p-3 text-center">
              <div className="text-2xl font-bold text-green-600">{analytics.raid?.closed || 0}</div>
              <div className="text-xs text-green-700">Closed</div>
            </div>
          </div>

          {/* By Type */}
          <h3 className="text-base font-bold text-[#0D2338] mb-2">Breakdown by Type</h3>
          <table className="w-full text-xs border-collapse mb-6">
            <thead>
              <tr className="bg-[#1A334F] text-white">
                <th className="p-2 text-left">Type</th>
                <th className="p-2 text-right">Count</th>
                <th className="p-2 text-left">What This Means</th>
              </tr>
            </thead>
            <tbody>
              {analytics.raid?.byType && Object.entries(analytics.raid.byType).map(([type, count], i) => (
                <tr key={i} className={i % 2 ? 'bg-gray-50' : ''}>
                  <td className="p-2 font-semibold">{type}</td>
                  <td className="p-2 text-right font-bold">{count}</td>
                  <td className="p-2 text-gray-600">
                    {type === 'Risk' && 'Potential future events that could impact delivery if not managed'}
                    {type === 'Issue' && 'Active problems requiring immediate resolution'}
                    {type === 'Assumption' && 'Believed truths that need validation - if wrong, plans may change'}
                    {type === 'Dependency' && 'External factors or prerequisites that must be met for progress'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Full RAID Table */}
          <h3 className="text-base font-bold text-[#0D2338] mb-2">All Open Items - Detailed View</h3>
          <table className="w-full text-[10px] border-collapse mb-6">
            <thead>
              <tr className="bg-[#0D2338] text-white">
                <th className="p-1.5 text-left">ID</th>
                <th className="p-1.5 text-left">Type</th>
                <th className="p-1.5 text-left">Title</th>
                <th className="p-1.5 text-left">Impact</th>
                <th className="p-1.5 text-left">Status</th>
                <th className="p-1.5 text-left">Owner</th>
                <th className="p-1.5 text-left">Mitigation/Action</th>
              </tr>
            </thead>
            <tbody>
              {data.raid?.filter(r => r.status !== 'Closed' && r.status !== 'Accepted').map((r, i) => (
                <tr key={i} className={`${r.impact === 'Critical' ? 'bg-red-50' : r.impact === 'High' ? 'bg-orange-50' : i % 2 ? 'bg-gray-50' : ''}`}>
                  <td className="p-1.5 font-mono font-bold">{r.id}</td>
                  <td className="p-1.5">{r.type}</td>
                  <td className="p-1.5 font-semibold">{r.title}</td>
                  <td className="p-1.5"><SeverityBadge severity={r.impact} /></td>
                  <td className="p-1.5"><StatusBadge status={r.status === 'Open' ? 'Red' : 'Amber'} label={r.status} /></td>
                  <td className="p-1.5">{r.owner}</td>
                  <td className="p-1.5 text-gray-600">{r.mitigation}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* RAID Interpretation */}
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <h4 className="text-red-800 font-bold text-sm mb-2">Critical Items - What They Mean & What To Do</h4>
            {analytics.raid?.critical?.map((r, i) => (
              <div key={i} className="mb-3 last:mb-0">
                <p className="text-red-800 text-xs font-semibold">{r.id}: {r.title}</p>
                <p className="text-red-700 text-xs mt-1">{r.description}</p>
                <p className="text-red-600 text-xs mt-1 italic">Action: {r.mitigation}</p>
              </div>
            ))}
          </div>
        </div>

        {/* === TASK MANAGEMENT === */}
        <div className="report-page p-12">
          <ReportHeader title="Task Management & Workload Analysis" chapter={4} />
          
          <div className="mb-6">
            <p className="text-sm text-gray-700 mb-4">
              This section provides a detailed breakdown of all active tasks, their status, ownership, 
              and any issues affecting delivery. Tasks are the operational execution layer beneath the 
              strategic portfolio.
            </p>
          </div>

          {/* Task Status Summary */}
          <h3 className="text-base font-bold text-[#0D2338] mb-3">Task Status Overview</h3>
          <div className="grid grid-cols-5 gap-2 mb-6">
            {['Not Started', 'In Progress', 'Complete', 'Blocked', 'On Hold'].map(status => (
              <div key={status} className={`rounded p-3 text-center border ${
                status === 'Complete' ? 'bg-green-50 border-green-200' :
                status === 'Blocked' ? 'bg-red-50 border-red-200' :
                status === 'In Progress' ? 'bg-amber-50 border-amber-200' :
                'bg-gray-50 border-gray-200'
              }`}>
                <div className="text-xl font-bold">{analytics.tasks?.byStatus?.[status] || 0}</div>
                <div className="text-xs">{status}</div>
              </div>
            ))}
          </div>

          {/* Full Task Table */}
          <h3 className="text-base font-bold text-[#0D2338] mb-2">All Tasks - Detailed Status</h3>
          <table className="w-full text-[10px] border-collapse mb-6">
            <thead>
              <tr className="bg-[#0D2338] text-white">
                <th className="p-1.5 text-left">ID</th>
                <th className="p-1.5 text-left">Task</th>
                <th className="p-1.5 text-left">Category</th>
                <th className="p-1.5 text-left">Assigned</th>
                <th className="p-1.5 text-left">Due</th>
                <th className="p-1.5 text-left">Status</th>
                <th className="p-1.5 text-left">Priority</th>
                <th className="p-1.5 text-right">%</th>
              </tr>
            </thead>
            <tbody>
              {data.tasks?.map((t, i) => (
                <tr key={i} className={`${t.status === 'Blocked' ? 'bg-red-50' : t.status === 'Complete' ? 'bg-green-50' : i % 2 ? 'bg-gray-50' : ''}`}>
                  <td className="p-1.5 font-mono font-bold">{t.id}</td>
                  <td className="p-1.5 font-semibold">{t.task}</td>
                  <td className="p-1.5">{t.category}</td>
                  <td className="p-1.5">{t.assignedTo}</td>
                  <td className="p-1.5">{formatDate(t.dueDate)}</td>
                  <td className="p-1.5"><StatusBadge status={t.status === 'Complete' ? 'Green' : t.status === 'Blocked' ? 'Red' : t.status === 'In Progress' ? 'Amber' : 'Grey'} label={t.status} /></td>
                  <td className="p-1.5"><SeverityBadge severity={t.priority} /></td>
                  <td className="p-1.5 text-right font-bold">{t.percentComplete}%</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Workload by Person */}
          <h3 className="text-base font-bold text-[#0D2338] mb-2">Workload Distribution by Engineer</h3>
          <p className="text-xs text-gray-600 mb-3">Shows how tasks are distributed across the team and identifies potential overloading:</p>
          <table className="w-full text-xs border-collapse mb-6">
            <thead>
              <tr className="bg-[#1A334F] text-white">
                <th className="p-2 text-left">Engineer</th>
                <th className="p-2 text-right">Total Tasks</th>
                <th className="p-2 text-right">In Progress</th>
                <th className="p-2 text-right">Blocked</th>
                <th className="p-2 text-right">Complete</th>
                <th className="p-2 text-left">Assessment</th>
              </tr>
            </thead>
            <tbody>
              {analytics.tasks?.byPerson && Object.entries(analytics.tasks.byPerson).map(([person, tasks], i) => {
                const inProg = tasks.filter(t => t.status === 'In Progress').length;
                const blocked = tasks.filter(t => t.status === 'Blocked').length;
                const complete = tasks.filter(t => t.status === 'Complete').length;
                return (
                  <tr key={i} className={i % 2 ? 'bg-gray-50' : ''}>
                    <td className="p-2 font-semibold">{person}</td>
                    <td className="p-2 text-right">{tasks.length}</td>
                    <td className="p-2 text-right">{inProg}</td>
                    <td className="p-2 text-right font-bold text-red-600">{blocked || '-'}</td>
                    <td className="p-2 text-right text-green-600">{complete}</td>
                    <td className="p-2 text-gray-600">{inProg > 4 ? 'Heavy workload - monitor capacity' : blocked > 0 ? 'Has blocked items - needs escalation' : 'Workload manageable'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Blocked Items Detail */}
          {analytics.tasks?.blocked?.length > 0 && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <h4 className="text-red-800 font-bold text-sm mb-2">BLOCKED TASKS - Escalation Required</h4>
              {analytics.tasks.blocked.map((t, i) => (
                <div key={i} className="mb-2 last:mb-0">
                  <p className="text-red-800 text-xs font-semibold">{t.id}: {t.task}</p>
                  <p className="text-red-700 text-xs">Assigned to: {t.assignedTo} | Reason: {t.notes}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* === PORTFOLIO === */}
        <div className="report-page p-12">
          <ReportHeader title="Project Portfolio Status" chapter={5} />
          
          <div className="mb-6">
            <p className="text-sm text-gray-700 mb-4">
              The project portfolio represents the strategic delivery programme for the vCTO engagement.
              Each project aligns to a technology workstream and has defined timelines mapped against the 
              academic year calendar, accounting for Devon school holidays.
            </p>
          </div>

          {/* Portfolio Summary */}
          <h3 className="text-base font-bold text-[#0D2338] mb-3">Portfolio Status Summary</h3>
          <div className="grid grid-cols-5 gap-2 mb-6">
            {['Not Started', 'In Progress', 'Complete', 'On Hold', 'At Risk'].map(status => (
              <div key={status} className={`rounded p-3 text-center border ${
                status === 'Complete' ? 'bg-green-50 border-green-200' :
                status === 'At Risk' ? 'bg-red-50 border-red-200' :
                status === 'In Progress' ? 'bg-blue-50 border-blue-200' :
                'bg-gray-50 border-gray-200'
              }`}>
                <div className="text-xl font-bold">{analytics.portfolio?.byStatus?.[status] || 0}</div>
                <div className="text-xs">{status}</div>
              </div>
            ))}
          </div>

          {/* Full Project Table */}
          <h3 className="text-base font-bold text-[#0D2338] mb-2">All Projects</h3>
          <table className="w-full text-[10px] border-collapse mb-6">
            <thead>
              <tr className="bg-[#0D2338] text-white">
                <th className="p-1.5 text-left">#</th>
                <th className="p-1.5 text-left">Project</th>
                <th className="p-1.5 text-left">Workstream</th>
                <th className="p-1.5 text-left">Priority</th>
                <th className="p-1.5 text-left">Start</th>
                <th className="p-1.5 text-left">End</th>
                <th className="p-1.5 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.portfolio?.map((p, i) => (
                <tr key={i} className={`${p.status === 'At Risk' ? 'bg-red-50' : p.status === 'Complete' ? 'bg-green-50' : i % 2 ? 'bg-gray-50' : ''}`}>
                  <td className="p-1.5">{p.num}</td>
                  <td className="p-1.5 font-semibold">{p.project}</td>
                  <td className="p-1.5">{p.workstream}</td>
                  <td className="p-1.5"><SeverityBadge severity={p.priority} /></td>
                  <td className="p-1.5">{formatDate(p.start)}</td>
                  <td className="p-1.5">{formatDate(p.end)}</td>
                  <td className="p-1.5"><StatusBadge status={p.status === 'Complete' ? 'Green' : p.status === 'At Risk' ? 'Red' : p.status === 'In Progress' ? 'Amber' : 'Grey'} label={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* By Workstream */}
          <h3 className="text-base font-bold text-[#0D2338] mb-2">Projects by Workstream</h3>
          <table className="w-full text-xs border-collapse mb-6">
            <thead>
              <tr className="bg-[#1A334F] text-white">
                <th className="p-2 text-left">Workstream</th>
                <th className="p-2 text-right">Projects</th>
                <th className="p-2 text-left">Status Mix</th>
              </tr>
            </thead>
            <tbody>
              {analytics.portfolio?.byWorkstream && Object.entries(analytics.portfolio.byWorkstream).map(([ws, projects], i) => (
                <tr key={i} className={i % 2 ? 'bg-gray-50' : ''}>
                  <td className="p-2 font-semibold">{ws}</td>
                  <td className="p-2 text-right">{projects.length}</td>
                  <td className="p-2 text-gray-600">{projects.map(p => p.status).join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="bg-gray-50 border border-gray-200 rounded p-4">
            <h4 className="font-bold text-sm text-[#0D2338] mb-2">Timeline Observations</h4>
            <ul className="text-xs text-gray-700 space-y-1">
              <li>• {analytics.portfolio?.total} projects planned across the contract year</li>
              <li>• Projects are sequenced to respect school holiday periods (no disruptive work during term breaks)</li>
              <li>• Front-loaded discovery and security remediation, with infrastructure projects in H2</li>
              <li>• Any project marked "At Risk" requires board-level discussion at SteerCo</li>
            </ul>
          </div>
        </div>

        {/* === GOVERNANCE === */}
        <div className="report-page p-12">
          <ReportHeader title="Governance & Decision Log" chapter={6} />
          
          <div className="mb-6">
            <p className="text-sm text-gray-700 mb-4">
              Governance activities ensure accountability, alignment, and transparent decision-making. 
              This section covers workshop cadence, key decisions made, and the actions arising from governance activities.
            </p>
          </div>

          {/* Governance KPIs */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-purple-50 border border-purple-200 rounded p-4 text-center">
              <div className="text-2xl font-bold text-purple-700">{data.workshops?.length || 0}</div>
              <div className="text-xs text-purple-600">Workshops Held</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded p-4 text-center">
              <div className="text-2xl font-bold text-blue-700">{data.decisions?.length || 0}</div>
              <div className="text-xs text-blue-600">Decisions Logged</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded p-4 text-center">
              <div className="text-2xl font-bold text-green-700">{data.decisions?.filter(d => d.status === 'Active').length || 0}</div>
              <div className="text-xs text-green-600">Active Decisions</div>
            </div>
          </div>

          {/* Workshop Log */}
          <h3 className="text-base font-bold text-[#0D2338] mb-2">Workshop Log</h3>
          <table className="w-full text-[10px] border-collapse mb-6">
            <thead>
              <tr className="bg-[#0D2338] text-white">
                <th className="p-1.5 text-left">Date</th>
                <th className="p-1.5 text-left">#</th>
                <th className="p-1.5 text-left">Attendees</th>
                <th className="p-1.5 text-left">Key Decisions</th>
                <th className="p-1.5 text-left">Actions</th>
                <th className="p-1.5 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.workshops?.map((w, i) => (
                <tr key={i} className={i % 2 ? 'bg-gray-50' : ''}>
                  <td className="p-1.5">{formatDate(w.date)}</td>
                  <td className="p-1.5 font-bold">{w.number}</td>
                  <td className="p-1.5">{w.attendees}</td>
                  <td className="p-1.5">{w.keyDecisions}</td>
                  <td className="p-1.5">{w.actions}</td>
                  <td className="p-1.5"><StatusBadge status={w.status === 'Complete' ? 'Green' : 'Amber'} label={w.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Decision Log */}
          <h3 className="text-base font-bold text-[#0D2338] mb-2">Decision Register</h3>
          <p className="text-xs text-gray-600 mb-3">All formal decisions made during the engagement, with rationale and impact assessment:</p>
          <table className="w-full text-[10px] border-collapse mb-6">
            <thead>
              <tr className="bg-[#1A334F] text-white">
                <th className="p-1.5 text-left">Date</th>
                <th className="p-1.5 text-left">ID</th>
                <th className="p-1.5 text-left">Decision</th>
                <th className="p-1.5 text-left">Rationale</th>
                <th className="p-1.5 text-left">Impact</th>
                <th className="p-1.5 text-left">Reversible?</th>
              </tr>
            </thead>
            <tbody>
              {data.decisions?.map((d, i) => (
                <tr key={i} className={i % 2 ? 'bg-gray-50' : ''}>
                  <td className="p-1.5">{formatDate(d.date)}</td>
                  <td className="p-1.5 font-mono font-bold">{d.id}</td>
                  <td className="p-1.5 font-semibold">{d.decision}</td>
                  <td className="p-1.5 text-gray-600">{d.rationale}</td>
                  <td className="p-1.5">{d.impact}</td>
                  <td className="p-1.5">{d.reversible}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* === SKILLS & CAPABILITY === */}
        <div className="report-page p-12">
          <ReportHeader title="Skills & Capability Assessment" chapter={7} />
          
          <div className="mb-6">
            <p className="text-sm text-gray-700 mb-4">
              This section assesses the technical capability of the engineering team across support operations 
              and project delivery specialisms. The assessment identifies where engineers are qualified to operate 
              independently, where gaps exist, and what training is required.
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-4">
              <p className="text-blue-800 text-xs font-semibold">PROGRESSION RULES</p>
              <p className="text-blue-700 text-xs mt-1">• An engineer must NOT progress to the next level unless they have 100% competency at their current level</p>
              <p className="text-blue-700 text-xs">• An engineer must NOT be assigned to a project unless they are 50%+ proficient in the required skills</p>
              <p className="text-blue-700 text-xs">• Gaps must be addressed through the Training Plan before assignment</p>
            </div>
          </div>

          {/* Engineer Level Qualification */}
          <h3 className="text-base font-bold text-[#0D2338] mb-3">Engineer Level Qualification (Support & Cyber)</h3>
          <p className="text-xs text-gray-600 mb-3">Determined by 100% completion rule - all skills at current level must be Y before progressing:</p>
          <table className="w-full text-xs border-collapse mb-6">
            <thead>
              <tr className="bg-[#0D2338] text-white">
                <th className="p-2 text-left">Engineer</th>
                <th className="p-2 text-center">L1 Complete</th>
                <th className="p-2 text-center">L2 Complete</th>
                <th className="p-2 text-center">L3 Complete</th>
                <th className="p-2 text-center">Qualified Level</th>
                <th className="p-2 text-left">Can Progress?</th>
              </tr>
            </thead>
            <tbody>
              {analytics.skills?.engineers?.map((eng, i) => {
                const profile = analytics.skills.engineerProfiles[eng];
                if (!profile) return null;
                const s = profile.support;
                const l1Total = s.L1.y + s.L1.n + s.L1.ip;
                const l2Total = s.L2.y + s.L2.n + s.L2.ip;
                const l3Total = s.L3.y + s.L3.n + s.L3.ip;
                const l1Pct = l1Total > 0 ? Math.round((s.L1.y / l1Total) * 100) : 0;
                const l2Pct = l2Total > 0 ? Math.round((s.L2.y / l2Total) * 100) : 0;
                const l3Pct = l3Total > 0 ? Math.round((s.L3.y / l3Total) * 100) : 0;
                const qualLevel = l1Pct < 100 ? 'Trainee' : l2Pct < 100 ? 'Level 1' : l3Pct < 100 ? 'Level 2' : 'Level 3';
                const canProgress = qualLevel === 'Trainee' ? 'Complete L1 first' : qualLevel === 'Level 1' ? 'Complete L2 first' : qualLevel === 'Level 2' ? 'Working on L3' : 'Fully qualified';
                return (
                  <tr key={i} className={i % 2 ? 'bg-gray-50' : ''}>
                    <td className="p-2 font-semibold">{eng}</td>
                    <td className="p-2 text-center"><PctBadge pct={l1Pct} /></td>
                    <td className="p-2 text-center"><PctBadge pct={l2Pct} /></td>
                    <td className="p-2 text-center"><PctBadge pct={l3Pct} /></td>
                    <td className="p-2 text-center font-bold">{qualLevel}</td>
                    <td className="p-2 text-gray-600">{canProgress}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Project Eligibility */}
          <h3 className="text-base font-bold text-[#0D2338] mb-3">Project Eligibility Matrix</h3>
          <p className="text-xs text-gray-600 mb-3">Shows whether each engineer meets the 50% proficiency threshold for each project specialism. RED = cannot be assigned without training:</p>
          <table className="w-full text-[10px] border-collapse mb-6">
            <thead>
              <tr className="bg-[#0D2338] text-white">
                <th className="p-1.5 text-left">Engineer</th>
                {analytics.skills?.engineerProfiles && Object.keys(Object.values(analytics.skills.engineerProfiles)[0]?.projects || {}).map(spec => (
                  <th key={spec} className="p-1.5 text-center">{spec}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {analytics.skills?.engineers?.map((eng, i) => {
                const projects = analytics.skills.engineerProfiles[eng]?.projects || {};
                return (
                  <tr key={i} className={i % 2 ? 'bg-gray-50' : ''}>
                    <td className="p-1.5 font-semibold">{eng}</td>
                    {Object.entries(projects).map(([spec, counts]) => {
                      const total = counts.y + counts.n + counts.ip;
                      const pct = total > 0 ? Math.round((counts.y / total) * 100) : 0;
                      const eligible = pct >= 50;
                      return (
                        <td key={spec} className={`p-1.5 text-center font-bold ${eligible ? (pct >= 70 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700') : 'bg-red-100 text-red-700'}`}>
                          {pct}%
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="bg-amber-50 border-l-4 border-amber-500 p-4">
            <h4 className="text-amber-800 font-bold text-sm mb-2">KEY: Project Eligibility</h4>
            <ul className="text-amber-700 text-xs space-y-1">
              <li>• <span className="inline-block w-3 h-3 bg-green-200 border border-green-400 mr-1"></span> GREEN (70%+) = Fully eligible, can lead projects in this area</li>
              <li>• <span className="inline-block w-3 h-3 bg-amber-200 border border-amber-400 mr-1"></span> AMBER (50-69%) = Eligible with supervision, gaps should be addressed</li>
              <li>• <span className="inline-block w-3 h-3 bg-red-200 border border-red-400 mr-1"></span> RED (&lt;50%) = NOT eligible - must complete Training Plan activities first</li>
            </ul>
          </div>
        </div>

        {/* === TRAINING & DEVELOPMENT === */}
        <div className="report-page p-12">
          <ReportHeader title="Training & Development Plan" chapter={8} />
          
          <div className="mb-6">
            <p className="text-sm text-gray-700 mb-4">
              The training plan addresses identified skills gaps and ensures engineers can meet the requirements 
              of upcoming projects. Each development activity is linked to a specific gap identified in the 
              skills assessment.
            </p>
          </div>

          {data.trainingPlan?.length > 0 && (
            <>
              <table className="w-full text-[10px] border-collapse mb-6">
                <thead>
                  <tr className="bg-[#0D2338] text-white">
                    <th className="p-2 text-left">Engineer</th>
                    <th className="p-2 text-left">Current</th>
                    <th className="p-2 text-left">Target</th>
                    <th className="p-2 text-left">Gap Area</th>
                    <th className="p-2 text-left">Development Activity</th>
                    <th className="p-2 text-left">Target Date</th>
                    <th className="p-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.trainingPlan.map((t, i) => (
                    <tr key={i} className={i % 2 ? 'bg-gray-50' : ''}>
                      <td className="p-2 font-semibold">{t.engineer}</td>
                      <td className="p-2">{t.currentLevel}</td>
                      <td className="p-2">{t.targetLevel}</td>
                      <td className="p-2">{t.gapArea}</td>
                      <td className="p-2">{t.activity}</td>
                      <td className="p-2">{formatDate(t.targetDate)}</td>
                      <td className="p-2"><StatusBadge status={t.status === 'Complete' ? 'Green' : t.status === 'In Progress' ? 'Amber' : 'Grey'} label={t.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Training by Engineer */}
              <h3 className="text-base font-bold text-[#0D2338] mb-2">Development Summary by Engineer</h3>
              {analytics.training?.byEngineer && Object.entries(analytics.training.byEngineer).map(([eng, items]) => (
                <div key={eng} className="mb-4 bg-gray-50 rounded p-3">
                  <h4 className="font-bold text-sm text-[#0D2338]">{eng}</h4>
                  <ul className="text-xs text-gray-700 mt-1 space-y-0.5">
                    {items.map((t, i) => (
                      <li key={i}>• {t.gapArea}: {t.activity} ({t.status})</li>
                    ))}
                  </ul>
                </div>
              ))}
            </>
          )}
        </div>

        {/* === RED FLAGS & PRIORITIES === */}
        <div className="report-page p-12">
          <ReportHeader title="Red Flags, Priorities & Next Actions" chapter={9} />
          
          <div className="mb-6">
            <p className="text-sm text-gray-700 mb-4">
              This final section consolidates all critical findings, priority actions, and recommended next steps 
              for the board and operational team.
            </p>
          </div>

          {/* Red Flags */}
          <h3 className="text-base font-bold text-red-700 mb-3">RED FLAGS - Require Immediate Board Attention</h3>
          <div className="bg-red-50 border border-red-200 rounded p-4 mb-6">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-red-200">
                  <th className="p-2 text-left text-red-800">Item</th>
                  <th className="p-2 text-left text-red-800">Issue</th>
                  <th className="p-2 text-left text-red-800">Impact if Not Addressed</th>
                  <th className="p-2 text-left text-red-800">Action Required</th>
                </tr>
              </thead>
              <tbody>
                {analytics.raid?.critical?.map((r, i) => (
                  <tr key={i} className="border-b border-red-100">
                    <td className="p-2 font-bold text-red-700">{r.id}</td>
                    <td className="p-2 text-red-700">{r.title}</td>
                    <td className="p-2 text-red-600">{r.description}</td>
                    <td className="p-2 text-red-600 font-semibold">{r.mitigation}</td>
                  </tr>
                ))}
                {analytics.tasks?.blocked?.map((t, i) => (
                  <tr key={`b-${i}`} className="border-b border-red-100">
                    <td className="p-2 font-bold text-red-700">{t.id}</td>
                    <td className="p-2 text-red-700">BLOCKED: {t.task}</td>
                    <td className="p-2 text-red-600">Delivery delayed, downstream tasks impacted</td>
                    <td className="p-2 text-red-600 font-semibold">{t.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Priority Actions */}
          <h3 className="text-base font-bold text-[#0D2338] mb-3">PRIORITY ACTIONS - Next 30 Days</h3>
          <div className="bg-amber-50 border border-amber-200 rounded p-4 mb-6">
            <ol className="text-xs text-gray-800 space-y-2">
              {data.tasks?.filter(t => t.priority === 'Critical' && t.status !== 'Complete').map((t, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="bg-amber-500 text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-[10px] font-bold">{i + 1}</span>
                  <div>
                    <span className="font-semibold">{t.task}</span>
                    <span className="text-gray-500"> - {t.assignedTo} - Due: {formatDate(t.dueDate)}</span>
                  </div>
                </li>
              ))}
              {data.tasks?.filter(t => t.priority === 'High' && t.status !== 'Complete').slice(0, 5).map((t, i) => (
                <li key={`h-${i}`} className="flex items-start gap-2">
                  <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-[10px] font-bold">{(data.tasks?.filter(t2 => t2.priority === 'Critical' && t2.status !== 'Complete').length || 0) + i + 1}</span>
                  <div>
                    <span className="font-semibold">{t.task}</span>
                    <span className="text-gray-500"> - {t.assignedTo} - Due: {formatDate(t.dueDate)}</span>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Recommendations */}
          <h3 className="text-base font-bold text-[#0D2338] mb-3">RECOMMENDATIONS</h3>
          <div className="bg-green-50 border border-green-200 rounded p-4 mb-6">
            <ul className="text-xs text-gray-800 space-y-2">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></span>
                <span>Continue weekly governance workshops to maintain decision velocity and accountability</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></span>
                <span>Prioritise Training Plan activities for engineers with project eligibility gaps (RED items in Skills Matrix)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></span>
                <span>Escalate all blocked tasks to SteerCo for resolution - blocked items delay downstream delivery</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></span>
                <span>Complete remaining site audits before October half-term to inform roadmap decisions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></span>
                <span>Present Technology Roadmap v1 to board by end of September for budget planning</span>
              </li>
            </ul>
          </div>

          {/* Next Steps */}
          <h3 className="text-base font-bold text-[#0D2338] mb-3">NEXT STEPS</h3>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-[#1A334F] text-white">
                <th className="p-2 text-left">Action</th>
                <th className="p-2 text-left">Owner</th>
                <th className="p-2 text-left">Timeline</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b"><td className="p-2">Resolve all blocked tasks - escalate access/dependency issues</td><td className="p-2">vCTO</td><td className="p-2">Immediate</td></tr>
              <tr className="border-b bg-gray-50"><td className="p-2">Complete critical RAID mitigations for open items</td><td className="p-2">vCTO + Team</td><td className="p-2">Within 7 days</td></tr>
              <tr className="border-b"><td className="p-2">Progress site audit programme - next 3 schools</td><td className="p-2">vCTO</td><td className="p-2">Next 2 weeks</td></tr>
              <tr className="border-b bg-gray-50"><td className="p-2">Begin Training Plan activities for identified gaps</td><td className="p-2">Engineers</td><td className="p-2">This month</td></tr>
              <tr className="border-b"><td className="p-2">Prepare board update with portfolio and RAID summary</td><td className="p-2">vCTO</td><td className="p-2">Before next SteerCo</td></tr>
            </tbody>
          </table>
        </div>

        {/* === FOOTER PAGE === */}
        <div className="report-page p-12 bg-[#0D2338] min-h-[200px] flex flex-col justify-center items-center text-center">
          <img src={import.meta.env.BASE_URL + 'assets/logo-white.png'} alt="Unleashed Solutions" className="h-12 mb-6" />
          <p className="text-white text-sm font-semibold">Unleashed Solutions Ltd</p>
          <p className="text-[#5A7A95] text-xs mt-2">Managed IT & Cyber Security Services</p>
          <p className="text-[#5A7A95] text-xs mt-1">This report was generated on {today}</p>
          <p className="text-[#5A7A95] text-xs mt-4">CONFIDENTIAL - For internal use only</p>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function ReportHeader({ title, chapter }) {
  return (
    <div className="mb-6 pb-4 border-b-2 border-[#0EA5E9]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[#0EA5E9] text-xs font-semibold uppercase tracking-wider">Chapter {chapter}</p>
          <h2 className="text-2xl font-bold text-[#0D2338]">{title}</h2>
        </div>
        <img src={import.meta.env.BASE_URL + 'assets/mark.png'} alt="" className="h-8 opacity-50" />
      </div>
    </div>
  );
}

function KPICard({ label, value, sub, color }) {
  const colors = {
    red: 'bg-red-50 border-red-200 text-red-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
  };
  return (
    <div className={`border rounded p-3 text-center ${colors[color]}`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs font-semibold mt-1">{label}</div>
      <div className="text-[10px] mt-0.5 opacity-75">{sub}</div>
    </div>
  );
}

function StatusBadge({ status, label }) {
  const colors = { Red: 'bg-red-100 text-red-700', Amber: 'bg-amber-100 text-amber-700', Green: 'bg-green-100 text-green-700', Grey: 'bg-gray-100 text-gray-600' };
  return <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold ${colors[status] || colors.Grey}`}>{label || status}</span>;
}

function SeverityBadge({ severity }) {
  const colors = { Critical: 'bg-red-100 text-red-700', High: 'bg-orange-100 text-orange-700', Medium: 'bg-amber-100 text-amber-700', Low: 'bg-green-100 text-green-700' };
  return <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold ${colors[severity] || 'bg-gray-100 text-gray-600'}`}>{severity}</span>;
}

function PctBadge({ pct }) {
  const color = pct >= 100 ? 'bg-green-100 text-green-700' : pct >= 80 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700';
  return <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${color}`}>{pct}%</span>;
}

function formatDate(d) {
  if (!d) return '-';
  const date = d instanceof Date ? d : new Date(d);
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });
}
