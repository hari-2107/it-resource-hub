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
export const generateSingleStudentHTML = (user) => {
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
        <p>${user.classSection || 'IT-A'} (${user.year || '3rd Year'})</p>
      </div>
    </div>

    <h2>📌 Account & Activity Overview</h2>
    <table>
      <tr><th>Metric</th><th>Details</th></tr>
      <tr><td>Email Address</td><td>${user.email || 'N/A'}</td></tr>
      <tr><td>User Role</td><td><span class="badge">${user.role || 'student'}</span></td></tr>
      <tr><td>BrainZone XP Score</td><td><strong>${user.funPoints ?? 0} XP</strong></td></tr>
      <tr><td>Current Daily Streak</td><td><strong>🔥 ${user.streak ?? 1} Days</strong></td></tr>
      <tr><td>Total System Logins</td><td>${user.loginCount || 1} Logins</td></tr>
      <tr><td>Last Active Timestamp</td><td>${user.lastActiveAt ? new Date(user.lastActiveAt).toLocaleString() : 'Recently'}</td></tr>
      <tr><td>Account Registered Date</td><td>${user.registeredDate || user.createdAt ? new Date(user.registeredDate || user.createdAt).toLocaleDateString() : 'N/A'}</td></tr>
    </table>

    <h2>🌐 Connected Professional Links</h2>
    <table>
      <tr><th>Platform</th><th>Configured URL</th></tr>
      <tr><td>GitHub Profile</td><td>${user.githubUrl || 'Not configured'}</td></tr>
      <tr><td>LinkedIn Profile</td><td>${user.linkedinUrl || 'Not configured'}</td></tr>
      <tr><td>LeetCode Profile</td><td>${user.leetcodeUrl || 'Not configured'}</td></tr>
      <tr><td>Portfolio Website</td><td>${user.portfolioUrl || 'Not configured'}</td></tr>
    </table>
  `;
};

// Helper: Format All Students Roster to HTML Table for Word & PDF Reports
export const generateAllStudentsHTML = (studentList) => {
  const rows = (studentList || []).map((user, idx) => `
    <tr>
      <td>#${idx + 1}</td>
      <td><strong>${user.name || 'N/A'}</strong></td>
      <td>${user.registerNumber || 'N/A'}</td>
      <td>${user.classSection || 'IT-A'}</td>
      <td>${user.email || 'N/A'}</td>
      <td><span class="badge">${user.role || 'student'}</span></td>
      <td><strong>${user.funPoints ?? 0} XP</strong></td>
      <td>🔥 ${user.streak ?? 1}d</td>
      <td>${user.lastActiveAt ? new Date(user.lastActiveAt).toLocaleString() : 'N/A'}</td>
    </tr>
  `).join('');

  return `
    <h2>👥 Department Student Roster Summary (${studentList.length} Students)</h2>
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
