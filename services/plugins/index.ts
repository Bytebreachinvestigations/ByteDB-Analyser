/**
 * Database Connector Plugin System
 * Unified interface for all database types
 */

export interface ConnectorConfig {
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database?: string;
  connectionString?: string;
  filePath?: string;
  [key: string]: any;
}

export interface QueryOptions {
  limit?: number;
  offset?: number;
  where?: Record<string, any>;
}

export interface TableSchema {
  name: string;
  columns: ColumnInfo[];
  primaryKey?: string[];
}

export interface ColumnInfo {
  name: string;
  type: string;
  nullable: boolean;
}

export interface ConnectorResult {
  success: boolean;
  data?: any[];
  schema?: TableSchema[];
  error?: string;
  message?: string;
}

/**
 * Base Connector Class - All DB plugins extend this
 */
export abstract class DatabaseConnector {
  abstract name: string;
  abstract type: 'sql' | 'nosql' | 'search' | 'graph' | 'timeseries' | 'vector';
  protected config: ConnectorConfig;

  constructor(config: ConnectorConfig) {
    this.config = config;
  }

  abstract connect(): Promise<ConnectorResult>;
  abstract disconnect(): Promise<void>;
  abstract getTables(): Promise<ConnectorResult>;
  abstract getTableSchema(table: string): Promise<ConnectorResult>;
  abstract queryTable(table: string, options?: QueryOptions): Promise<ConnectorResult>;
  abstract executeQuery(query: string): Promise<ConnectorResult>;
  abstract exportData(table: string, format: 'json' | 'csv'): Promise<ConnectorResult>;

  // Forensic-specific methods
  abstract getDeletedRecords?(table: string): Promise<ConnectorResult>;
  abstract getAuditLog?(table?: string): Promise<ConnectorResult>;
  abstract getTransactionLog?(): Promise<ConnectorResult>;
}

/**
 * Connector Registry - Manages all available plugins
 */
export class ConnectorRegistry {
  private connectors = new Map<string, typeof DatabaseConnector>();

  register(dbType: string, connectorClass: typeof DatabaseConnector): void {
    this.connectors.set(dbType.toLowerCase(), connectorClass);
  }

  get(dbType: string): typeof DatabaseConnector | undefined {
    return this.connectors.get(dbType.toLowerCase());
  }

  getAvailable(): string[] {
    return Array.from(this.connectors.keys());
  }

  createConnector(dbType: string, config: ConnectorConfig): DatabaseConnector {
    const ConnectorClass = this.connectors.get(dbType.toLowerCase());
    if (!ConnectorClass) {
      throw new Error(`Connector not found for database type: ${dbType}`);
    }
    return new ConnectorClass(config);
  }
}

// Global registry instance
export const registry = new ConnectorRegistry();
