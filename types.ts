
export enum AnalysisType {
  // Core Threats
  FINANCIAL_FRAUD = 'Financial Fraud',
  HACKER_ATTACK = 'Hacker Attack / Intrusion',
  MALICIOUS_INSIDER = 'Malicious Insider',
  SYSTEM_ANOMALY = 'System Anomaly',

  // Data Exfiltration & Leakage
  DATA_EXFILTRATION = 'Data Exfiltration',
  DATA_LEAKAGE = 'Data Leakage Prevention',
  DNS_TUNNELING = 'DNS Tunneling / Exfiltration',

  // Network Forensics
  NETWORK_INTRUSION = 'Network Intrusion Detection',
  C2_TRAFFIC = 'Command & Control (C2) Traffic',
  TRAFFIC_ANALYSIS = 'Suspicious Traffic Patterns',

  // Advanced Forensic Categories
  MALWARE_ANALYSIS = 'Malware Analysis & IOCs',
  INSIDER_THREAT = 'Insider Threat Detection',
  ROOTKIT_ACTIVITY = 'Rootkit / Bootkit Activity',
  FILELESS_THREAT = 'Fileless Malware / PowerShell',
  
  // Identity & Access
  ACCOUNT_TAKEOVER = 'Account Takeover (ATO)',
  BRUTE_FORCE = 'Brute Force / Credential Stuffing',
  SESSION_HIJACKING = 'Session Hijacking',
  UNAUTHORIZED_ACCESS = 'Unauthorized Access Attempt',

  // Infrastructure & Persistence
  WEB_SHELL = 'Web Shell / Backdoor Activity',
  CRYPTOMINING = 'Unauthorized Cryptomining',
  LATERAL_MOVEMENT = 'Lateral Movement',

  // Governance & Compliance
  COMPLIANCE_VIOLATION = 'Compliance Violation (GDPR/HIPAA)',
  AUDIT_FAILURE = 'Audit Trail Gap / Failure',

  // Specific Attack Vectors
  SQL_INJECTION = 'SQL Injection Artifacts',
  CROSS_SITE_SCRIPTING = 'Stored XSS / Script Injection',
  PRIVILEGE_ESCALATION = 'Privilege Escalation',
  RANSOMWARE_ACTIVITY = 'Ransomware Activity',
  ZERO_DAY_EXPLOIT = 'Zero-Day Exploit Indicators',
  API_ABUSE = 'API Abuse & Anomalies',
  LOG_TAMPERING = 'Log Tampering / Erasure',
  GHOST_TRANSACTION = 'Ghost Transaction / Record',
  SCHEMA_MANIPULATION = 'Unauthorized Schema Change'
}

export interface Case {
  id: string;
  title: string;
  dbType: string;
  category: string;
  type: AnalysisType;
  status: 'Open' | 'Closed' | 'Archived';
  createdAt: number;
  description: string;
  investigator?: string;
}

export interface Evidence {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  timestamp: number;
  lastModified?: number;
  hash: string;
  tags: string[];
  category: string;
  contentSnippet?: string;
  source?: string;
  database?: string;
  table?: string;
}

export interface AnalysisResult {
  summary: string;
  riskScore: number;
  findings: Finding[];
  suggestedQueries: string[];
}

export interface Finding {
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  description: string;
  impact: string;
  timestamp?: string;
}

export interface DatabaseMetadata {
  category: string;
  systems: string[];
}

/**
 * Database Connection Types
 */
export enum SupportedDatabase {
  MYSQL = 'MySQL',
  POSTGRES = 'PostgreSQL',
  SQLITE = 'SQLite',
  MONGODB = 'MongoDB',
  ELASTICSEARCH = 'Elasticsearch',
  REDIS = 'Redis',
  CASSANDRA = 'Cassandra',
  NEO4J = 'Neo4j'
}

export interface DatabaseConnection {
  id: string;
  name: string;
  type: SupportedDatabase;
  host?: string;
  port?: number;
  username?: string;
  database?: string;
  filePath?: string;
  connectionString?: string;
  ssl: boolean;
  credentialsSaved: boolean;
  lastTested?: number;
  status: 'connected' | 'disconnected' | 'error';
}

/**
 * Digital Evidence
 */
export interface DigitalEvidence {
  id: string;
  caseId: string;
  type: 'database' | 'log' | 'file' | 'memory' | 'network';
  fileName: string;
  fileHash: string;
  encryptedHash: string;
  timestamp: number;
  size: number;
  category: string;
  tags: string[];
  metadata: {
    source: string;
    database?: string;
    table?: string;
    recordCount?: number;
    lastModified?: number;
  };
  chainOfCustody: ChainOfCustodyEntry[];
  status: 'archived' | 'processing' | 'verified' | 'flagged';
  integrityVerified: boolean;
}

export interface ChainOfCustodyEntry {
  timestamp: number;
  action: 'created' | 'accessed' | 'verified' | 'exported' | 'signed';
  investigator: string;
  notes?: string;
  hash?: string;
}

/**
 * Forensic Report
 */
export interface ForensicReport {
  id: string;
  caseId: string;
  title: string;
  investigator: string;
  investigators: string;
  institution: string;
  createdAt: number;
  startDate: string;
  endDate: string;
  description: string;
  databases: Array<{
    type: string;
    name: string;
    recordCount: number;
  }>;
  findings: Finding[];
  riskScore: number;
  recommendations: string[];
  status: 'draft' | 'final' | 'signed';
  }
