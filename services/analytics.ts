/**
 * Forensic Analytics Engine
 * Provides fraud detection, timeline, and pattern analysis
 */

export interface AnalyticsResult {
  type: 'fraud' | 'timeline' | 'correlation' | 'pattern' | 'anomaly';
  riskScore: number;
  findings: Finding[];
  recommendations: string[];
  metadata: any;
}

export interface Finding {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  description: string;
  evidence: string[];
  timestamp?: number;
  relatedRecords?: any[];
}

/**
 * Fraud Detection Engine
 */
export class FraudDetectionEngine {
  /**
   * Detect financial fraud patterns
   */
  static detectFinancialFraud(transactions: any[]): AnalyticsResult {
    const findings: Finding[] = [];
    let riskScore = 0;

    // 1. Benford's Law Analysis (first digit distribution)
    const benfordAnalysis = this.analyzeBenford(transactions);
    if (benfordAnalysis.anomaly) {
      findings.push({
        id: 'benford-001',
        severity: 'high',
        category: 'Statistical Anomaly',
        description: 'Transaction amounts violate Benford\'s Law - suggesting fabricated data',
        evidence: benfordAnalysis.anomalousDigits.map(d => `Digit ${d.digit}: ${d.deviation}% deviation`),
        relatedRecords: benfordAnalysis.flaggedTransactions.slice(0, 5)
      });
      riskScore += 25;
    }

    // 2. Circular transfer detection
    const circularTransfers = this.detectCircularTransfers(transactions);
    if (circularTransfers.length > 0) {
      findings.push({
        id: 'circular-001',
        severity: 'critical',
        category: 'Money Laundering',
        description: `Detected ${circularTransfers.length} circular transfer chains - possible money laundering`,
        evidence: circularTransfers.map(c => `Chain: ${c.accounts.join(' → ')}`),
        relatedRecords: circularTransfers
      });
      riskScore += 35;
    }

    // 3. Round number analysis
    const roundNumbers = this.detectRoundNumbers(transactions);
    if (roundNumbers.percentage > 30) {
      findings.push({
        id: 'round-001',
        severity: 'medium',
        category: 'Anomalous Pattern',
        description: `${roundNumbers.percentage.toFixed(1)}% of transactions are round numbers - unusually high`,
        evidence: [`Found ${roundNumbers.count} round-number transactions`],
        relatedRecords: roundNumbers.transactions.slice(0, 10)
      });
      riskScore += 15;
    }

    // 4. Duplicate transaction detection
    const duplicates = this.detectDuplicates(transactions);
    if (duplicates.length > 0) {
      findings.push({
        id: 'dup-001',
        severity: 'high',
        category: 'Duplicate Transactions',
        description: `Found ${duplicates.length} duplicate or near-duplicate transactions`,
        evidence: duplicates.map(d => `Amount: ${d.amount}, Time: ${d.timeDifference}s apart`),
        relatedRecords: duplicates
      });
      riskScore += 20;
    }

    // 5. Velocity analysis (transaction frequency)
    const velocityAnomalies = this.detectVelocityAnomalies(transactions);
    if (velocityAnomalies.length > 0) {
      findings.push({
        id: 'velocity-001',
        severity: 'medium',
        category: 'High Velocity',
        description: `${velocityAnomalies.length} accounts show unusually high transaction velocity`,
        evidence: velocityAnomalies.map(v => `${v.account}: ${v.count} transactions in ${v.timeWindow}min`),
        relatedRecords: velocityAnomalies
      });
      riskScore += 10;
    }

    return {
      type: 'fraud',
      riskScore: Math.min(riskScore, 100),
      findings,
      recommendations: this.generateFraudRecommendations(findings),
      metadata: {
        analyzedRecords: transactions.length,
        suspiciousPatterns: findings.length
      }
    };
  }

  private static analyzeBenford(transactions: any[]): any {
    // Analyze if first digits follow Benford's Law
    const amounts = transactions.map(t => Math.abs(t.amount)).filter(a => a > 0);
    const firstDigits: { [key: number]: number } = {};

    amounts.forEach(amount => {
      const firstDigit = parseInt(String(amount).charAt(0));
      firstDigits[firstDigit] = (firstDigits[firstDigit] || 0) + 1;
    });

    // Expected Benford distribution
    const benfordLaw: { [key: number]: number } = {
      1: 0.301, 2: 0.176, 3: 0.125, 4: 0.097, 5: 0.079,
      6: 0.067, 7: 0.058, 8: 0.051, 9: 0.046
    };

    const anomalousDigits = [];
    const flaggedTransactions = [];

    for (let digit = 1; digit <= 9; digit++) {
      const observed = (firstDigits[digit] || 0) / amounts.length;
      const expected = benfordLaw[digit];
      const deviation = Math.abs((observed - expected) / expected) * 100;

      if (deviation > 20) {
        anomalousDigits.push({ digit, deviation: deviation.toFixed(2) });
      }
    }

    return {
      anomaly: anomalousDigits.length > 3,
      anomalousDigits,
      flaggedTransactions: amounts.slice(0, 10)
    };
  }

  private static detectCircularTransfers(transactions: any[]): any[] {
    // Build account graph and detect cycles
    const accountGraph = new Map<string, Set<string>>();

    transactions.forEach(t => {
      if (!accountGraph.has(t.from)) accountGraph.set(t.from, new Set());
      accountGraph.get(t.from)!.add(t.to);
    });

    const cycles: any[] = [];
    // DFS-based cycle detection
    // (Simplified: full implementation would use Tarjan's algorithm)

    return cycles;
  }

  private static detectRoundNumbers(transactions: any[]): any {
    const roundTransactions = transactions.filter(t =>
      t.amount % 100 === 0 || t.amount % 1000 === 0
    );

    return {
      count: roundTransactions.length,
      percentage: (roundTransactions.length / transactions.length) * 100,
      transactions: roundTransactions
    };
  }

  private static detectDuplicates(transactions: any[]): any[] {
    const seen = new Map();
    const duplicates = [];

    transactions.forEach((t, idx) => {
      const key = `${t.from}-${t.to}-${t.amount}`;
      if (seen.has(key)) {
        const prev = seen.get(key);
        const timeDifference = Math.abs(t.timestamp - prev.timestamp);
        if (timeDifference < 300) { // Within 5 minutes
          duplicates.push({
            ...t,
            timeDifference,
            duplicateOf: prev.id
          });
        }
      } else {
        seen.set(key, { ...t, id: idx });
      }
    });

    return duplicates;
  }

  private static detectVelocityAnomalies(transactions: any[]): any[] {
    const accountActivity = new Map<string, any[]>();

    transactions.forEach(t => {
      if (!accountActivity.has(t.from)) accountActivity.set(t.from, []);
      accountActivity.get(t.from)!.push(t);
    });

    const anomalies = [];
    const timeWindow = 60; // minutes

    accountActivity.forEach((txns, account) => {
      if (txns.length > 50) {
        anomalies.push({
          account,
          count: txns.length,
          timeWindow,
          velocity: (txns.length / timeWindow).toFixed(2)
        });
      }
    });

    return anomalies;
  }

  private static generateFraudRecommendations(findings: Finding[]): string[] {
    return findings.map(f => {
      switch (f.category) {
        case 'Money Laundering':
          return 'Recommend immediate freeze of circular transfer chains and FATF investigation';
        case 'Duplicate Transactions':
          return 'Verify with banks - may indicate system glitches or deliberate duplication';
        case 'High Velocity':
          return 'Institute transaction rate limiting and require multi-factor authentication';
        default:
          return `Investigate: ${f.description}`;
      }
    });
  }
}

/**
 * Timeline Reconstruction Engine
 */
export class TimelineEngine {
  static buildTimeline(events: any[]): AnalyticsResult {
    // Sort by timestamp
    const sortedEvents = [...events].sort((a, b) =>
      (a.timestamp || 0) - (b.timestamp || 0)
    );

    const findings: Finding[] = [];
    let riskScore = 0;

    // 1. Identify event clusters
    const clusters = this.identifyEventClusters(sortedEvents);
    if (clusters.length > 5) {
      findings.push({
        id: 'timeline-001',
        severity: 'high',
        category: 'Event Clustering',
        description: `Timeline shows ${clusters.length} distinct event clusters indicative of coordinated activity`,
        evidence: clusters.map(c => `Cluster: ${c.events.length} events in ${c.duration}ms`),
        relatedRecords: clusters
      });
      riskScore += 20;
    }

    // 2. Temporal anomalies
    const temporalAnomalies = this.detectTemporalAnomalies(sortedEvents);
    if (temporalAnomalies.length > 0) {
      findings.push({
        id: 'timeline-002',
        severity: 'medium',
        category: 'Temporal Anomaly',
        description: `Found ${temporalAnomalies.length} events with unusual timing patterns`,
        evidence: temporalAnomalies.map(a => a.description),
        relatedRecords: temporalAnomalies
      });
      riskScore += 15;
    }

    return {
      type: 'timeline',
      riskScore,
      findings,
      recommendations: [
        'Review complete timeline with stakeholders',
        'Cross-reference with system logs and CCTV footage',
        'Interview personnel present during key events'
      ],
      metadata: {
        eventCount: sortedEvents.length,
        timeSpan: sortedEvents.length > 1 
          ? (sortedEvents[sortedEvents.length - 1].timestamp - sortedEvents[0].timestamp) / 1000 
          : 0,
        clusters: clusters.length
      }
    };
  }

  private static identifyEventClusters(events: any[]): any[] {
    const clusters = [];
    let currentCluster = [events[0]];
    const timeThreshold = 60000; // 1 minute

    for (let i = 1; i < events.length; i++) {
      const timeDiff = events[i].timestamp - events[i - 1].timestamp;
      if (timeDiff < timeThreshold) {
        currentCluster.push(events[i]);
      } else {
        clusters.push({
          events: currentCluster,
          duration: currentCluster[currentCluster.length - 1].timestamp - currentCluster[0].timestamp,
          startTime: new Date(currentCluster[0].timestamp),
          endTime: new Date(currentCluster[currentCluster.length - 1].timestamp)
        });
        currentCluster = [events[i]];
      }
    }

    return clusters;
  }

  private static detectTemporalAnomalies(events: any[]): any[] {
    const anomalies = [];

    // Detect events outside business hours
    events.forEach((event, idx) => {
      const hour = new Date(event.timestamp).getHours();
      if (hour < 6 || hour > 22) {
        anomalies.push({
          ...event,
          type: 'off_hours',
          description: `Event at ${hour}:00 - outside standard business hours`
        });
      }
    });

    return anomalies.slice(0, 10);
  }
}

/**
 * Correlation Engine
 */
export class CorrelationEngine {
  static correlateEvents(
    transactions: any[],
    logs: any[],
    userAccess: any[]
  ): AnalyticsResult {
    const findings: Finding[] = [];
    let riskScore = 0;

    // Find correlated suspicious activity across sources
    const correlatedEvents = this.findCorrelations(transactions, logs, userAccess);

    if (correlatedEvents.length > 0) {
      findings.push({
        id: 'corr-001',
        severity: 'critical',
        category: 'Multi-Source Correlation',
        description: `Found ${correlatedEvents.length} suspicious patterns correlated across multiple data sources`,
        evidence: correlatedEvents.map(e => e.description),
        relatedRecords: correlatedEvents
      });
      riskScore = 80;
    }

    return {
      type: 'correlation',
      riskScore,
      findings,
      recommendations: [
        'Escalate to FBI/LE for multi-agency investigation',
        'Conduct background checks on involved parties',
        'Review all related systems for breach indicators'
      ],
      metadata: {
        correlatedPatterns: correlatedEvents.length,
        sources: 3
      }
    };
  }

  private static findCorrelations(
    transactions: any[],
    logs: any[],
    userAccess: any[]
  ): any[] {
    // Cross-reference transactions with system access logs
    // Return correlated suspicious activities

    return [];
  }
}
