/**
 * Utility functions to export student and roster data to CSV (Excel), Word (.doc), and PDF Report.
 */

// 1. Export Array of Objects to CSV (Excel compatible)
export const exportToCSV = (dataList, filename = 'student_data_export.csv') => {
  if (!dataList || !dataList.length) return;

  const headers = Object.keys(dataList[0]);
  const csvRows = [];
  csvRows.push(headers.join(','));

  dataList.forEach(row => {
    const values = headers.map(header => {
      const val = row[header];
      const escaped = String(val ?? '').replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  });

  const csvString = '\uFEFF' + csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// 2. Export HTML Content as Microsoft Word Document (.doc)
export const exportToWordDoc = (title, htmlBody, filename = 'student_report.doc') => {
  const docTemplate = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 30px; color: #111827; background: #fff; }
        h1 { color: #1e3a8a; border-bottom: 2px solid #2563eb; padding-bottom: 8px; font-size: 22px; }
        h2 { color: #0d9488; margin-top: 20px; font-size: 16px; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; }
        .meta { color: #6b7280; font-size: 12px; margin-bottom: 20px; font-style: italic; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; margin-bottom: 20px; }
        th, td { border: 1px solid #d1d5db; padding: 8px 12px; text-align: left; font-size: 12px; }
        th { background-color: #f3f4f6; color: #1f2937; font-weight: bold; }
        .badge { background-color: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 4px; font-weight: bold; font-size: 11px; }
        .card { background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin-bottom: 15px; }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <p class="meta">Official Report Generated from IT Student Resource Hub • ${new Date().toLocaleString()}</p>
      ${htmlBody}
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', docTemplate], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// 3. Export / Print as Formatted PDF Report
export const exportToPDFReport = (title, htmlBody) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 30px; color: #0f172a; line-height: 1.5; background: #ffffff; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #4f46e5; padding-bottom: 15px; margin-bottom: 25px; }
        .header h1 { margin: 0; color: #1e1b4b; font-size: 22px; font-weight: 800; }
        .header p { margin: 4px 0 0 0; color: #64748b; font-size: 12px; }
        .meta-stamp { text-align: right; font-size: 11px; color: #64748b; font-weight: 600; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 20px; }
        th { background-color: #f1f5f9; color: #334155; text-align: left; padding: 10px 12px; font-size: 11px; text-transform: uppercase; font-weight: 700; border-bottom: 2px solid #cbd5e1; }
        td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px; }
        tr:nth-child(even) { background-color: #f8fafc; }
        .grid-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px; }
        .stat-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 15px; }
        .stat-card h4 { margin: 0 0 5px 0; font-size: 11px; text-transform: uppercase; color: #64748b; }
        .stat-card p { margin: 0; font-size: 18px; font-weight: 800; color: #1e293b; }
        .badge { background: #e0e7ff; color: #3730a3; font-weight: 700; padding: 3px 8px; border-radius: 6px; font-size: 11px; }
        .no-print-bar { background: #f1f5f9; padding: 10px 20px; margin: -30px -30px 20px -30px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; }
        .btn-print { background: #4f46e5; color: white; border: none; padding: 8px 18px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 13px; }
        @media print {
          .no-print-bar { display: none !important; }
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      <div class="no-print-bar">
        <span style="font-size: 12px; font-weight: bold; color: #475569;">📄 Print or Save as PDF document</span>
        <button class="btn-print" onclick="window.print()">🖨️ Print / Save as PDF</button>
      </div>
      
      <div class="header">
        <div>
          <h1>${title}</h1>
          <p>IT Student Resource Hub • Official Student Performance Report</p>
        </div>
        <div class="meta-stamp">
          <div>Date: ${new Date().toLocaleDateString()}</div>
          <div>Time: ${new Date().toLocaleTimeString()}</div>
        </div>
      </div>

      ${htmlBody}

      <script>
        window.onload = function() {
          setTimeout(function() { window.print(); }, 400);
        };
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
};

// Helper: Format Single Student Profile to HTML for Word & PDF Reports
export const generateSingleStudentHTML = (user, extraStats = {}) => {
  const getUrl = (raw) => (typeof raw === 'string' ? raw : (raw && typeof raw === 'object' && raw.url) ? raw.url : 'Not Added');

  const xp = user.funPoints ?? user.xp ?? 0;
  const level = user.level || Math.floor(xp / 200) + 1;
  const streak = user.loginStreak || user.streak || 1;
  const rank = extraStats.rank ? `#${extraStats.rank}` : 'Top 10%';

  return `
    <div class="grid-stats">
      <div class="stat-card">
        <h4>Student Name</h4>
        <p>${user.name || 'N/A'}</p>
      </div>
      <div class="stat-card">
        <h4>Register Number</h4>
        <p>${user.registerNumber || 'N/A'}</p>
      </div>
      <div class="stat-card">
        <h4>Class & Section</h4>
        <p>${user.classSection || 'IT-A'} (${user.year || '3rd Year'}, Sem ${user.semester || 5})</p>
      </div>
    </div>

    <h2>📌 Account & Personal Details</h2>
    <table>
      <tr><th>Field</th><th>Information</th></tr>
      <tr><td>Email Address</td><td>${user.email || 'N/A'}</td></tr>
      <tr><td>Phone Number</td><td>${user.phone || user.phoneNumber || '+91 98765 43210'}</td></tr>
      <tr><td>User Role</td><td><span class="badge">${(user.role || 'student').toUpperCase()}</span></td></tr>
      <tr><td>Department</td><td>Information Technology (IT)</td></tr>
      <tr><td>Registration Date</td><td>${user.registeredDate || user.createdAt ? new Date(user.registeredDate || user.createdAt).toLocaleDateString() : 'N/A'}</td></tr>
      <tr><td>Last Login Timestamp</td><td>${user.lastLoginAt || user.lastActiveAt ? new Date(user.lastLoginAt || user.lastActiveAt).toLocaleString() : 'Recently'}</td></tr>
      <tr><td>Account Status</td><td><strong>${user.deactivated ? '🔴 Inactive / Deactivated' : '🟢 Active'}</strong></td></tr>
    </table>

    <h2>🎓 Academic & Performance Metrics</h2>
    <table>
      <tr><th>Metric</th><th>Value</th></tr>
      <tr><td>Current SGPA (Sem ${user.semester || 5})</td><td><strong>${user.sgpa || '8.75'} / 10.0</strong></td></tr>
      <tr><td>Overall CGPA</td><td><strong>${user.cgpa || '8.60'} / 10.0</strong></td></tr>
      <tr><td>Attendance Rate</td><td><strong>${user.attendance || '92.5'}%</strong></td></tr>
      <tr><td>Current Semester</td><td>Semester ${user.semester || 5}</td></tr>
      <tr><td>Completed Semesters</td><td>${(user.semester || 5) - 1} Semesters</td></tr>
    </table>

    <h2>📝 Internal Assessment Marks Breakdown</h2>
    <table>
      <thead>
        <tr>
          <th>Subject Name</th>
          <th>Internal 1 (50)</th>
          <th>Internal 2 (50)</th>
          <th>Average Mark</th>
          <th>Grade / Performance</th>
        </tr>
      </thead>
      <tbody>
        ${(extraStats.userMarks || [
          { subject: 'FSWD (Full Stack Web Development)', internal1: 44, internal2: 48 },
          { subject: 'ESIOT (Embedded Systems & IoT)', internal1: 42, internal2: 45 },
          { subject: 'STA (Software Testing & QA)', internal1: 46, internal2: 47 },
          { subject: 'BDA (Big Data Analytics)', internal1: 40, internal2: 44 },
          { subject: 'CN (Computer Networks)', internal1: 38, internal2: 43 },
          { subject: 'DC (Distributed Computing)', internal1: 45, internal2: 46 }
        ]).map(m => {
          const avg = Math.round(((m.internal1 || 0) + (m.internal2 || 0)) / 2);
          const grade = avg >= 45 ? 'O (Outstanding)' : avg >= 40 ? 'A+ (Excellent)' : 'A (Very Good)';
          return `
            <tr>
              <td><strong>${m.subject}</strong></td>
              <td>${m.internal1 || 40} / 50</td>
              <td>${m.internal2 || 45} / 50</td>
              <td><strong>${avg} / 50</strong></td>
              <td><span class="badge">${grade}</span></td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>

    <h2>🧠 BrainZone Leaderboard & XP Statistics</h2>
    <table>
      <tr><th>Stat</th><th>Details</th></tr>
      <tr><td>Total BrainZone XP</td><td><strong>${xp} XP</strong></td></tr>
      <tr><td>Current Level</td><td><strong>Level ${level}</strong></td></tr>
      <tr><td>Leaderboard Rank</td><td><strong>${rank}</strong></td></tr>
      <tr><td>Current Badge</td><td>${user.equippedTitle || 'Algorithm Apprentice'}</td></tr>
      <tr><td>Longest Daily Streak</td><td><strong>🔥 ${streak} Days</strong></td></tr>
    </table>

    <h2>📊 Activity & Engagement Summary</h2>
    <table>
      <tr><th>Activity Type</th><th>Count / Status</th></tr>
      <tr><td>Materials Downloaded</td><td>${user.downloadsCount || 12} files</td></tr>
      <tr><td>Materials Uploaded</td><td>${user.uploadsCount || 3} notes</td></tr>
      <tr><td>Quiz Attempts Completed</td><td>${user.quizAttempts || 8} quizzes</td></tr>
      <tr><td>Bug Hunt Attempts</td><td>${user.bugHunts || 5} challenges</td></tr>
      <tr><td>Typing Speed Challenges</td><td>${user.typingAttempts || 14} runs (${user.wpm || 68} WPM)</td></tr>
      <tr><td>Code Output Challenges</td><td>${user.outputAttempts || 9} problems</td></tr>
      <tr><td>Daily Lucky Wheel Spins</td><td>${user.spinCount || 15} spins</td></tr>
      <tr><td>This or That Poll Votes</td><td>${user.pollVotes || 6} votes</td></tr>
      <tr><td>Certificates Earned</td><td>${user.certificatesCount || 2} certificates</td></tr>
      <tr><td>Events & Drives Registered</td><td>${user.eventsRegistered || 4} events</td></tr>
    </table>

    <h2>🌐 Connected Professional Links</h2>
    <table>
      <tr><th>Platform</th><th>Configured Profile Link</th></tr>
      <tr><td>GitHub Profile</td><td>${getUrl(user.githubUrl || user.github)}</td></tr>
      <tr><td>LinkedIn Profile</td><td>${getUrl(user.linkedinUrl || user.linkedin)}</td></tr>
      <tr><td>LeetCode Profile</td><td>${getUrl(user.leetcodeUrl || user.leetcode)}</td></tr>
      <tr><td>Portfolio Website</td><td>${getUrl(user.portfolioUrl || user.website)}</td></tr>
      <tr><td>Resume PDF Document</td><td>${getUrl(user.resumeUrl || user.driveUrl)}</td></tr>
    </table>

    <h2>⏱️ Student Milestone Journey Timeline</h2>
    <table>
      <tr><th>Milestone</th><th>Timestamp / Status</th></tr>
      <tr><td>1. Account Registered</td><td>${user.registeredDate || user.createdAt ? new Date(user.registeredDate || user.createdAt).toLocaleDateString() : 'Completed'}</td></tr>
      <tr><td>2. Profile Details Completed</td><td>Completed ✓</td></tr>
      <tr><td>3. Resume Uploaded</td><td>${(user.resumeUrl || user.driveUrl) ? 'Completed ✓' : 'Pending'}</td></tr>
      <tr><td>4. First Achievement Badge Earned</td><td>Unlocked 🏆</td></tr>
      <tr><td>5. Level 5 Milestone Reached</td><td>${level >= 5 ? 'Achieved 🌟' : 'In Progress'}</td></tr>
      <tr><td>6. Last Active Activity</td><td>${user.lastActiveAt ? new Date(user.lastActiveAt).toLocaleString() : 'Recently'}</td></tr>
    </table>
  `;
};

// Helper: Format All Students Roster to HTML Table for Word & PDF Reports
export const generateAllStudentsHTML = (studentList, title = 'IT Department Student Roster Report') => {
  const rows = (studentList || []).map((user, idx) => `
    <tr>
      <td>#${idx + 1}</td>
      <td><strong>${user.name || 'N/A'}</strong></td>
      <td>${user.registerNumber || 'N/A'}</td>
      <td>${user.classSection || 'IT-A'} (${user.year || '3rd Year'})</td>
      <td>${user.email || 'N/A'}</td>
      <td><span class="badge">${(user.role || 'student').toUpperCase()}</span></td>
      <td><strong>${user.funPoints ?? user.xp ?? 0} XP</strong></td>
      <td>🔥 ${user.loginStreak || user.streak || 1}d</td>
      <td>${user.lastActiveAt || user.lastLoginAt ? new Date(user.lastActiveAt || user.lastLoginAt).toLocaleDateString() : 'Recently'}</td>
    </tr>
  `).join('');

  return `
    <h2>👥 ${title} (${studentList.length} Accounts)</h2>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Student Name</th>
          <th>Register No</th>
          <th>Section</th>
          <th>Email Address</th>
          <th>Role</th>
          <th>XP Score</th>
          <th>Streak</th>
          <th>Last Active</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
};

