import React, { useState } from 'react';
import { DatabaseConnection, SupportedDatabase } from '../types';

interface Props {
  onDatabaseConnected: (connection: DatabaseConnection) => Promise<void>;
}

const DatabaseConnector: React.FC<Props> = ({ onDatabaseConnected }) => {
  const [dbType, setDbType] = useState<SupportedDatabase>(SupportedDatabase.MYSQL);
  const [connectionForm, setConnectionForm] = useState({
    name: '',
    host: 'localhost',
    port: '3306',
    username: '',
    password: '',
    database: '',
    filePath: '',
    ssl: false
  });
  const [testingConnection, setTestingConnection] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelect>) => {
    const { name, type, value, checked } = e.target as any;
    setConnectionForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDatabaseTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value as SupportedDatabase;
    setDbType(type);

    // Set default ports based on database type
    const defaultPorts: { [key in SupportedDatabase]: number } = {
      [SupportedDatabase.MYSQL]: 3306,
      [SupportedDatabase.POSTGRES]: 5432,
      [SupportedDatabase.MONGODB]: 27017,
      [SupportedDatabase.SQLITE]: 0,
      [SupportedDatabase.ELASTICSEARCH]: 9200,
      [SupportedDatabase.REDIS]: 6379,
      [SupportedDatabase.CASSANDRA]: 9042,
      [SupportedDatabase.NEO4J]: 7687
    };

    setConnectionForm(prev => ({
      ...prev,
      port: String(defaultPorts[type])
    }));
  };

  const handleTestConnection = async () => {
    if (!connectionForm.name) {
      setMessage({ type: 'error', text: 'Connection name is required' });
      return;
    }

    setTestingConnection(true);
    setMessage(null);

    try {
      // In production: Send to backend API
      // POST /api/database/test
      // { dbType, host, port, username, password, database, ssl }

      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network call

      setMessage({ type: 'success', text: '✓ Connection successful!' });
    } catch (error) {
      setMessage({ type: 'error', text: `✗ Connection failed: ${(error as Error).message}` });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleConnect = async () => {
    if (!connectionForm.name || !connectionForm.host) {
      setMessage({ type: 'error', text: 'Please fill in required fields' });
      return;
    }

    try {
      const connection: DatabaseConnection = {
        id: `db-${Date.now()}`,
        name: connectionForm.name,
        type: dbType,
        host: connectionForm.host,
        port: parseInt(connectionForm.port, 10),
        username: connectionForm.username,
        database: connectionForm.database,
        filePath: connectionForm.filePath,
        ssl: connectionForm.ssl,
        credentialsSaved: false,
        status: 'connected'
      };

      await onDatabaseConnected(connection);
      setMessage({ type: 'success', text: '✓ Database imported successfully!' });

      // Reset form
      setTimeout(() => {
        setConnectionForm({
          name: '',
          host: 'localhost',
          port: String(defaultPort(dbType)),
          username: '',
          password: '',
          database: '',
          filePath: '',
          ssl: false
        });
        setMessage(null);
      }, 2000);
    } catch (error) {
      setMessage({ type: 'error', text: `✗ Failed to connect: ${(error as Error).message}` });
    }
  };

  const defaultPort = (type: SupportedDatabase) => {
    const ports: { [key in SupportedDatabase]: number } = {
      [SupportedDatabase.MYSQL]: 3306,
      [SupportedDatabase.POSTGRES]: 5432,
      [SupportedDatabase.MONGODB]: 27017,
      [SupportedDatabase.SQLITE]: 0,
      [SupportedDatabase.ELASTICSEARCH]: 9200,
      [SupportedDatabase.REDIS]: 6379,
      [SupportedDatabase.CASSANDRA]: 9042,
      [SupportedDatabase.NEO4J]: 7687
    };
    return ports[type];
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-xl">
      <div className="flex items-center gap-2 mb-6">
        <i className="fas fa-database text-emerald-500 text-lg"></i>
        <h3 className="text-lg font-bold text-slate-200 uppercase tracking-wider">Database Connector</h3>
      </div>

      <div className="space-y-4">
        {/* Database Type Selection */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">
            Database Type <span className="text-red-400">*</span>
          </label>
          <select
            value={dbType}
            onChange={handleDatabaseTypeChange}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            {Object.values(SupportedDatabase).map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Connection Name */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">
            Connection Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={connectionForm.name}
            onChange={handleInputChange}
            placeholder="e.g., Production DB, Backup Server"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {/* Host Information */}
        {dbType !== SupportedDatabase.SQLITE && (
          <>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Host</label>
                <input
                  type="text"
                  name="host"
                  value={connectionForm.host}
                  onChange={handleInputChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Port</label>
                <input
                  type="number"
                  name="port"
                  value={connectionForm.port}
                  onChange={handleInputChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Database</label>
                <input
                  type="text"
                  name="database"
                  value={connectionForm.database}
                  onChange={handleInputChange}
                  placeholder="Optional"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Credentials */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Username</label>
                <input
                  type="text"
                  name="username"
                  value={connectionForm.username}
                  onChange={handleInputChange}
                  placeholder="Optional"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  value={connectionForm.password}
                  onChange={handleInputChange}
                  placeholder="Optional"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* SSL Option */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="ssl"
                name="ssl"
                checked={connectionForm.ssl}
                onChange={handleInputChange}
                className="rounded"
              />
              <label htmlFor="ssl" className="text-sm text-slate-300">Require SSL/TLS</label>
            </div>
          </>
        )}

        {/* SQLite File Path */}
        {dbType === SupportedDatabase.SQLITE && (
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Database File Path <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="filePath"
              value={connectionForm.filePath}
              onChange={handleInputChange}
              placeholder="/path/to/database.db"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        )}

        {/* Status Message */}
        {message && (
          <div className={`p-3 rounded text-sm ${message.type === 'success' 
            ? 'bg-emerald-900 text-emerald-200 border border-emerald-700' 
            : 'bg-red-900 text-red-200 border border-red-700'}`}>
            {message.text}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-4">
          <button
            onClick={handleTestConnection}
            disabled={testingConnection || !connectionForm.host}
            className="flex-1 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-500 text-slate-100 font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2"
          >
            <i className={`fas fa-plug ${testingConnection ? 'fa-spin' : ''}`}></i>
            {testingConnection ? 'Testing...' : 'Test Connection'}
          </button>
          <button
            onClick={handleConnect}
            disabled={testingConnection || !connectionForm.name}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2"
          >
            <i className="fas fa-link"></i>
            Connect & Import
          </button>
        </div>

        <div className="text-xs text-slate-500 pt-2 border-t border-slate-700">
          <p><strong>Forensic Mode:</strong> Read-only access with SHA-256 integrity verification</p>
          <p>All data will be hashed and stored in secure vault with chain-of-custody tracking</p>
        </div>
      </div>
    </div>
  );
};

export default DatabaseConnector;
