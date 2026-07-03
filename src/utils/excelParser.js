import * as XLSX from 'xlsx';

// Parse the Master Tracker workbook (13 tabs)
export function parseMasterTracker(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'array', cellDates: true });
        const data = {};

        // RAID tab - headers row 1, data row 2+
        const raidSheet = wb.Sheets['RAID'];
        if (raidSheet) {
          const raw = XLSX.utils.sheet_to_json(raidSheet, { header: ['id','type','title','description','owner','impact','status','mitigation','dateRaised','targetDate','closedDate'], range: 1 });
          data.raid = raw.filter(r => r.id);
        }

        // Tasks tab - headers row 1, data row 2+
        const tasksSheet = wb.Sheets['Tasks'];
        if (tasksSheet) {
          const raw = XLSX.utils.sheet_to_json(tasksSheet, { header: ['id','task','category','assignedTo','startDate','dueDate','status','priority','percentComplete','notes'], range: 1 });
          data.tasks = raw.filter(r => r.id);
        }

        // Portfolio tab - title row 1, months row 2, headers row 3, data row 4+
        const portSheet = wb.Sheets['Portfolio'];
        if (portSheet) {
          const raw = XLSX.utils.sheet_to_json(portSheet, { header: ['num','project','workstream','priority','start','end','status'], range: 3 });
          data.portfolio = raw.filter(r => r.project);
        }

        // Time Log - headers row 1, data row 2+
        const timeSheet = wb.Sheets['Time Log'];
        if (timeSheet) {
          const raw = XLSX.utils.sheet_to_json(timeSheet, { header: ['date','hours','dayFraction','type','description','site','deliverable'], range: 1 });
          data.timeLog = raw.filter(r => r.date);
        }

        // Workshops - headers row 1, data row 2+
        const wsSheet = wb.Sheets['Workshops'];
        if (wsSheet) {
          const raw = XLSX.utils.sheet_to_json(wsSheet, { header: ['date','number','attendees','agenda','keyDecisions','actions','owner','dueDate','status'], range: 1 });
          data.workshops = raw.filter(r => r.date);
        }

        // Decisions - headers row 1, data row 2+
        const decSheet = wb.Sheets['Decisions'];
        if (decSheet) {
          const raw = XLSX.utils.sheet_to_json(decSheet, { header: ['date','id','decision','rationale','madeBy','impact','reversible','status'], range: 1 });
          data.decisions = raw.filter(r => r.id);
        }

        // Monthly Report - title row 1, blank row 2, headers row 3, data row 4+
        const monthSheet = wb.Sheets['Monthly Report'];
        if (monthSheet) {
          const raw = XLSX.utils.sheet_to_json(monthSheet, { header: ['month','daysUsed','achievements','risks','priorities','rag'], range: 3 });
          data.monthlyReport = raw.filter(r => r.month);
        }

        // Skills Assessment - Support (title row 1, rules row 2, headers row 3, data row 4+)
        const assSupportSheet = wb.Sheets['Assess - Support'];
        if (assSupportSheet) {
          data.skillsSupport = parseSkillsAssessment(assSupportSheet);
        }

        // Skills Assessment - Projects
        const assProjectsSheet = wb.Sheets['Assess - Projects'];
        if (assProjectsSheet) {
          data.skillsProjects = parseSkillsAssessment(assProjectsSheet);
        }

        // Training Plan - title row 1, blank row 2, headers row 3, data row 4+
        const trainSheet = wb.Sheets['Training Plan'];
        if (trainSheet) {
          const raw = XLSX.utils.sheet_to_json(trainSheet, { header: ['engineer','currentLevel','targetLevel','gapArea','activity','targetDate','status'], range: 3 });
          data.trainingPlan = raw.filter(r => r.engineer);
        }

        resolve(data);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

// Parse skills assessment sheet into structured data
function parseSkillsAssessment(sheet) {
  const raw = XLSX.utils.sheet_to_json(sheet, { header: 1, range: 2 }); // start after rules row
  if (!raw.length) return { engineers: [], specialisms: [] };
  
  // First row is headers: Specialism, Lvl, Skill, Eng1, Eng2, ...
  const headers = raw[0];
  const engineers = headers.slice(3).filter(h => h && h.trim());
  
  const specialisms = [];
  let currentSpec = '';
  
  for (let i = 1; i < raw.length; i++) {
    const row = raw[i];
    if (!row || !row[2]) continue; // skip empty rows
    
    if (row[0]) currentSpec = row[0];
    const level = row[1] || '';
    const skill = row[2] || '';
    
    const ratings = {};
    engineers.forEach((eng, j) => {
      ratings[eng] = row[3 + j] || '';
    });
    
    specialisms.push({ specialism: currentSpec, level, skill, ratings });
  }
  
  return { engineers, specialisms };
}

// Parse the Estate Audit & Roadmap workbook (32 tabs)
export function parseEstateAudit(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'array', cellDates: true });
        const data = { schools: [], dashboard: null };

        wb.SheetNames.forEach(name => {
          if (name === 'Roadmap Dashboard') {
            // Parse the dashboard heatmap
            const sheet = wb.Sheets[name];
            data.dashboard = XLSX.utils.sheet_to_json(sheet, { header: 1 });
          } else {
            // Each school tab
            const sheet = wb.Sheets[name];
            const raw = XLSX.utils.sheet_to_json(sheet, { header: 1 });
            data.schools.push({ name, data: raw });
          }
        });

        resolve(data);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

// Compute analytics from master tracker data
export function computeAnalytics(data) {
  const analytics = {};

  // Time analytics
  if (data.timeLog) {
    const totalDays = data.timeLog.reduce((sum, r) => sum + (parseFloat(r.dayFraction) || 0), 0);
    const totalHours = data.timeLog.reduce((sum, r) => sum + (parseFloat(r.hours) || 0), 0);
    const byType = {};
    const bySite = {};
    const byDeliverable = {};
    data.timeLog.forEach(r => {
      byType[r.type] = (byType[r.type] || 0) + (parseFloat(r.dayFraction) || 0);
      bySite[r.site] = (bySite[r.site] || 0) + (parseFloat(r.dayFraction) || 0);
      byDeliverable[r.deliverable] = (byDeliverable[r.deliverable] || 0) + (parseFloat(r.dayFraction) || 0);
    });
    analytics.time = { totalDays, totalHours, remaining: 48 - totalDays, utilisation: Math.round((totalDays / 48) * 100), byType, bySite, byDeliverable, entryCount: data.timeLog.length };
  }

  // RAID analytics
  if (data.raid) {
    const open = data.raid.filter(r => r.status === 'Open');
    const mitigating = data.raid.filter(r => r.status === 'Mitigating');
    const closed = data.raid.filter(r => r.status === 'Closed' || r.status === 'Accepted');
    const critical = open.filter(r => r.impact === 'Critical');
    const high = open.filter(r => r.impact === 'High');
    const byType = {};
    data.raid.forEach(r => { byType[r.type] = (byType[r.type] || 0) + 1; });
    analytics.raid = { total: data.raid.length, open: open.length, mitigating: mitigating.length, closed: closed.length, critical, high, byType, openItems: open };
  }

  // Task analytics
  if (data.tasks) {
    const byStatus = {};
    const byPerson = {};
    const byCategory = {};
    const overdue = [];
    const now = new Date();
    data.tasks.forEach(r => {
      byStatus[r.status] = (byStatus[r.status] || 0) + 1;
      if (r.assignedTo) byPerson[r.assignedTo] = (byPerson[r.assignedTo] || []).concat(r);
      if (r.category) byCategory[r.category] = (byCategory[r.category] || 0) + 1;
      if (r.dueDate && new Date(r.dueDate) < now && r.status !== 'Complete') overdue.push(r);
    });
    analytics.tasks = { total: data.tasks.length, byStatus, byPerson, byCategory, overdue, blocked: data.tasks.filter(r => r.status === 'Blocked') };
  }

  // Portfolio analytics
  if (data.portfolio) {
    const byStatus = {};
    const byWorkstream = {};
    data.portfolio.forEach(r => {
      byStatus[r.status] = (byStatus[r.status] || 0) + 1;
      if (r.workstream) byWorkstream[r.workstream] = (byWorkstream[r.workstream] || []).concat(r);
    });
    const atRisk = data.portfolio.filter(r => r.status === 'At Risk');
    analytics.portfolio = { total: data.portfolio.length, byStatus, byWorkstream, atRisk };
  }

  // Skills analytics
  if (data.skillsSupport || data.skillsProjects) {
    const support = data.skillsSupport || { engineers: [], specialisms: [] };
    const projects = data.skillsProjects || { engineers: [], specialisms: [] };
    const engineers = [...new Set([...support.engineers, ...projects.engineers])];
    
    const engineerProfiles = {};
    engineers.forEach(eng => {
      const profile = { support: { L1: { y: 0, n: 0, ip: 0 }, L2: { y: 0, n: 0, ip: 0 }, L3: { y: 0, n: 0, ip: 0 } }, projects: {} };
      
      support.specialisms.forEach(s => {
        const val = (s.ratings[eng] || '').toUpperCase();
        const lvl = s.level;
        if (profile.support[lvl]) {
          if (val === 'Y') profile.support[lvl].y++;
          else if (val === 'N') profile.support[lvl].n++;
          else if (val === 'IP') profile.support[lvl].ip++;
        }
      });
      
      projects.specialisms.forEach(s => {
        const val = (s.ratings[eng] || '').toUpperCase();
        if (!profile.projects[s.specialism]) profile.projects[s.specialism] = { y: 0, n: 0, ip: 0 };
        if (val === 'Y') profile.projects[s.specialism].y++;
        else if (val === 'N') profile.projects[s.specialism].n++;
        else if (val === 'IP') profile.projects[s.specialism].ip++;
      });
      
      engineerProfiles[eng] = profile;
    });
    
    analytics.skills = { engineers, engineerProfiles };
  }

  // Governance analytics
  if (data.workshops) {
    analytics.governance = {
      workshopCount: data.workshops.length,
      decisions: data.decisions ? data.decisions.length : 0,
      activeDecisions: data.decisions ? data.decisions.filter(d => d.status === 'Active').length : 0,
    };
  }

  // Training analytics
  if (data.trainingPlan) {
    const byStatus = {};
    const byEngineer = {};
    data.trainingPlan.forEach(t => {
      byStatus[t.status] = (byStatus[t.status] || 0) + 1;
      if (t.engineer) byEngineer[t.engineer] = (byEngineer[t.engineer] || []).concat(t);
    });
    analytics.training = { total: data.trainingPlan.length, byStatus, byEngineer };
  }

  return analytics;
}
