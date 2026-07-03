import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel, ShadingType } from 'docx';
import { saveAs } from 'file-saver';
import { BRAND, COMPANY } from './branding';

// Export HTML report to PDF using browser print
export function exportToPDF(element) {
  if (!element) {
    // Fallback - just trigger print dialog
    window.print();
    return;
  }
  
  // Dynamic import html2pdf to avoid SSR/bundling issues
  import('html2pdf.js').then(({ default: html2pdf }) => {
    const opt = {
      margin: [8, 8, 8, 8],
      filename: `vCTO-Report-${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.95 },
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        letterRendering: true,
        logging: false,
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait' 
      },
      pagebreak: { mode: ['css', 'legacy'], before: '.report-page' }
    };

    html2pdf().set(opt).from(element).save();
  }).catch(() => {
    // Fallback to print dialog if html2pdf fails
    window.print();
  });
}

// Export Master Tracker data to Word document
export function exportToWord(data, analytics) {
  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  
  const sections = [];
  
  // Helper functions
  const heading = (text, level = HeadingLevel.HEADING_1) => new Paragraph({ text, heading: level, spacing: { before: 400, after: 200 } });
  const para = (text) => new Paragraph({ children: [new TextRun({ text, size: 22, font: 'Arial' })], spacing: { after: 120 } });
  const boldPara = (text) => new Paragraph({ children: [new TextRun({ text, bold: true, size: 22, font: 'Arial' })], spacing: { after: 120 } });
  const bullet = (text) => new Paragraph({ children: [new TextRun({ text, size: 20, font: 'Arial' })], bullet: { level: 0 }, spacing: { after: 60 } });
  const spacer = () => new Paragraph({ spacing: { before: 200 } });

  // Cover Page
  sections.push({
    properties: { page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
    children: [
      new Paragraph({ spacing: { before: 4000 } }),
      new Paragraph({ children: [new TextRun({ text: 'MANAGEMENT REPORT', size: 24, font: 'Arial', color: '0EA5E9', bold: true })], spacing: { after: 200 } }),
      new Paragraph({ children: [new TextRun({ text: 'vCTO Service Delivery Report', size: 52, font: 'Arial', bold: true, color: '0D2338' })], spacing: { after: 200 } }),
      new Paragraph({ children: [new TextRun({ text: 'Project Planning, Risk Management & Team Capability', size: 28, font: 'Arial', color: '5A7A95' })], spacing: { after: 800 } }),
      para(`Client: ${COMPANY.client}`),
      para(`Provider: ${COMPANY.name}`),
      para(`Service: ${COMPANY.service}`),
      para(`Report Date: ${today}`),
      para('Classification: CONFIDENTIAL'),
    ]
  });

  // Executive Summary
  const execChildren = [
    heading('1. Executive Summary'),
    para(`This report provides a comprehensive analysis of the vCTO service delivery for ${COMPANY.client}, covering ${COMPANY.schools} schools across Devon and Cornwall.`),
    spacer(),
    boldPara('Key Performance Indicators:'),
    bullet(`Days Used: ${analytics.time?.totalDays?.toFixed(1) || 0} of 48 (${analytics.time?.utilisation || 0}% utilisation)`),
    bullet(`Open RAID Items: ${analytics.raid?.open || 0} (${analytics.raid?.critical?.length || 0} critical)`),
    bullet(`Tasks In Progress: ${analytics.tasks?.byStatus?.['In Progress'] || 0} (${analytics.tasks?.overdue?.length || 0} overdue)`),
    bullet(`Tasks Blocked: ${analytics.tasks?.blocked?.length || 0} requiring escalation`),
    bullet(`Projects Active: ${analytics.portfolio?.byStatus?.['In Progress'] || 0} of ${analytics.portfolio?.total || 0}`),
    bullet(`Workshops Held: ${analytics.governance?.totalWorkshops || 0}`),
    bullet(`Decisions Logged: ${analytics.governance?.totalDecisions || 0}`),
  ];

  if (analytics.raid?.critical?.length > 0) {
    execChildren.push(spacer());
    execChildren.push(boldPara('RED FLAGS - Immediate Attention Required:'));
    analytics.raid.critical.forEach(r => {
      execChildren.push(bullet(`${r.id}: ${r.title} - ${r.description || 'No description'}`));
    });
  }

  if (analytics.tasks?.blocked?.length > 0) {
    execChildren.push(spacer());
    execChildren.push(boldPara('BLOCKED TASKS:'));
    analytics.tasks.blocked.forEach(t => {
      execChildren.push(bullet(`${t.id}: ${t.task} (Owner: ${t.assignedTo || 'Unassigned'}) - ${t.notes || 'No notes'}`));
    });
  }

  sections.push({
    properties: { page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
    children: execChildren
  });

  // Time & Utilisation
  const timeChildren = [
    heading('2. Time & Utilisation'),
    para(`Total days consumed: ${analytics.time?.totalDays?.toFixed(1) || 0} of 48 contracted days (${analytics.time?.utilisation || 0}% utilisation).`),
    spacer(),
    boldPara('Breakdown by Type:'),
  ];
  if (analytics.time?.byType) {
    Object.entries(analytics.time.byType).forEach(([type, days]) => {
      timeChildren.push(bullet(`${type}: ${days.toFixed(1)} days`));
    });
  }
  if (analytics.time?.byDeliverable) {
    timeChildren.push(spacer());
    timeChildren.push(boldPara('Breakdown by Deliverable:'));
    Object.entries(analytics.time.byDeliverable).forEach(([del, days]) => {
      timeChildren.push(bullet(`${del}: ${days.toFixed(1)} days`));
    });
  }

  sections.push({
    properties: { page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
    children: timeChildren
  });

  // RAID Section
  const raidChildren = [
    heading('3. RAID Register'),
    para(`The RAID register contains ${data.raid?.length || 0} items. ${analytics.raid?.open || 0} are currently open, with ${analytics.raid?.critical?.length || 0} at critical severity.`),
    spacer(),
    boldPara('Open Items by Severity:'),
  ];

  if (analytics.raid?.bySeverity) {
    Object.entries(analytics.raid.bySeverity).forEach(([sev, count]) => {
      raidChildren.push(bullet(`${sev}: ${count}`));
    });
  }

  if (data.raid?.length > 0) {
    raidChildren.push(spacer());
    raidChildren.push(boldPara('Open RAID Items:'));
    const raidTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: ['ID', 'Type', 'Title', 'Impact', 'Status'].map(h => 
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 18, font: 'Arial', color: 'FFFFFF' })], alignment: AlignmentType.CENTER })], shading: { type: ShadingType.SOLID, color: '0D2338' } })
          )
        }),
        ...data.raid.filter(r => r.status !== 'Closed').slice(0, 20).map(r => 
          new TableRow({
            children: [r.id || '', r.type || '', r.title || '', r.impact || '', r.status || ''].map(v => 
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: String(v), size: 18, font: 'Arial' })] })] })
            )
          })
        )
      ]
    });
    raidChildren.push(raidTable);
  }

  sections.push({
    properties: { page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
    children: raidChildren
  });

  // Tasks Section
  const taskChildren = [
    heading('4. Task Management & Workload'),
    para(`${data.tasks?.length || 0} tasks tracked across the programme.`),
    spacer(),
    boldPara('Status Breakdown:'),
    bullet(`Not Started: ${analytics.tasks?.byStatus?.['Not Started'] || 0}`),
    bullet(`In Progress: ${analytics.tasks?.byStatus?.['In Progress'] || 0}`),
    bullet(`Complete: ${analytics.tasks?.byStatus?.['Complete'] || 0}`),
    bullet(`Blocked: ${analytics.tasks?.byStatus?.['Blocked'] || 0}`),
  ];

  if (data.tasks?.length > 0) {
    taskChildren.push(spacer());
    taskChildren.push(boldPara('Active Tasks:'));
    const taskTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: ['ID', 'Task', 'Owner', 'Status', 'Priority'].map(h => 
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 18, font: 'Arial', color: 'FFFFFF' })], alignment: AlignmentType.CENTER })], shading: { type: ShadingType.SOLID, color: '0D2338' } })
          )
        }),
        ...data.tasks.filter(t => t.status !== 'Complete').slice(0, 15).map(t => 
          new TableRow({
            children: [t.id || '', t.task || '', t.assignedTo || '', t.status || '', t.priority || ''].map(v => 
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: String(v), size: 18, font: 'Arial' })] })] })
            )
          })
        )
      ]
    });
    taskChildren.push(taskTable);
  }

  sections.push({
    properties: { page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
    children: taskChildren
  });

  // Portfolio Section
  const portChildren = [
    heading('5. Project Portfolio'),
    para(`${analytics.portfolio?.total || 0} projects in the portfolio.`),
    spacer(),
    boldPara('Status Overview:'),
    bullet(`Not Started: ${analytics.portfolio?.byStatus?.['Not Started'] || 0}`),
    bullet(`In Progress: ${analytics.portfolio?.byStatus?.['In Progress'] || 0}`),
    bullet(`Complete: ${analytics.portfolio?.byStatus?.['Complete'] || 0}`),
    bullet(`At Risk: ${analytics.portfolio?.byStatus?.['At Risk'] || 0}`),
  ];

  if (data.portfolio?.length > 0) {
    portChildren.push(spacer());
    portChildren.push(boldPara('Project List:'));
    data.portfolio.forEach(p => {
      portChildren.push(bullet(`${p.project} (${p.workstream || 'General'}) - ${p.status || 'Unknown'}`));
    });
  }

  sections.push({
    properties: { page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
    children: portChildren
  });

  // Governance
  const govChildren = [
    heading('6. Governance & Decisions'),
    para(`${analytics.governance?.totalWorkshops || 0} workshops held with ${analytics.governance?.totalDecisions || 0} formal decisions logged.`),
  ];

  if (data.decisions?.length > 0) {
    govChildren.push(spacer());
    govChildren.push(boldPara('Decision Register:'));
    data.decisions.forEach(d => {
      govChildren.push(bullet(`${d.id}: ${d.decision} (${d.madeBy || 'Unknown'}) - ${d.status || 'Pending'}`));
    });
  }

  sections.push({
    properties: { page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
    children: govChildren
  });

  // Recommendations
  const recChildren = [
    heading('7. Recommendations & Next Steps'),
    spacer(),
    boldPara('Priority Actions:'),
    bullet('1. Address all critical RAID items within the next review cycle'),
    bullet('2. Unblock all blocked tasks - escalate to stakeholders immediately'),
    bullet('3. Review At Risk projects for additional resource or scope change'),
    bullet('4. Update skills assessments for new team members'),
    bullet('5. Schedule next governance workshop within 2 weeks'),
    spacer(),
    boldPara('Observations:'),
    bullet(`Utilisation is at ${analytics.time?.utilisation || 0}% - ${(analytics.time?.utilisation || 0) < 50 ? 'consider increasing engagement pace' : 'on track with contracted days'}`),
    bullet(`${analytics.raid?.critical?.length || 0} critical RAID items need board-level visibility`),
    bullet(`${analytics.tasks?.blocked?.length || 0} blocked tasks are preventing progress`),
    spacer(),
    para('This report was generated by the Unleashed vCTO Reporting Platform.'),
    para(`Report Date: ${today}`),
    para('Classification: CONFIDENTIAL'),
  ];

  sections.push({
    properties: { page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
    children: recChildren
  });

  // Generate and save
  const doc = new Document({ sections });
  Packer.toBlob(doc).then(blob => {
    saveAs(blob, `vCTO-Report-${new Date().toISOString().split('T')[0]}.docx`);
  }).catch(err => {
    console.error('Word export failed:', err);
    alert('Word export failed. Please try again.');
  });
}
