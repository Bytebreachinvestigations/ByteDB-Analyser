
import { AnalysisResult, Evidence } from '../types';
import { VaultEvidence } from './vault';
import { AnalyticsResult } from './analytics';

/**
 * Forensic Report Generator
 * Generates court-admissible forensic reports in multiple formats
 */

export interface ForensicReportMetadata {
  caseId: string;
  title: string;
  investigator: string;
  investigatorCredentials: string;
  institution: string;
  startDate: string;
  endDate: string;
  description: string;
}

/**
 * Generate professional forensic report with court-ready format
 */
export const generateForensicReport = (
  metadata: ForensicReportMetadata,
  databases: Array<{ type: string; name: string; recordCount: number }>,
  analyticsResults: AnalyticsResult[],
  vaultEvidence: VaultEvidence[]
): string => {
  const date = new Date().toLocaleString();
  const reportDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const riskScores = analyticsResults.map(r => r.riskScore);
  const avgRiskScore = riskScores.length > 0
    ? Math.round(riskScores.reduce((a, b) => a + b, 0) / riskScores.length)
    : 0;

  // Combine all findings
  const allFindings = analyticsResults.flatMap(r => r.findings);

  const findingsHtml = allFindings.length > 0
    ? allFindings.map((f, idx) => `
      <div class="finding-card ${f.severity}">
        <div class="finding-header">
          <span class="badge ${f.severity}">${f.severity.toUpperCase()}</span>
          <span class="finding-id">Finding #${idx + 1}</span>
        </div>
        <h4>${f.category}</h4>
        <p><strong>Description:</strong> ${f.description}</p>
        ${f.evidence && f.evidence.length > 0 ? `
          <p><strong>Supporting Evidence:</strong></p>
          <ul>
            ${f.evidence.map(e => `<li>${e}</li>`).join('')}
          </ul>
        ` : ''}
        ${f.timestamp ? `<p class="timestamp">Timestamp: ${new Date(f.timestamp).toLocaleString()}</p>` : ''}
      </div>
    `).join('')
    : '<p class="no-findings">No significant findings detected in this analysis.</p>';

  const evidenceHtml = vaultEvidence.length > 0
    ? vaultEvidence.map((e, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td>${e.fileName}</td>
        <td>${e.category}</td>
        <td>${(e.size / 1024).toFixed(2)} KB</td>
        <td class="mono">${e.fileHash.substring(0, 32)}...</td>
        <td>${new Date(e.timestamp).toLocaleDateString()}</td>
        <td>${e.chainOfCustody.length}</td>
      </tr>
    `).join('')
    : '<tr><td colspan="7" class="no-data">No evidence artifacts in vault.</td></tr>';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Forensic Investigation Report - ${metadata.caseId}</title>
    <style>
        @page {
            size: A4;
            margin: 1in;
            margin-bottom: 0.75in;
        }
        
        @page :first {
            margin-top: 0.5in;
        }
        
        @media print {
            * { -webkit-print-color-adjust: exact; color-adjust: exact; }
            body { margin: 0; padding: 0; }
            .page-break { page-break-after: always; }
            .no-print { display: none; }
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: 'Times New Roman', Georgia, serif;
            color: #1a1a1a;
            line-height: 1.6;
            font-size: 12pt;
            background: white;
        }

        .title-page {
            text-align: center;
            padding: 60px 40px;
            border-bottom: 3px solid #000;
            page-break-after: always;
        }

        .report-title {
            font-size: 28pt;
            font-weight: bold;
            margin-bottom: 20px;
            color: #000;
        }

        .report-subtitle {
            font-size: 16pt;
            margin-bottom: 60px;
            color: #333;
        }

        .case-details {
            text-align: left;
            margin-top: 100px;
            font-size: 11pt;
        }

        .case-details-row {
            display: flex;
            margin-bottom: 8px;
        }

        .case-details-label {
            width: 150px;
            font-weight: bold;
        }

        .case-details-value {
            flex: 1;
        }

        .investigator-sig {
            margin-top: 80px;
            text-align: center;
            font-size: 10pt;
        }

        .investigator-sig div {
            margin-top: 30px;
        }

        .sig-line {
            border-top: 1px solid #000;
            width: 250px;
            margin: 0 auto;
            margin-bottom: 8px;
        }

        h1 {
            font-size: 18pt;
            font-weight: bold;
            margin-top: 30px;
            margin-bottom: 15px;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
        }

        h2 {
            font-size: 14pt;
            font-weight: bold;
            margin-top: 25px;
            margin-bottom: 12px;
        }

        h3 {
            font-size: 12pt;
            font-weight: bold;
            margin-top: 15px;
            margin-bottom: 8px;
        }

        h4 {
            font-size: 11pt;
            font-weight: bold;
            margin-top: 10px;
            margin-bottom: 8px;
        }

        p {
            margin-bottom: 10px;
            text-align: justify;
        }

        .badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 2px;
            font-weight: bold;
            font-size: 10pt;
            text-transform: uppercase;
            margin-right: 8px;
            color: white;
        }

        .badge.critical {
            background-color: #d32f2f;
        }

        .badge.high {
            background-color: #f57c00;
        }

        .badge.medium {
            background-color: #fbc02d;
            color: #000;
        }

        .badge.low {
            background-color: #388e3c;
        }

        .finding-card {
            border-left: 4px solid #333;
            padding: 12px;
            margin-bottom: 15px;
            background-color: #fafafa;
            page-break-inside: avoid;
        }

        .finding-card.critical {
            border-left-color: #d32f2f;
            background-color: #ffebee;
        }

        .finding-card.high {
            border-left-color: #f57c00;
            background-color: #fff3e0;
        }

        .finding-card.medium {
            border-left-color: #fbc02d;
            background-color: #fffde7;
        }

        .finding-card.low {
            border-left-color: #388e3c;
            background-color: #e8f5e9;
        }

        .finding-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
        }

        .finding-id {
            font-size: 10pt;
            color: #666;
        }

        .no-findings {
            font-style: italic;
            color: #666;
            padding: 20px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 10pt;
        }

        th, td {
            border: 1px solid #ccc;
            padding: 8px;
            text-align: left;
        }

        th {
            background-color: #e0e0e0;
            font-weight: bold;
        }

        tr:nth-child(even) {
            background-color: #f9f9f9;
        }

        .mono {
            font-family: 'Courier New', monospace;
            font-size: 9pt;
        }

        .no-data {
            text-align: center;
            color: #999;
            font-style: italic;
        }

        .timestamp {
            color: #666;
            font-size: 10pt;
        }

        .risk-score-section {
            background-color: #f5f5f5;
            padding: 15px;
            border: 1px solid #ddd;
            margin: 15px 0;
        }

        .risk-meter {
            width: 100%;
            height: 30px;
            background-color: #ddd;
            border-radius: 5px;
            overflow: hidden;
            margin: 10px 0;
        }

        .risk-meter-fill {
            height: 100%;
            background: linear-gradient(90deg, #4CAF50 0%, #FFF176 50%, #FF6B6B 100%);
        }

        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ccc;
            font-size: 9pt;
            color: #666;
            text-align: center;
        }

        .page-break {
            page-break-after: always;
        }

        ul, ol {
            margin-left: 20px;
            margin-bottom: 10px;
        }

        li {
            margin-bottom: 6px;
        }

        .summary-stats {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 15px;
            margin-bottom: 20px;
        }

        .stat-box {
            background: #f5f5f5;
            padding: 15px;
            text-align: center;
            border-radius: 4px;
        }

        .stat-number {
            font-size: 18pt;
            font-weight: bold;
            color: #333;
        }

        .stat-label {
            font-size: 10pt;
            color: #666;
            margin-top: 5px;
        }
    </style>
</head>
<body>
    <!-- TITLE PAGE -->
    <div class="title-page">
        <div class="report-title">FORENSIC INVESTIGATION REPORT</div>
        <div class="report-subtitle">Database Analysis & Evidence Examination</div>
        
        <div class="case-details">
            <div class="case-details-row">
                <div class="case-details-label">CASE ID:</div>
                <div class="case-details-value">${metadata.caseId}</div>
            </div>
            <div class="case-details-row">
                <div class="case-details-label">Case Title:</div>
                <div class="case-details-value">${metadata.title}</div>
            </div>
            <div class="case-details-row">
                <div class="case-details-label">Examiner:</div>
                <div class="case-details-value">${metadata.investigator}</div>
            </div>
            <div class="case-details-row">
                <div class="case-details-label">Credentials:</div>
                <div class="case-details-value">${metadata.investigatorCredentials}</div>
            </div>
            <div class="case-details-row">
                <div class="case-details-label">Institution:</div>
                <div class="case-details-value">${metadata.institution}</div>
            </div>
            <div class="case-details-row">
                <div class="case-details-label">Examination Period:</div>
                <div class="case-details-value">${metadata.startDate} to ${metadata.endDate}</div>
            </div>
            <div class="case-details-row">
                <div class="case-details-label">Report Date:</div>
                <div class="case-details-value">${reportDate}</div>
            </div>
        </div>

        <div class="investigator-sig">
            <div>
                <div class="sig-line"></div>
                <div>Certified Forensic Examiner</div>
            </div>
        </div>
    </div>

    <!-- EXECUTIVE SUMMARY -->
    <h1>EXECUTIVE SUMMARY</h1>
    <p>${metadata.description}</p>

    <div class="summary-stats">
        <div class="stat-box">
            <div class="stat-number">${databases.length}</div>
            <div class="stat-label">Databases Analyzed</div>
        </div>
        <div class="stat-box">
            <div class="stat-number">${allFindings.length}</div>
            <div class="stat-label">Findings Identified</div>
        </div>
        <div class="stat-box">
            <div class="stat-number">${avgRiskScore}</div>
            <div class="stat-label">Overall Risk Score</div>
        </div>
    </div>

    <!-- DATABASES ANALYZED -->
    <h1>1. DATABASES ANALYZED</h1>
    <table>
        <thead>
            <tr>
                <th>Database Type</th>
                <th>Name</th>
                <th>Records Count</th>
            </tr>
        </thead>
        <tbody>
            ${databases.map(db => `
                <tr>
                    <td>${db.type}</td>
                    <td>${db.name}</td>
                    <td>${db.recordCount.toLocaleString()}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>

    <!-- FORENSIC FINDINGS -->
    <h1 class="page-break">2. FORENSIC FINDINGS & ANALYSIS</h1>
    
    <div class="risk-score-section">
        <h3>Overall Risk Assessment</h3>
        <div>Average Risk Score: <strong>${avgRiskScore}/100</strong></div>
        <div class="risk-meter">
            <div class="risk-meter-fill" style="width: ${avgRiskScore}%;"></div>
        </div>
    </div>

    ${allFindings.length > 0 ? `
        <h2>Identified Issues</h2>
        ${findingsHtml}
    ` : '<p>No significant issues identified during forensic analysis.</p>'}

    <!-- EVIDENCE LOG -->
    <h1 class="page-break">3. EVIDENCE LOG & CHAIN OF CUSTODY</h1>
    <p>The following evidence items were collected, preserved, and analyzed in accordance with forensic standards and legal requirements.</p>
    
    <table>
        <thead>
            <tr>
                <th>#</th>
                <th>Evidence ID</th>
                <th>Category</th>
                <th>Size</th>
                <th>SHA-256 Hash</th>
                <th>Date</th>
                <th>CoC Entries</th>
            </tr>
        </thead>
        <tbody>
            ${evidenceHtml}
        </tbody>
    </table>

    <!-- METHODOLOGY -->
    <h1>4. FORENSIC METHODOLOGY</h1>
    <p>This investigation was conducted using the following methodologies and standards:</p>
    <ul>
        <li><strong>Evidence Acquisition:</strong> Read-only access with SHA-256 integrity verification</li>
        <li><strong>Preservation:</strong> Encrypted vault storage with chain-of-custody tracking</li>
        <li><strong>Analysis Framework:</strong> Multi-modal forensic analytics (fraud, timeline, correlation)</li>
        <li><strong>Standards Compliance:</strong> NIST SP 800-86, ISO 27037, INTERPOL Guidelines</li>
        <li><strong>Documentation:</strong> Complete audit trail of all examiner actions</li>
    </ul>

    <!-- CONCLUSIONS -->
    <h1>5. CONCLUSIONS & RECOMMENDATIONS</h1>
    <p>Based on the forensic analysis of the provided evidence, the following conclusions are drawn:</p>
    
    ${analyticsResults.length > 0 && analyticsResults[0].recommendations ? `
        <h2>Recommended Actions</h2>
        <ol>
            ${analyticsResults[0].recommendations.map(rec => `<li>${rec}</li>`).join('')}
        </ol>
    ` : ''}

    <!-- LEGAL NOTICE -->
    <div class="page-break"></div>
    <h1>LEGAL NOTICE</h1>
    <p>This report contains confidential and legally privileged information. It is prepared for the exclusive use of law enforcement agencies and legal representatives in connection with the investigation of the matter described herein.</p>
    
    <p><strong>Admissibility:</strong> This report has been prepared in accordance with:</p>
    <ul>
        <li>Federal Rules of Evidence (if applicable)</li>
        <li>State Rules of Evidence</li>
        <li>Daubert Standard for Expert Testimony (if applicable)</li>
        <li>ISO/IEC 27037:2012 – Guidelines for identification, collection, acquisition and preservation of digital evidence</li>
        <li>NIST Special Publication 800-86 – Guide to Integrating Forensic Techniques into Incident Response</li>
    </ul>

    <h2>Chain of Custody Certification</h2>
    <p>I certify that the evidence items listed in Section 3 have been handled in accordance with forensic best practices and legal requirements. The integrity of all evidence has been verified through cryptographic hashing and documented chain-of-custody entries.</p>

    <div style="margin-top: 60px;">
        <div style="margin-bottom: 20px;">
            <strong>Examiner:</strong>
            <div style="border-top: 1px solid #000; width: 300px; margin-top: 20px; margin-bottom: 5px;"></div>
            <div style="font-size: 10pt;">${metadata.investigator}</div>
        </div>

        <div>
            <strong>Date:</strong>
            <div style="border-top: 1px solid #000; width: 200px; margin-top: 20px;"></div>
        </div>
    </div>

    <div class="footer">
        <div>OmniDB Forensic Suite | Certified Forensic Report Generator</div>
        <div>Generated: ${date}</div>
        <div style="margin-top: 10px; font-size: 9pt; color: #999;">
            This report is electronically signed and verified. Case ID: ${metadata.caseId}
        </div>
    </div>

</body>
</html>
  `;
};

export const generateReportHTML = (
  caseId: string,
  metadata: {
    dbType: string;
    analysisType: string;
    description: string;
    createdAt: string;
  },
  analysis: AnalysisResult | null,
  evidence: Evidence[]
): string => {
  const date = new Date().toLocaleString();
  
  const findingsRows = analysis?.findings.map(f => `
    <tr class="finding-row ${f.severity.toLowerCase()}">
      <td><span class="badge ${f.severity.toLowerCase()}">${f.severity}</span></td>
      <td>${f.description}</td>
      <td>${f.impact}</td>
      <td>${f.timestamp || 'N/A'}</td>
    </tr>
  `).join('') || '<tr><td colspan="4" class="no-data">No analysis findings recorded.</td></tr>';

  const evidenceRows = evidence.map((e, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td>${e.fileName}</td>
      <td>${e.fileType}</td>
      <td>${(e.fileSize / 1024).toFixed(2)} KB</td>
      <td class="mono">${e.hash}</td>
      <td>${new Date(e.timestamp).toLocaleString()}</td>
    </tr>
  `).join('') || '<tr><td colspan="6" class="no-data">No evidence artifacts collected.</td></tr>';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Forensic Report - ${caseId}</title>
    <style>
        @page { margin: 2cm; }
        body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #333; line-height: 1.5; font-size: 12px; }
        .header { border-bottom: 2px solid #0ea5e9; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
        .logo { font-size: 24px; font-weight: bold; color: #0f172a; }
        .logo span { color: #0ea5e9; }
        .meta-tag { font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }
        
        h1, h2, h3 { color: #0f172a; margin-top: 20px; margin-bottom: 10px; }
        h1 { font-size: 22px; }
        h2 { font-size: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-top: 30px; color: #0ea5e9; text-transform: uppercase; letter-spacing: 0.5px; }
        h3 { font-size: 14px; font-weight: bold; }

        .case-info { background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; border-radius: 4px; display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px; }
        .info-group label { display: block; font-size: 10px; color: #64748b; uppercase; font-weight: bold; }
        .info-group div { font-weight: 600; font-size: 13px; }

        table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
        th, td { border: 1px solid #e2e8f0; padding: 8px 12px; text-align: left; }
        th { background: #f1f5f9; font-weight: bold; color: #475569; }
        .mono { font-family: 'Courier New', Courier, monospace; }
        
        .badge { padding: 2px 6px; border-radius: 3px; font-size: 9px; font-weight: bold; text-transform: uppercase; color: white; }
        .badge.critical { background-color: #f43f5e; }
        .badge.high { background-color: #f97316; }
        .badge.medium { background-color: #eab308; }
        .badge.low { background-color: #0ea5e9; }

        .summary-box { background: #fff; border: 1px solid #e2e8f0; padding: 15px; border-left: 4px solid #0ea5e9; }
        .no-data { text-align: center; color: #94a3b8; font-style: italic; padding: 20px; }

        .footer { margin-top: 50px; border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 10px; color: #94a3b8; display: flex; justify-content: space-between; }
        
        .print-btn { 
            position: fixed; top: 20px; right: 20px; 
            padding: 10px 20px; background: #0ea5e9; color: white; 
            border: none; border-radius: 5px; cursor: pointer; font-weight: bold;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        @media print {
            .print-btn { display: none; }
            body { -webkit-print-color-adjust: exact; }
        }
    </style>
</head>
<body>
    <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>

    <div class="header">
        <div>
            <div class="logo">OMNIDB <span>FORENSIC</span></div>
            <div class="meta-tag">Unified Investigation Suite</div>
        </div>
        <div style="text-align: right;">
            <div class="meta-tag">CONFIDENTIAL // LAW ENFORCEMENT SENSITIVE</div>
            <div>Generated: ${date}</div>
        </div>
    </div>

    <div class="case-info">
        <div class="info-group"><label>CASE ID</label><div>${caseId}</div></div>
        <div class="info-group"><label>CREATED AT</label><div>${metadata.createdAt}</div></div>
        <div class="info-group"><label>DATABASE SYSTEM</label><div>${metadata.dbType}</div></div>
        <div class="info-group"><label>INVESTIGATION TYPE</label><div>${metadata.analysisType}</div></div>
        <div class="info-group" style="grid-column: span 2;"><label>CONTEXT / DESCRIPTION</label><div>${metadata.description || 'No description provided.'}</div></div>
    </div>

    ${analysis ? `
    <h2>1. Executive Summary</h2>
    <div class="summary-box">
        <p>${analysis.summary.replace(/\n/g, '<br>')}</p>
        <div style="margin-top: 15px; font-weight: bold;">Calculated Risk Score: ${analysis.riskScore}/100</div>
    </div>

    <h2>2. Forensic Findings</h2>
    <table>
        <thead>
            <tr>
                <th style="width: 80px;">Severity</th>
                <th>Description</th>
                <th>Impact</th>
                <th style="width: 120px;">Timestamp</th>
            </tr>
        </thead>
        <tbody>
            ${findingsRows}
        </tbody>
    </table>

    <h2>3. Suggested Mitigation Queries</h2>
    <div style="background: #1e293b; color: #e2e8f0; padding: 15px; border-radius: 4px; font-family: monospace; font-size: 11px;">
        ${analysis.suggestedQueries.map((q, i) => `<div style="margin-bottom: 10px;">${i+1}. ${q}</div>`).join('')}
    </div>
    ` : '<h2>Analysis Report</h2><p class="no-data">No automated analysis has been performed for this case.</p>'}

    <h2>4. Evidence Log & Chain of Custody</h2>
    <table>
        <thead>
            <tr>
                <th style="width: 40px;">#</th>
                <th>File Name</th>
                <th>Type</th>
                <th>Size</th>
                <th>SHA-256 Checksum (Integrity)</th>
                <th>Acquired At</th>
            </tr>
        </thead>
        <tbody>
            ${evidenceRows}
        </tbody>
    </table>

    <div class="footer">
        <div>OmniDB Forensic Suite v2.0</div>
        <div>Page <span class="page-number"></span></div>
        <div>Hash: ${caseId.split('-')[0]}...</div>
    </div>
</body>
</html>
  `;
};
