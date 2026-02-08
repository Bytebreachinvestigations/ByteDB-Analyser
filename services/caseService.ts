/**
 * Case Persistence & Management Service
 * Handles storage and retrieval of forensic cases
 */

export interface CaseRecord {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'closed' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'critical';
  dbType: string;
  analysisType: string;
  investigator: string;
  createdAt: number;
  updatedAt: number;
  startDate: string;
  endDate?: string;
  tags: string[];
  notes: string;
  evidenceCount: number;
  findingsCount: number;
  riskScore: number;
}

/**
 * Case Management Service
 */
export class CaseService {
  private cases = new Map<string, CaseRecord>();
  private caseIndex: CaseRecord[] = [];

  /**
   * Create a new case
   */
  createCase(
    title: string,
    description: string,
    dbType: string,
    analysisType: string,
    investigator: string,
    startDate: string
  ): CaseRecord {
    const id = `CASE-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
    const now = Date.now();

    const caseRecord: CaseRecord = {
      id,
      title,
      description,
      status: 'open',
      priority: 'medium',
      dbType,
      analysisType,
      investigator,
      createdAt: now,
      updatedAt: now,
      startDate,
      tags: [],
      notes: '',
      evidenceCount: 0,
      findingsCount: 0,
      riskScore: 0
    };

    this.cases.set(id, caseRecord);
    this.caseIndex.push(caseRecord);

    // Persist to localStorage (in production: backend database)
    this.persist();

    return caseRecord;
  }

  /**
   * Retrieve a case by ID
   */
  getCase(caseId: string): CaseRecord | undefined {
    return this.cases.get(caseId);
  }

  /**
   * List all cases with optional filtering
   */
  listCases(filter?: {
    status?: string;
    investigator?: string;
    priority?: string;
  }): CaseRecord[] {
    let results = Array.from(this.cases.values());

    if (filter?.status) {
      results = results.filter(c => c.status === filter.status);
    }

    if (filter?.investigator) {
      results = results.filter(c => c.investigator === filter.investigator);
    }

    if (filter?.priority) {
      results = results.filter(c => c.priority === filter.priority);
    }

    return results.sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * Update case metadata
   */
  updateCase(
    caseId: string,
    updates: Partial<Omit<CaseRecord, 'id' | 'createdAt'>>
  ): CaseRecord | undefined {
    const caseRecord = this.cases.get(caseId);
    if (!caseRecord) return undefined;

    const updated: CaseRecord = {
      ...caseRecord,
      ...updates,
      updatedAt: Date.now()
    };

    this.cases.set(caseId, updated);
    this.updateIndex(updated);
    this.persist();

    return updated;
  }

  /**
   * Close a case
   */
  closeCase(caseId: string, endDate: string, notes: string): CaseRecord | undefined {
    return this.updateCase(caseId, {
      status: 'closed',
      endDate,
      notes
    });
  }

  /**
   * Archive a case
   */
  archiveCase(caseId: string): CaseRecord | undefined {
    return this.updateCase(caseId, {
      status: 'archived'
    });
  }

  /**
   * Delete a case (soft delete)
   */
  deleteCase(caseId: string): boolean {
    if (!this.cases.has(caseId)) return false;

    this.cases.delete(caseId);
    this.caseIndex = this.caseIndex.filter(c => c.id !== caseId);
    this.persist();

    return true;
  }

  /**
   * Get case statistics
   */
  getCaseStatistics(): {
    totalCases: number;
    openCases: number;
    closedCases: number;
    archivedCases: number;
    avgRiskScore: number;
    totalEvidence: number;
    totalFindings: number;
  } {
    const cases = Array.from(this.cases.values());

    return {
      totalCases: cases.length,
      openCases: cases.filter(c => c.status === 'open').length,
      closedCases: cases.filter(c => c.status === 'closed').length,
      archivedCases: cases.filter(c => c.status === 'archived').length,
      avgRiskScore: cases.length > 0
        ? Math.round(cases.reduce((sum, c) => sum + c.riskScore, 0) / cases.length)
        : 0,
      totalEvidence: cases.reduce((sum, c) => sum + c.evidenceCount, 0),
      totalFindings: cases.reduce((sum, c) => sum + c.findingsCount, 0)
    };
  }

  /**
   * Search cases by keyword
   */
  searchCases(keyword: string): CaseRecord[] {
    const lowerKeyword = keyword.toLowerCase();
    return Array.from(this.cases.values()).filter(c =>
      c.id.toLowerCase().includes(lowerKeyword) ||
      c.title.toLowerCase().includes(lowerKeyword) ||
      c.description.toLowerCase().includes(lowerKeyword) ||
      c.investigator.toLowerCase().includes(lowerKeyword) ||
      c.tags.some(tag => tag.toLowerCase().includes(lowerKeyword))
    );
  }

  /**
   * Export case as JSON
   */
  exportCase(caseId: string): string {
    const caseRecord = this.cases.get(caseId);
    if (!caseRecord) throw new Error('Case not found');

    return JSON.stringify(caseRecord, null, 2);
  }

  /**
   * Import case from JSON
   */
  importCase(json: string): CaseRecord {
    const caseRecord = JSON.parse(json) as CaseRecord;

    // Validate structure
    if (!caseRecord.id || !caseRecord.title) {
      throw new Error('Invalid case format');
    }

    this.cases.set(caseRecord.id, caseRecord);
    this.caseIndex.push(caseRecord);
    this.persist();

    return caseRecord;
  }

  /**
   * Generate case summary
   */
  generateCaseSummary(caseId: string): string {
    const caseRecord = this.cases.get(caseId);
    if (!caseRecord) throw new Error('Case not found');

    return `
CASE SUMMARY
============
Case ID: ${caseRecord.id}
Title: ${caseRecord.title}
Status: ${caseRecord.status.toUpperCase()}
Priority: ${caseRecord.priority.toUpperCase()}

Investigator: ${caseRecord.investigator}
Database Type: ${caseRecord.dbType}
Analysis Type: ${caseRecord.analysisType}

Created: ${new Date(caseRecord.createdAt).toLocaleString()}
Updated: ${new Date(caseRecord.updatedAt).toLocaleString()}
Period: ${caseRecord.startDate}${caseRecord.endDate ? ` to ${caseRecord.endDate}` : ''}

Description:
${caseRecord.description}

Evidence: ${caseRecord.evidenceCount} items
Findings: ${caseRecord.findingsCount}
Risk Score: ${caseRecord.riskScore}/100

Tags: ${caseRecord.tags.join(', ') || 'None'}
Notes: ${caseRecord.notes || 'None'}
    `.trim();
  }

  private updateIndex(caseRecord: CaseRecord): void {
    const idx = this.caseIndex.findIndex(c => c.id === caseRecord.id);
    if (idx >= 0) {
      this.caseIndex[idx] = caseRecord;
    }
  }

  private persist(): void {
    // In browser: use localStorage
    // In production: use backend API
    const casesJson = JSON.stringify(Array.from(this.cases.entries()));
    try {
      localStorage.setItem('forensic_cases', casesJson);
    } catch (e) {
      console.warn('Failed to persist cases', e);
    }
  }

  /**
   * Load cases from storage
   */
  load(): void {
    try {
      const casesJson = localStorage.getItem('forensic_cases');
      if (casesJson) {
        const entries = JSON.parse(casesJson) as [string, CaseRecord][];
        this.cases = new Map(entries);
        this.caseIndex = entries.map(([, caseRecord]) => caseRecord);
      }
    } catch (e) {
      console.warn('Failed to load cases', e);
    }
  }

  /**
   * Clear all cases
   */
  clear(): void {
    this.cases.clear();
    this.caseIndex = [];
    try {
      localStorage.removeItem('forensic_cases');
    } catch (e) {
      console.warn('Failed to clear cases', e);
    }
  }
}

// Singleton instance
export const caseService = new CaseService();
caseService.load();
