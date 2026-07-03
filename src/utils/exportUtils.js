import html2pdf from 'html2pdf.js';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel, BorderStyle, ShadingType } from 'docx';
import { saveAs } from 'file-saver';
import { BRAND, COMPANY } from './branding';

// Export HTML report to PDF
export function exportToPDF(element) {
  if (!element) return;
  
  const opt = {
    margin: [10, 10, 10, 10],
    filename: `vCTO-Report-${new Date().toISOString().split('T')[0]}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2, 
      useCORS: true,
      letterRendering: true,
    },
    jsPDF: { 
      unit: 'mm', 
      format: 'a4', 
      orientation: 'portrait' 
    },
    pagebreak: { mode: ['css', 'legacy'], before: '.report-page' }
  };

  html2pdf().set(opt).from(element).save();
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
    heading('Executive Summary'),
    para(`This report provides a comprehensive analysis of the vCTO service delivery for ${COMPANY.client}, covering ${COMPANY.schools} schools across Devon and Cornwall.`),
    new Paragraph({ spacing: { before: 200 } }),
    boldPara('Key Metrics:'),
    bullet(`Days Used: ${analytics.time?.totalDays?.toFixed(1) || 0} of 48 (${analytics.time?.utilisation || 0}% utilisation)`),
    bullet(`Open RAID Items: ${analytics.raid?.open || 0} (${analytics.raid?.critical?.length || 0} critical)`),
    bullet(`Tasks In Progress: ${analytics.tasks?.byStatus?.['In Progress'] || 0} (${analytics.tasks?.overdue?.length || 0} overdue)`),
    bullet(`Projects Active: ${analytics.portfolio?.byStatus?.['In Progress'] || 0} of ${analytics.portfolio?.total || 0}`),
  ];

  if (analytics.raid?.critical?.length > 0) {
    execChildren.push(new Paragraph({ spacing: { before: 200 } }));
    execChildren.push(boldPara('RED FLAGS:'));
    analytics.raid.critical.forEach(r => {
      execChildren.push(bullet(`${r.id}: ${r.title} - ${r.description}`));
    });
  }

  sections.push({
    properties: { page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
    children: execChildren
  });

  // RAID Section
  const raidChildren = [
    heading('RAID Register - Full Analysis'),
    para(`The RAID register contains ${data.raid?.length || 0} items. ${analytics.raid?.open || 0} are currently open, with ${analytics.raid?.critical?.length || 0} at critical severity.`),
    new Paragraph({ spacing: { before: 200 } }),
  ];

  if (data.raid?.length > 0) {
    const raidTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: ['ID', 'Type', 'Title', 'Impact', 'Status'].map(h => 
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 18, font: 'Arial', color: 'FFFFFF' })], alignment: AlignmentType.CENTER })], shading: { type: ShadingType.SOLID, color: '0D2338' } })
          )
        }),
        ...data.raid.filter(r => r.status !== 'Closed').map(r => 
          new TableRow({
            children: [r.id, r.type, r.title, r.impact, r.status].map(v => 
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: String(v || ''), size: 18, font: 'Arial' })] })] })
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
    heading('Task Management & Workload'),
    para(`${data.tasks?.length || 0} tasks tracked. Status breakdown:`),
    bullet(`Not Started: ${analytics.tasks?.byStatus?.['Not Started'] || 0}`),
    bullet(`In Progress: ${analytics.tasks?.byStatus?.['In Progress'] || 0}`),
    bullet(`Complete: ${analytics.tasks?.byStatus?.['Complete'] || 0}`),
    bullet(`Blocked: ${analytics.tasks?.byStatus?.['Blocked'] || 0}`),
  ];

  if (analytics.tasks?.blocked?.length > 0) {
    taskChildren.push(new Paragraph({ spacing: { before: 200 } }));
    taskChildren.push(boldPara('BLOCKED TASKS - Require Escalation:'));
    analytics.tasks.blocked.forEach(t => {
      taskChildren.push(bullet(`${t.id}: ${t.task} (${t.assignedTo}) - ${t.notes}`));
    });
  }

  sections.push({
    properties: { page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
    children: taskChildren
  });

  // Portfolio Section
  const portChildren = [
    heading('Project Portfolio Status'),
    para(`${analytics.portfolio?.total || 0} projects in the portfolio:`),
    bullet(`Not Started: ${analytics.portfolio?.byStatus?.['Not Started'] || 0}`),
    bullet(`In Progress: ${analytics.portfolio?.byStatus?.['In Progress'] || 0}`),
    bullet(`Complete: ${analytics.portfolio?.byStatus?.['Complete'] || 0}`),
    bullet(`At Risk: ${analytics.portfolio?.byStatus?.['At Risk'] || 0}`),
  ];

  sections.push({
    properties: { page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
    children: portChildren
  });

  // Generate and save
  const doc = new Document({ sections });
  Packer.toBlob(doc).then(blob => {
    saveAs(blob, `vCTO-Report-${new Date().toISOString().split('T')[0]}.docx`);
  });
}
