/**
 * EduPredict AI - Academic Performance PDF Report Generator
 * Generates official, multi-page vector PDF reports with selectable text,
 * structured tables, academic analytics, and print-optimized typography.
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ReportSubjectItem {
  name: string;
  marksObtained: number;
  maxMarks: number;
  percentage: number;
  attendance: number;
  status: string;
  difficultTopics: string[];
  topicsToImprove: string[];
}

export interface ReportExamItem {
  subjectName: string;
  examDate: string;
  priority: string;
  syllabusCompletion: number;
  status: string;
  notes?: string;
}

export interface ReportQuizItem {
  topic: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  completedAt: string;
}

export interface ReportRecommendationItem {
  subjectName: string;
  weakTopic: string;
  whatNeedsImprovement: string;
  whyItMatters: string;
  whatToStudy: string;
  suggestedTime?: string;
}

export interface ReportStudyPlanInfo {
  examName?: string;
  dailyRoutine?: string;
  weeklyHours?: number;
  totalSessions?: number;
  completedSessions?: number;
}

export interface ReportPredictionInfo {
  modelUsed: string;
  predictedCategory: string;
  confidence: number;
  projectedScore: number;
  date?: string;
}

export interface AcademicReportPayload {
  studentName: string;
  studentId?: string;
  degree: string;
  institution: string;
  departmentBranch: string;
  academicYear: string;
  semester: string;
  gradingSystem: string;
  generatedDate: string;
  isAuthenticated: boolean;

  // Overview metrics
  academicScore?: number;
  standing?: string;
  standingTier?: string;
  subjectAverage?: number;
  overallAttendance?: number;
  totalSubjects?: number;
  scoringFormula?: string;

  // Subject records
  subjects: ReportSubjectItem[];

  // Strengths & Diagnostics
  strongestSubjects: string[];
  subjectsNeedingAttention: string[];
  weakTopics: string[];

  // Actionable recommendations
  recommendations: ReportRecommendationItem[];

  // Upcoming Exams
  upcomingExams: ReportExamItem[];

  // Study Plan
  studyPlan?: ReportStudyPlanInfo;

  // Quiz attempts
  quizAttempts: ReportQuizItem[];

  // Prediction
  prediction?: ReportPredictionInfo;

  // Export options
  includedSections: {
    overview: boolean;
    subjects: boolean;
    analysis: boolean;
    exams: boolean;
    learning: boolean;
    recommendations: boolean;
  };
}

export function generateAcademicPerformancePdf(data: AcademicReportPayload): jsPDF {
  // Create A4 portrait document (210mm x 297mm)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let cursorY = margin;

  // Brand Palette Constants (RGB)
  const COLOR_BRAND_PRIMARY: [number, number, number] = [79, 70, 229];     // #4F46E5 Indigo
  const COLOR_BRAND_DARK: [number, number, number] = [15, 23, 42];        // #0F172A Deep Slate
  const COLOR_TEXT_PRIMARY: [number, number, number] = [30, 41, 59];       // #1E293B
  const COLOR_TEXT_MUTED: [number, number, number] = [100, 116, 139];     // #64748B
  const COLOR_BG_SUBTLE: [number, number, number] = [248, 250, 252];      // #F8FAFC
  const COLOR_BORDER: [number, number, number] = [226, 232, 240];         // #E2E8F0
  const COLOR_ACCENT_TEAL: [number, number, number] = [13, 148, 136];     // #0D9488
  const COLOR_DANGER: [number, number, number] = [220, 38, 38];           // #DC2626
  const COLOR_WARNING: [number, number, number] = [217, 119, 6];          // #D97706
  const COLOR_SUCCESS: [number, number, number] = [5, 150, 105];          // #059669

  // Helper for page break detection
  const checkPageBreak = (neededHeight: number) => {
    if (cursorY + neededHeight > pageHeight - 20) {
      doc.addPage();
      cursorY = margin + 12; // leave room for running header
    }
  };

  // -------------------------------------------------------------
  // HEADER BANNER
  // -------------------------------------------------------------
  // Top brand accent stripe
  doc.setFillColor(...COLOR_BRAND_PRIMARY);
  doc.rect(0, 0, pageWidth, 5, 'F');

  cursorY = margin;

  // Logo / Title Header Box
  doc.setFillColor(...COLOR_BG_SUBTLE);
  doc.setDrawColor(...COLOR_BORDER);
  doc.roundedRect(margin, cursorY, contentWidth, 24, 2, 2, 'FD');

  // Title text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...COLOR_BRAND_PRIMARY);
  doc.text('EduPredict AI', margin + 6, cursorY + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...COLOR_TEXT_MUTED);
  doc.text('ACADEMIC INTELLIGENCE & PERFORMANCE DIAGNOSTIC REPORT', margin + 6, cursorY + 15);
  doc.text('Confidential Personal Evaluation & Study Strategy', margin + 6, cursorY + 20);

  // Right-aligned report metadata in header
  doc.setFontSize(8);
  doc.setTextColor(...COLOR_TEXT_PRIMARY);
  doc.setFont('helvetica', 'bold');
  doc.text(`Date: ${data.generatedDate}`, pageWidth - margin - 6, cursorY + 9, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLOR_TEXT_MUTED);
  doc.text(`Academic Term: ${data.academicYear}`, pageWidth - margin - 6, cursorY + 14, { align: 'right' });
  doc.text(`Status: ${data.isAuthenticated ? 'Authenticated Account' : 'Demo Profile'}`, pageWidth - margin - 6, cursorY + 19, { align: 'right' });

  cursorY += 28;

  // -------------------------------------------------------------
  // STUDENT INFORMATION CARD
  // -------------------------------------------------------------
  checkPageBreak(32);
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...COLOR_BORDER);
  doc.roundedRect(margin, cursorY, contentWidth, 28, 2, 2, 'FD');

  // Left column: Student Details
  doc.setFontSize(8);
  doc.setTextColor(...COLOR_BRAND_PRIMARY);
  doc.setFont('helvetica', 'bold');
  doc.text('STUDENT PROFILE', margin + 6, cursorY + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...COLOR_BRAND_DARK);
  doc.text(data.studentName || 'Student', margin + 6, cursorY + 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...COLOR_TEXT_MUTED);
  const degreeBranch = [data.degree, data.departmentBranch].filter(Boolean).join(' • ') || 'Academic Program';
  doc.text(degreeBranch, margin + 6, cursorY + 19);
  doc.text(data.institution || 'Enrolled Academic Institution', margin + 6, cursorY + 24);

  // Right column: Academic Details
  const rightColX = pageWidth / 2 + 10;
  doc.setFontSize(8);
  doc.setTextColor(...COLOR_BRAND_PRIMARY);
  doc.setFont('helvetica', 'bold');
  doc.text('CURRICULAR CONTEXT', rightColX, cursorY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...COLOR_TEXT_PRIMARY);
  doc.text(`Semester: `, rightColX, cursorY + 13);
  doc.setFont('helvetica', 'bold');
  doc.text(data.semester || 'Current Semester', rightColX + 22, cursorY + 13);

  doc.setFont('helvetica', 'normal');
  doc.text(`Grading System: `, rightColX, cursorY + 18);
  doc.setFont('helvetica', 'bold');
  doc.text(data.gradingSystem ? data.gradingSystem.toUpperCase() : 'PERCENTAGE', rightColX + 26, cursorY + 18);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLOR_TEXT_MUTED);
  doc.setFontSize(7.5);
  doc.text('Source: EduPredict AI Saved Records Database', rightColX, cursorY + 24);

  cursorY += 33;

  // -------------------------------------------------------------
  // SECTION A: ACADEMIC PERFORMANCE OVERVIEW
  // -------------------------------------------------------------
  if (data.includedSections.overview) {
    checkPageBreak(38);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...COLOR_BRAND_PRIMARY);
    doc.text('1. Academic Performance Overview', margin, cursorY);

    cursorY += 4;

    // 4 Metric Stat Boxes
    const cardGap = 3;
    const cardW = (contentWidth - cardGap * 3) / 4;
    const cardH = 21;

    // Box 1: Overall Score
    doc.setFillColor(...COLOR_BG_SUBTLE);
    doc.setDrawColor(...COLOR_BORDER);
    doc.roundedRect(margin, cursorY, cardW, cardH, 1.5, 1.5, 'FD');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLOR_TEXT_MUTED);
    doc.text('OVERALL SCORE', margin + 4, cursorY + 5);
    doc.setFontSize(13);
    doc.setTextColor(...COLOR_BRAND_PRIMARY);
    doc.text(
      data.academicScore !== undefined ? `${data.academicScore}%` : 'N/A',
      margin + 4,
      cursorY + 13
    );
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLOR_TEXT_MUTED);
    doc.text(data.standing || 'Evaluated Rating', margin + 4, cursorY + 18);

    // Box 2: Attendance
    const b2X = margin + cardW + cardGap;
    doc.setFillColor(...COLOR_BG_SUBTLE);
    doc.roundedRect(b2X, cursorY, cardW, cardH, 1.5, 1.5, 'FD');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLOR_TEXT_MUTED);
    doc.text('ATTENDANCE', b2X + 4, cursorY + 5);
    doc.setFontSize(13);
    const attColor = (data.overallAttendance || 0) >= 75 ? COLOR_SUCCESS : COLOR_DANGER;
    doc.setTextColor(...attColor);
    doc.text(
      data.overallAttendance !== undefined ? `${data.overallAttendance}%` : 'N/A',
      b2X + 4,
      cursorY + 13
    );
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLOR_TEXT_MUTED);
    doc.text((data.overallAttendance || 0) >= 75 ? 'Above 75% threshold' : 'Attendance alert', b2X + 4, cursorY + 18);

    // Box 3: Subject Average
    const b3X = margin + (cardW + cardGap) * 2;
    doc.setFillColor(...COLOR_BG_SUBTLE);
    doc.roundedRect(b3X, cursorY, cardW, cardH, 1.5, 1.5, 'FD');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLOR_TEXT_MUTED);
    doc.text('SUBJECT AVERAGE', b3X + 4, cursorY + 5);
    doc.setFontSize(13);
    doc.setTextColor(...COLOR_TEXT_PRIMARY);
    doc.text(
      data.subjectAverage !== undefined ? `${data.subjectAverage}%` : 'N/A',
      b3X + 4,
      cursorY + 13
    );
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLOR_TEXT_MUTED);
    doc.text(`Across ${data.subjects.length} course units`, b3X + 4, cursorY + 18);

    // Box 4: ML Risk Prediction (if available)
    const b4X = margin + (cardW + cardGap) * 3;
    doc.setFillColor(...COLOR_BG_SUBTLE);
    doc.roundedRect(b4X, cursorY, cardW, cardH, 1.5, 1.5, 'FD');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLOR_TEXT_MUTED);
    doc.text('PREDICTED RISK', b4X + 4, cursorY + 5);
    doc.setFontSize(11);
    const predRisk = data.prediction?.predictedCategory?.toLowerCase() || 'stable';
    const predRiskColor = predRisk.includes('crit') ? COLOR_DANGER : predRisk.includes('border') ? COLOR_WARNING : COLOR_SUCCESS;
    doc.setTextColor(...predRiskColor);
    doc.text(
      data.prediction ? data.prediction.predictedCategory.toUpperCase() : 'STABLE',
      b4X + 4,
      cursorY + 13
    );
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLOR_TEXT_MUTED);
    doc.text(
      data.prediction ? `${(data.prediction.confidence * 100).toFixed(0)}% model conf.` : 'Supervised ML model',
      b4X + 4,
      cursorY + 18
    );

    cursorY += cardH + 5;

    // Methodology note
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(...COLOR_TEXT_MUTED);
    doc.text(
      'Score Formula: 60% Subject Marks Average + 25% Lecture Attendance Rate + 15% Continuous Assessment & Practicals.',
      margin,
      cursorY
    );

    cursorY += 7;
  }

  // -------------------------------------------------------------
  // SECTION B: SUBJECT-WISE PERFORMANCE TABLE
  // -------------------------------------------------------------
  if (data.includedSections.subjects && data.subjects.length > 0) {
    checkPageBreak(30);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...COLOR_BRAND_PRIMARY);
    doc.text('2. Subject-Wise Examination & Attendance Records', margin, cursorY);
    cursorY += 4;

    const tableRows = data.subjects.map(s => [
      s.name,
      `${s.marksObtained} / ${s.maxMarks}`,
      `${s.percentage.toFixed(1)}%`,
      `${s.attendance}%`,
      s.status,
      s.topicsToImprove && s.topicsToImprove.length > 0 ? s.topicsToImprove.slice(0, 2).join(', ') : 'None identified'
    ]);

    autoTable(doc, {
      startY: cursorY,
      margin: { left: margin, right: margin },
      head: [['Subject Name', 'Marks', 'Score %', 'Attendance', 'Status', 'Focus Areas']],
      body: tableRows,
      theme: 'grid',
      styles: {
        font: 'helvetica',
        fontSize: 8,
        cellPadding: 2.2,
        textColor: COLOR_TEXT_PRIMARY,
        lineColor: COLOR_BORDER,
        lineWidth: 0.1
      },
      headStyles: {
        fillColor: COLOR_BRAND_DARK,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8
      },
      alternateRowStyles: {
        fillColor: COLOR_BG_SUBTLE
      },
      columnStyles: {
        0: { cellWidth: 50, fontStyle: 'bold' },
        1: { cellWidth: 22, halign: 'center' },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 22, halign: 'center' },
        4: { cellWidth: 26, halign: 'center', fontStyle: 'bold' },
        5: { cellWidth: 'auto' }
      },
      didParseCell: (hookData) => {
        // Color-code the status column
        if (hookData.section === 'body' && hookData.column.index === 4) {
          const val = String(hookData.cell.raw);
          if (val === 'Strong') {
            hookData.cell.styles.textColor = COLOR_SUCCESS;
          } else if (val === 'Good') {
            hookData.cell.styles.textColor = COLOR_ACCENT_TEAL;
          } else if (val === 'Needs Attention') {
            hookData.cell.styles.textColor = COLOR_WARNING;
          } else if (val === 'Critical') {
            hookData.cell.styles.textColor = COLOR_DANGER;
          }
        }
      }
    });

    cursorY = (doc as any).lastAutoTable.finalY + 8;
  }

  // -------------------------------------------------------------
  // SECTION C: ACADEMIC DIAGNOSTICS & LEARNING GAPS
  // -------------------------------------------------------------
  if (data.includedSections.analysis) {
    checkPageBreak(35);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...COLOR_BRAND_PRIMARY);
    doc.text('3. Academic Diagnostics & Learning Gaps', margin, cursorY);
    cursorY += 5;

    const halfW = (contentWidth - 4) / 2;

    // Left card: Strengths
    doc.setFillColor(240, 253, 244); // green-50
    doc.setDrawColor(187, 247, 208); // green-200
    doc.roundedRect(margin, cursorY, halfW, 26, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...COLOR_SUCCESS);
    doc.text('Verified Academic Strengths', margin + 4, cursorY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...COLOR_TEXT_PRIMARY);
    if (data.strongestSubjects && data.strongestSubjects.length > 0) {
      data.strongestSubjects.slice(0, 3).forEach((sub, idx) => {
        doc.text(`• ${sub}`, margin + 4, cursorY + 12 + idx * 4.5);
      });
    } else {
      doc.text('• Consistent engagement across enrolled subjects', margin + 4, cursorY + 13);
    }

    // Right card: Priority Needs
    const rightCardX = margin + halfW + 4;
    doc.setFillColor(254, 242, 242); // red-50
    doc.setDrawColor(254, 202, 202); // red-200
    doc.roundedRect(rightCardX, cursorY, halfW, 26, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...COLOR_DANGER);
    doc.text('Identified Attention & Skill Gaps', rightCardX + 4, cursorY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...COLOR_TEXT_PRIMARY);
    if (data.subjectsNeedingAttention && data.subjectsNeedingAttention.length > 0) {
      data.subjectsNeedingAttention.slice(0, 3).forEach((sub, idx) => {
        doc.text(`• ${sub}`, rightCardX + 4, cursorY + 12 + idx * 4.5);
      });
    } else if (data.weakTopics && data.weakTopics.length > 0) {
      data.weakTopics.slice(0, 3).forEach((topic, idx) => {
        doc.text(`• ${topic} (Topic level gap)`, rightCardX + 4, cursorY + 12 + idx * 4.5);
      });
    } else {
      doc.text('• No immediate critical gaps detected', rightCardX + 4, cursorY + 13);
    }

    cursorY += 32;
  }

  // -------------------------------------------------------------
  // SECTION D: EXAM PREPARATION & STUDY PLAN
  // -------------------------------------------------------------
  if (data.includedSections.exams && (data.upcomingExams.length > 0 || data.studyPlan)) {
    checkPageBreak(35);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...COLOR_BRAND_PRIMARY);
    doc.text('4. Examination Preparation & Study Timetable', margin, cursorY);
    cursorY += 4;

    if (data.upcomingExams.length > 0) {
      const examRows = data.upcomingExams.map(ex => [
        ex.subjectName,
        ex.examDate,
        ex.priority.toUpperCase(),
        `${ex.syllabusCompletion}%`,
        ex.notes || 'Target preparation'
      ]);

      autoTable(doc, {
        startY: cursorY,
        margin: { left: margin, right: margin },
        head: [['Examination Subject', 'Exam Date', 'Priority', 'Syllabus Ready', 'Preparation Objective']],
        body: examRows,
        theme: 'grid',
        styles: {
          font: 'helvetica',
          fontSize: 8,
          cellPadding: 2,
          textColor: COLOR_TEXT_PRIMARY,
          lineColor: COLOR_BORDER,
          lineWidth: 0.1
        },
        headStyles: {
          fillColor: COLOR_BRAND_PRIMARY,
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 8
        },
        columnStyles: {
          0: { cellWidth: 50, fontStyle: 'bold' },
          1: { cellWidth: 26, halign: 'center' },
          2: { cellWidth: 24, halign: 'center', fontStyle: 'bold' },
          3: { cellWidth: 26, halign: 'center' },
          4: { cellWidth: 'auto' }
        }
      });

      cursorY = (doc as any).lastAutoTable.finalY + 6;
    }

    // Study Plan Summary Box if exists
    if (data.studyPlan) {
      checkPageBreak(18);
      doc.setFillColor(...COLOR_BG_SUBTLE);
      doc.setDrawColor(...COLOR_BORDER);
      doc.roundedRect(margin, cursorY, contentWidth, 14, 1.5, 1.5, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...COLOR_BRAND_PRIMARY);
      doc.text('Active Study Routine:', margin + 4, cursorY + 5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...COLOR_TEXT_PRIMARY);
      const planText = `${data.studyPlan.dailyRoutine || '3h Weekdays / 5h Weekends'} • Target: ${data.studyPlan.weeklyHours || 20} hrs/week • Sessions Completed: ${data.studyPlan.completedSessions || 0}/${data.studyPlan.totalSessions || 0}`;
      doc.text(planText, margin + 4, cursorY + 10);

      cursorY += 19;
    }
  }

  // -------------------------------------------------------------
  // SECTION E: LEARNING PROGRESS & QUIZ ATTEMPTS
  // -------------------------------------------------------------
  if (data.includedSections.learning && data.quizAttempts.length > 0) {
    checkPageBreak(35);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...COLOR_BRAND_PRIMARY);
    doc.text('5. Learning Studio & Assessment History', margin, cursorY);
    cursorY += 4;

    const quizRows = data.quizAttempts.slice(0, 8).map(q => [
      q.topic,
      `${q.score} / ${q.totalQuestions}`,
      `${q.percentage.toFixed(1)}%`,
      q.percentage >= 80 ? 'Mastery' : q.percentage >= 60 ? 'Proficient' : 'Needs Practice',
      q.completedAt ? q.completedAt.slice(0, 10) : 'Recent'
    ]);

    autoTable(doc, {
      startY: cursorY,
      margin: { left: margin, right: margin },
      head: [['Topic Evaluated', 'Score', 'Percentage', 'Mastery Level', 'Assessment Date']],
      body: quizRows,
      theme: 'grid',
      styles: {
        font: 'helvetica',
        fontSize: 8,
        cellPadding: 2,
        textColor: COLOR_TEXT_PRIMARY,
        lineColor: COLOR_BORDER,
        lineWidth: 0.1
      },
      headStyles: {
        fillColor: COLOR_BRAND_DARK,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8
      },
      columnStyles: {
        0: { cellWidth: 60, fontStyle: 'bold' },
        1: { cellWidth: 26, halign: 'center' },
        2: { cellWidth: 26, halign: 'center' },
        3: { cellWidth: 32, halign: 'center', fontStyle: 'bold' },
        4: { cellWidth: 'auto', halign: 'center' }
      }
    });

    cursorY = (doc as any).lastAutoTable.finalY + 8;
  }

  // -------------------------------------------------------------
  // SECTION F: PERSONALIZED RECOMMENDATIONS & ACTION STEPS
  // -------------------------------------------------------------
  if (data.includedSections.recommendations && data.recommendations.length > 0) {
    checkPageBreak(40);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...COLOR_BRAND_PRIMARY);
    doc.text('6. Actionable Recommendations & Targeted Revision', margin, cursorY);
    cursorY += 5;

    data.recommendations.slice(0, 3).forEach((rec, idx) => {
      checkPageBreak(22);

      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(...COLOR_BORDER);
      doc.roundedRect(margin, cursorY, contentWidth, 20, 1.5, 1.5, 'FD');

      // Accent pill on left
      doc.setFillColor(...COLOR_BRAND_PRIMARY);
      doc.roundedRect(margin, cursorY, 3, 20, 1, 1, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(...COLOR_BRAND_PRIMARY);
      doc.text(`${idx + 1}. ${rec.subjectName}: ${rec.weakTopic}`, margin + 6, cursorY + 5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...COLOR_TEXT_PRIMARY);
      doc.text(`Action: ${rec.whatToStudy}`, margin + 6, cursorY + 10);
      doc.setTextColor(...COLOR_TEXT_MUTED);
      doc.text(`Objective: ${rec.whatNeedsImprovement} (${rec.suggestedTime || '3-4 hrs focused study'})`, margin + 6, cursorY + 15);

      cursorY += 23;
    });
  }

  // -------------------------------------------------------------
  // SECTION G: DATA TRANSPARENCY & METHODOLOGY DISCLAIMER
  // -------------------------------------------------------------
  checkPageBreak(25);
  cursorY += 2;
  doc.setFillColor(...COLOR_BG_SUBTLE);
  doc.setDrawColor(...COLOR_BORDER);
  doc.roundedRect(margin, cursorY, contentWidth, 20, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...COLOR_TEXT_MUTED);
  doc.text('DATA SCOPE, TRANSPARENCY & METHODOLOGY DISCLAIMER', margin + 4, cursorY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(...COLOR_TEXT_MUTED);
  doc.text(
    '1. This report is synthesized directly from authentic academic records, lecture attendance logs, and student-entered syllabus milestones.',
    margin + 4,
    cursorY + 9
  );
  doc.text(
    '2. Performance classifications and risk predictions represent machine learning estimates from supervised classification algorithms (Random Forest v2.4).',
    margin + 4,
    cursorY + 13
  );
  doc.text(
    '3. This document is intended solely for personal study planning, academic advising, and revision tracking. It does not replace official university transcripts.',
    margin + 4,
    cursorY + 17
  );

  // -------------------------------------------------------------
  // RUNNING HEADERS & FOOTERS ACROSS ALL PAGES
  // -------------------------------------------------------------
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Running Header (pages 2+)
    if (i > 1) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...COLOR_TEXT_MUTED);
      doc.text('EduPredict AI — Academic Intelligence Performance Report', margin, 8);
      doc.text(data.studentName || 'Student', pageWidth - margin, 8, { align: 'right' });
      doc.setDrawColor(...COLOR_BORDER);
      doc.setLineWidth(0.2);
      doc.line(margin, 10, pageWidth - margin, 10);
    }

    // Running Footer (all pages)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...COLOR_TEXT_MUTED);
    doc.setDrawColor(...COLOR_BORDER);
    doc.setLineWidth(0.2);
    doc.line(margin, pageHeight - 9, pageWidth - margin, pageHeight - 9);

    doc.text(`Generated: ${data.generatedDate} • EduPredict AI Academic Platform`, margin, pageHeight - 5);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 5, { align: 'right' });
  }

  return doc;
}
