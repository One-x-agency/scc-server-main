/* eslint-disable @typescript-eslint/no-explicit-any */
import { Pool, types, PoolConfig } from 'pg';
import Parameter from './parameter.js';

import Vars from '@/config/var.js';

const { database } = Vars;

const dbConfig: PoolConfig = {
  user: database.user,
  password: database.password,
  host: database.host,
  database: database.database,
  port: database.port,
  max: 80,

  connectionTimeoutMillis: 30000, // i.e. "connect_timeout" // (30 seconds X 1000 milliseconds)
  idleTimeoutMillis: 900000, // (15 minutes X 60 seconds X 1000 milliseconds)
  statement_timeout: 30000, // (30 seconds X 1000 milliseconds)
  query_timeout: 30000, // (30 seconds X 1000 milliseconds)
};

if (database.sslMode) {
  dbConfig.ssl = {
    rejectUnauthorized: false,
  };
}

const pool = new Pool(dbConfig);

// types.setTypeParser(1114, (dateStr) => new Date(`${dateStr} UTC`));
types.setTypeParser(1700, (val) => parseFloat(val));

function convertNamedQueryToPositional(sqlStmt: string, params: object) {
  const values = [];
  const fields = [];
  let paramIndex = 1;

  const newQueryText = sqlStmt.replace(/\$\w+/g, (match: string) => {
    const paramName = match.substring(1); // Remove the $
    fields.push(paramName);
    values.push(params[paramName]);
    const result = `$${paramIndex}`;
    paramIndex += 1;
    return result;
  });

  return { sqlStmt: newQueryText, params: values };
}

function convertStringLiteralToQuery(strings: string[], ...values: any[]) {
  return {
    sqlStmt: strings.reduce((query: string, str: string, i: number) => query + str + (i < values.length ? `$${i + 1}` : ''), ''),
    params: values,
  };

}

async function getConnection() {
  const client = await pool.connect();

  async function queryAll<T = any>(sqlStmt: string, params?: any[]): Promise<T[]> {
    const res = await client.query(sqlStmt, params);
    return res.rows;
  }

  async function queryOne<T = any>(sqlStmt: string, params?: any[]): Promise<T | null> {
    const res = await queryAll<T>(sqlStmt, params);
    return res[0];
  }

  async function namedQueryAll<T = any>(sqlStmt: string, params?: object): Promise<T[]> {
    const newQuery = convertNamedQueryToPositional(sqlStmt, params);
    const res = await queryAll<T>(newQuery.sqlStmt, newQuery.params);
    return res;
  }

  async function namedQueryOne<T = any>(sqlStmt: string, params?: object): Promise<T | null> {
    const res = await namedQueryAll<T>(sqlStmt, params);
    return res[0];
  }

  async function queryLiteralAll<T = any>(strings: string[], ...values: any[]): Promise<T[]> {
    const newQuery = convertStringLiteralToQuery(strings, ...values);
    const res = await queryAll<T>(newQuery.sqlStmt, newQuery.params);
    return res;
  }

  async function queryLiteralOne<T = any>(strings: string[], ...values: any[]): Promise<T | null> {
    const res = await queryLiteralAll<T>(strings, ...values);
    return res[0];
  }

  const obj = {
    client,
    query: (sqlStmt: string, params?: any[]) => client.query(sqlStmt, params),
    release: () => client.release(),
    namedQueryAll,
    namedQueryOne,
    queryAll,
    queryOne,
    queryLiteralAll,
    queryLiteralOne,
  };

  return obj;
}

export type DatabaseClient = Awaited<ReturnType<typeof getConnection>>;

export default {
  pool,
  getConnection,
  parameter: (): Parameter => new Parameter(),
};
