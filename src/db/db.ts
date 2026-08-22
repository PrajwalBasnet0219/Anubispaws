import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("localhost")
    ? false
    : { rejectUnauthorized: false },
});

function toPgSql(sql: string): string {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

type ResultRow = Record<string, any>;

async function run(rawSql: string, params: any[] = []): Promise<any[]> {
  const sql = rawSql.trim();
  const statement = sql.split(/\s+/)[0]?.toUpperCase() ?? "";

  if (statement === "INSERT") {
    const hasReturning = /\breturning\b/i.test(sql);
    const finalSql = hasReturning ? toPgSql(sql) : `${toPgSql(sql)} RETURNING id`;
    const res = await pool.query(finalSql, params);
    const okPacket: any = {
      insertId: res.rows[0]?.id ?? 0,
      affectedRows: res.rowCount ?? 0,
    };
    return [okPacket];
  }

  if (statement === "UPDATE" || statement === "DELETE") {
    const res = await pool.query(toPgSql(sql), params);
    const okPacket: any = { affectedRows: res.rowCount ?? 0 };
    return [okPacket];
  }

  const res = await pool.query(toPgSql(sql), params);
  return [res.rows as ResultRow[]];
}

const db = {
  execute: run,
  query: run,
  async getConnection() {
    return {
      execute: run,
      query: run,
      release: () => {},
    };
  },
};

export default db;
