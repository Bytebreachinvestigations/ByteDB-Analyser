
import { DatabaseMetadata } from './types';

export const DATABASE_CATEGORIES: DatabaseMetadata[] = [
  {
    category: "RELATIONAL (RDBMS) & NEW-SQL",
    systems: [
      "Oracle Database", "Microsoft SQL Server", "PostgreSQL", "MySQL", "IBM Db2", "MariaDB", 
      "SQLite", "Amazon Aurora", "Google Cloud Spanner", "CockroachDB", "TiDB", "YugabyteDB", 
      "SAP HANA", "Teradata", "Sybase ASE", "Sybase IQ", "Informix", "Ingres", "Firebird", "H2", "HSQLDB", 
      "Apache Derby", "SingleStore (MemSQL)", "Greenplum", "OceanBase", "VoltDB", "NuoDB", "CUBRID", 
      "Altibase", "Tibero", "Mimer SQL", "Clustrix", "Citus", "Vitess", "Percona Server for MySQL", 
      "EnterpriseDB (EDB)", "TDSQL", "PolarDB", "GaussDB", "InterBase", "Pervasive PSQL (Actian Zen)",
      "4D", "MaxDB", "SQLBase", "SolidDB", "NexusDB", "OpenBase", "FrontBase", "Empress Embedded Database",
      "Raima Database Manager", "Actian Vector", "MonetDB"
    ]
  },
  {
    category: "DATA WAREHOUSE & ANALYTICS (OLAP)",
    systems: [
      "Snowflake", "Amazon Redshift", "Google BigQuery", "Azure Synapse Analytics", "Apache Hive",
      "ClickHouse", "Vertica", "IBM Netezza", "Exasol", "Paraccel", "Yellowbrick", 
      "Kyligence", "Apache Doris", "StarRocks", "Druid", "Apache Pinot", "Kylin", "SQream",
      "Firebolt", "Dremio", "Presto", "Trino", "Amazon Athena", "Databricks SQL"
    ]
  },
  {
    category: "DOCUMENT STORES",
    systems: [
      "MongoDB", "Amazon DocumentDB", "Couchbase", "CouchDB", "Azure Cosmos DB", "Google Cloud Firestore",
      "RavenDB", "RethinkDB", "MarkLogic", "ArangoDB", "OrientDB", "FerretDB", "Marten", "ToroDB",
      "Percona Server for MongoDB", "Cloudant", "IBM Cloudant", "BaseX", "eXist-db", "Sedna"
    ]
  },
  {
    category: "KEY-VALUE & CACHING",
    systems: [
      "Redis", "Amazon DynamoDB", "Memcached", "Riak KV", "Aerospike", "Etcd", "Berkeley DB", 
      "RocksDB", "LevelDB", "Badger", "BoltDB", "KeyDB", "Dragonfly", "Voldemort", "Tarantool", 
      "Hazelcast", "Apache Geode", "FoundationDB", "Oracle NoSQL", "Oracle Coherence", "GridGain", 
      "Apache Ignite", "ZooKeeper", "Consul", "Ehcache", "Infinispan", "MemcacheDB", "Scalaris"
    ]
  },
  {
    category: "WIDE-COLUMN / COLUMN-FAMILY",
    systems: [
      "Apache Cassandra", "Apache HBase", "ScyllaDB", "Google Cloud Bigtable", "Apache Accumulo", 
      "Hypertable", "Apache Kudu", "Amazon Keyspaces", "Azure Table Storage", "Hpe Ezmeral Data Fabric"
    ]
  },
  {
    category: "GRAPH DATABASES",
    systems: [
      "Neo4j", "Amazon Neptune", "TigerGraph", "JanusGraph", "Dgraph", "InfiniteGraph", "FlockDB", 
      "AllegroGraph", "NebulaGraph", "Stardog", "Anzo", "Azure Cosmos DB (Gremlin)", "Apache Giraph",
      "Memgraph", "GraphDB", "Blazegraph", "OrientDB (Graph)", "ArangoDB (Graph)", "Sparksee", "Cayley",
      "TerminusDB", "HugeGraph"
    ]
  },
  {
    category: "TIME-SERIES DATABASES",
    systems: [
      "InfluxDB", "TimescaleDB", "Prometheus", "Kdb+", "QuestDB", "OpenTSDB", "KairosDB", 
      "Graphite", "VictoriaMetrics", "DolphinDB", "TDengine", "GreptimeDB", "Apache IoTDB", "M3DB",
      "Akumuli", "RRDtool", "Warp 10", "Chronicle Queue"
    ]
  },
  {
    category: "SEARCH ENGINES & TEXT ANALYTICS",
    systems: [
      "Elasticsearch", "Splunk", "Apache Solr", "OpenSearch", "Algolia", "Meilisearch", "Graylog", 
      "Loki", "Quickwit", "Manticore Search", "ZincSearch", "Sphinx", "Typesense", "Vespa"
    ]
  },
  {
    category: "VECTOR DATABASES (AI/ML)",
    systems: [
      "Pinecone", "Milvus", "Weaviate", "Qdrant", "Chroma", "Vespa (Vector)", "Vald", "Deep Lake", 
      "LanceDB", "Pgvector", "Marqo", "MyScale", "Faiss"
    ]
  },
  {
    category: "OBJECT-ORIENTED & MULTI-MODEL",
    systems: [
      "InterSystems IRIS", "InterSystems Caché", "ObjectDB", "Db4o", "Versant", "ObjectStore", 
      "GemStone/S", "Wakanda", "Perst", "ZODB", "Matisse", "EyeDB", "VelocityDB"
    ]
  },
  {
    category: "MAINFRAME / LEGACY / HIERARCHICAL",
    systems: [
      "IBM IMS", "IBM VSAM", "CA IDMS", "Software AG Adabas", "Model 204", "GT.M", "MUMPS (M)", 
      "Pick", "Rocket UniVerse", "Rocket UniData", "CA Datacom/DB", "Cincom Supra", "HPE NonStop SQL",
      "OpenEdge (Progress)", "Rocket D3"
    ]
  },
  {
    category: "DESKTOP / EMBEDDED / MOBILE",
    systems: [
      "Microsoft Access", "FileMaker Pro", "Visual FoxPro", "dBASE", "Corel Paradox", "Realm", 
      "LiteDB", "UnQLite", "DuckDB", "PouchDB", "SQLCipher", "H3", "WatermelonDB", "LibreOffice Base",
      "Kexi", "Actian Zen Embedded", "Raima"
    ]
  },
  {
    category: "LEDGER / IMMUTABLE",
    systems: [
      "Amazon QLDB", "Immudb", "BigchainDB", "Fluree", "R3 Corda", "Hyperledger Fabric", 
      "ProvenDB", "LedgerDB"
    ]
  },
  {
    category: "EVENT STREAMING & MESSAGE BROKERS",
    systems: [
      "Apache Kafka", "Confluent", "Redpanda", "Apache Pulsar", "RabbitMQ", "ActiveMQ", 
      "NATS JetStream", "EventStoreDB", "KsqlDB", "Pravega", "Apache RocketMQ"
    ]
  }
];

export const APP_THEME = {
  primary: '#0ea5e9',
  secondary: '#6366f1',
  danger: '#f43f5e',
  warning: '#f59e0b',
  success: '#10b981',
  background: '#020617',
  surface: '#0f172a',
};
