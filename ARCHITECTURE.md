# ByteDB-Analyser: Database Forensic Platform

**Complete documentation for the unified database forensic investigation suite.**

---

## 📋 Overview

**ByteDB-Analyser** is a professional-grade **Database Forensic Analysis Tool** built for cyber investigations, financial fraud detection, insider threat analysis, and digital evidence preservation.

### Key Features

✅ **Multi-Database Support** - MySQL, PostgreSQL, SQLite, MongoDB, Elasticsearch, Redis, Cassandra, Neo4j
✅ **Forensic Analytics Engine** - Fraud detection, timeline reconstruction, correlation analysis
✅ **Evidence Vault** - Encrypted storage with chain-of-custody and tamper detection
✅ **Case Management** - Complete case lifecycle management with persistence
✅ **Court-Ready Reports** - Professional forensic reports with digital signatures
✅ **AI Intelligence** - Gemini-powered forensic analysis and recommendations

---

## 📁 Architecture

### File Structure

```
services/
  ├── plugins/
  │   ├── index.ts              # Plugin framework & registry
  │   ├── sql.connector.ts       # MySQL/PostgreSQL/SQLite 
  │   └── mongodb.connector.ts   # MongoDB connector
  ├── vault.ts                   # Evidence vault & chain-of-custody
  ├── analytics.ts               # Fraud detection, timeline, correlation
  ├── caseService.ts             # Case management & persistence
  ├── reportService.ts           # Enhanced forensic report generator
  ├── geminiService.ts           # AI-powered analysis
  └── reportService.ts           # Report generation
  
components/
  ├── DatabaseConnector.tsx       # DB import wizard
  ├── CaseManager.tsx             # Case management UI
  ├── EvidenceManager.tsx         # Evidence upload & validation
  ├── AnalysisDisplay.tsx         # Results display
  ├── ForensicCopilot.tsx         # AI assistant
  └── Header.tsx                  # Navigation
  
types.ts                          # Unified type definitions
App.tsx                           # Main application logic
vite.config.ts                    # Build configuration
```

---

## 🔌 Plugin System

### Architecture

All databases are accessed via a **plugin-based connector framework**:

```typescript
// Base class all plugins extend
abstract class DatabaseConnector {
  abstract connect(): Promise<ConnectorResult>;
  abstract getTables(): Promise<ConnectorResult>;
  abstract getTableSchema(table: string): Promise<ConnectorResult>;
  abstract queryTable(table: string, options?: QueryOptions): Promise<ConnectorResult>;
  abstract executeQuery(query: string): Promise<ConnectorResult>;
  abstract exportData(table: string, format: 'json' | 'csv'): Promise<ConnectorResult>;
  abstract getDeletedRecords?(table: string): Promise<ConnectorResult>;
  abstract getAuditLog?(): Promise<ConnectorResult>;
  abstract getTransactionLog?(): Promise<ConnectorResult>;
}

// Global registry
const registry = new ConnectorRegistry();
registry.register('mysql', SQLConnector);
registry.register('mongodb', MongoDBConnector);
```

### Adding New Databases

**To add support for a new database (e.g., Oracle):**

1. Create [services/plugins/oracle.connector.ts](services/plugins/oracle.connector.ts)
2. Extend `DatabaseConnector` abstract class
3. Implement all required methods
4. Register in plugin registry:
   ```typescript
   import { registry } from './index';
   registry.register('oracle', OracleConnector);
   ```

---

## 💾 Evidence Vault System

### Features

- **Encryption**: AES-256-GCM with secure key management
- **Integrity**: SHA-256 hashing with verification
- **Chain-of-Custody**: Complete audit trail of all access/modifications
- **Tamper Detection**: Merkle tree-based integrity validation
- **Compliance**: ISO 27001, IT Act (India), GDPR compliant

### Usage

```typescript
import { EvidenceVault } from './services/vault';

const vault = new EvidenceVault({
  storagePath: '/evidence-vault',
  encryptionAlgorithm: 'AES-256-GCM',
  enableTamperDetection: true,
  retentionDays: 2555 // 7 years
});

// Archive evidence
const evidence = await vault.archiveEvidence(
  caseId,
  fileName,
  fileData,
  {
    source: 'MySQL Database',
    database: 'production_db',
    table: 'transactions',
    recordCount: 50000
  },
  ['financial', 'fraud', 'transactions']
);

// Verify integrity
const verification = await vault.verifyIntegrity(evidenceId, 'Investigator Name');

// Export with signature
const exported = await vault.exportEvidence(evidenceId, investigator, 'encrypted');

// Get chain-of-custody
const coc = vault.getCaseSummary(caseId);
```

---

## 🔍 Analytics Modules

### Fraud Detection Engine

**Detects:**
- Benford's Law violations (fabricated data)
- Circular transfer chains (money laundering)
- Duplicate transactions
- Round number anomalies
- Velocity anomalies

```typescript
import { FraudDetectionEngine } from './services/analytics';

const result = FraudDetectionEngine.detectFinancialFraud(transactions);
// Returns: riskScore, findings (Critical/High/Medium/Low), recommendations
```

### Timeline Reconstruction

**Builds attack/fraud timeline:**
- Event clustering
- Temporal anomalies
- Off-hours activity detection
- Cross-correlation with logs

### Correlation Engine

**Correlates multiple sources:**
- Transactions ↔ System logs
- System access ↔ Data changes
- User activity ↔ Network traffic

---

## 📊 Case Management

### Case Lifecycle

```typescript
import { caseService } from './services/caseService';

// Create case
const c = caseService.createCase(
  'Financial Fraud Investigation',
  'Suspected unauthorized transactions in production database',
  'MySQL',
  'FINANCIAL_FRAUD',
  'John Investigator',
  '2024-02-01'
);

// Update case
caseService.updateCase(c.id, {
  riskScore: 85,
  findingsCount: 12,
  status: 'closed',
  endDate: '2024-02-08'
});

// Get statistics
const stats = caseService.getCaseStatistics();
// { totalCases, openCases, closedCases, avgRiskScore, totalEvidence, totalFindings }

// Search
const results = caseService.searchCases('fraud database');

// Export/Import
const json = caseService.exportCase(caseId);
caseService.importCase(json);
```

---

## 📄 Report Generation

### Professional Forensic Reports

**Generates court-admissible reports** with:
- Title page with case metadata
- Executive summary
- Risk assessment meter
- Detailed findings with severity levels
- Evidence log with chain-of-custody
- Legal notice and certification
- Examiner signature block

```typescript
import { generateForensicReport } from './services/reportService';

const report = generateForensicReport(
  {
    caseId: 'CASE-2024-001',
    title: 'Financial Fraud Investigation',
    investigator: 'Jane Doe',
    investigatorCredentials: 'CFCE, EnCE',
    institution: 'Cyber Forensics Lab',
    startDate: '2024-02-01',
    endDate: '2024-02-08',
    description: 'Investigation of unauthorized database access'
  },
  databases,
  analyticsResults,
  vaultEvidence
);

// Save as HTML/PDF
```

---

## 🗄️ Supported Databases

| Database | Type | Status | Features |
|----------|------|--------|----------|
| MySQL | SQL | ✅ Implemented | Tables, Schema, Audit logs |
| PostgreSQL | SQL | ✅ Implemented | Tables, Schema, WAL recovery |
| SQLite | SQL | ✅ Implemented | File-based, Mobile forensics |
| MongoDB | NoSQL | ✅ Implemented | Collections, Change streams |
| Elasticsearch | Search | 🔄 Plannedindex analysis |
| Redis | Cache | 🔄 Planned | Session recovery |
| Cassandra | Column-Family | 🔄 Planned | Distributed analysis |
| Neo4j | Graph | 🔄 Planned | Relationship mapping |

---

## 🔐 Security & Compliance

### Standards Compliance

✅ **NIST SP 800-86** - Guide to Integrating Forensic Techniques in Incident Response
✅ **ISO/IEC 27037:2012** - Identification, collection, acquisition and preservation of digital evidence
✅ **INTERPOL Guidelines** - Digital Evidence Handbook
✅ **IT Act 2000 (India)** - Section 65, 65A (Tampering/Destruction)
✅ **Daubert Standard** - Expert testimony admissibility

### Encryption & Key Management

- **Transport**: TLS 1.3
- **Storage**: AES-256-GCM
- **Keys**: HSM/Vault integration (production)
- **Audit Logs**: Immutable append-only

---

## 🚀 Usage Examples

### Example 1: Importing MySQL Data

```typescript
// 1. Create case
const case = caseService.createCase(
  'DB Breach Investigation',
  'Unauthorized access to user table',
  'MySQL',
  'HACKER_ATTACK',
  'Investigator Name',
  '2024-02-08'
);

// 2. Connect database
const connection = new SQLConnector({
  host: 'prod.example.com',
  port: 3306,
  username: 'readonly_user',
  password: '***',
  database: 'production'
});

// 3. Acquire evidence
const tables = await connection.getTables();
const schema = await connection.getTableSchema('users');
const data = await connection.queryTable('users', { limit: 10000 });

// 4. Archive evidence
const evidence = await vault.archiveEvidence(
  case.id,
  'users_table_export.csv',
  convertToBuffer(data),
  { source: 'MySQL', database: 'production', table: 'users' }
);

// 5. Analyze
const fraud = FraudDetectionEngine.detectFinancialFraud(data.data);

// 6. Report
const report = generateForensicReport({...}, [...], [fraud], [evidence]);
downloadHTML(report);
```

### Example 2: Timeline Investigation

```typescript
// Import logs
const logs = await connection.getAuditLog();

// Build timeline
const timeline = TimelineEngine.buildTimeline(logs);

// Update case
caseService.updateCase(caseId, {
  riskScore: timeline.riskScore,
  findingsCount: timeline.findings.length
});

// Generate report
const report = generateForensicReport({...}, [...], [timeline], evidence);
```

---

## 🔧 Development

### Add New Analytics Module

```typescript
// services/analytics.ts

export class YourAnalysisEngine {
  static analyzePattern(data: any[]): AnalyticsResult {
    const findings: Finding[] = [];
    let riskScore = 0;

    // Your analysis logic
    findings.push({
      id: 'your-001',
      severity: 'high',
      category: 'Your Category',
      description: 'Finding description',
      evidence: ['evidence 1', 'evidence 2']
    });

    return {
      type: 'pattern',
      riskScore,
      findings,
      recommendations: ['Recommendation 1', 'Recommendation 2'],
      metadata: {}
    };
  }
}
```

### Add New Database Plugin

```typescript
// services/plugins/your-db.connector.ts

import { DatabaseConnector, ConnectorConfig, ConnectorResult } from './index';

export class YourDBConnector extends DatabaseConnector {
  name = 'Your Database';
  type = 'nosql' as const;

  async connect(): Promise<ConnectorResult> {
    // Connection logic
  }

  async getTables(): Promise<ConnectorResult> {
    // List collections/tables
  }

  // ... implement other abstract methods
}

// Register
import { registry } from './index';
registry.register('yourdb', YourDBConnector);
```

---

## 📞 Support

For issues, feature requests, or security concerns:
- **GitHub**: [Bytebreachinvestigations/ByteDB-Analyser](https://github.com/Bytebreachinvestigations/ByteDB-Analyser)
- **Email**: forensics@bytebreak.com

---

## ⚖️ Legal Disclaimer

This tool is designed for **legitimate forensic investigations** by authorized personnel. Unauthorized access to database systems is illegal. Users are responsible for complying with all applicable laws and regulations.

---

## 📈 Roadmap

- [ ] Dark Web database forensics
- [ ] Blockchain/Crypto analysis module
- [ ] Satellite imagery integration
- [ ] Quantum-safe encryption
- [ ] Native mobile app (iOS/Android)
- [ ] Self-hosted deployment (Docker)
- [ ] REST API for integration
- [ ] Advanced ML anomaly detection
- [ ] Real-time streaming analysis
- [ ] Multi-region cloud deployment

---

**Version**: 2.0.0
**Last Updated**: February 2024
**Status**: Production Ready (MVP)
