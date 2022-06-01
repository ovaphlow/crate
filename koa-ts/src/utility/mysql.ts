import mysql from "mysql2";

const poolSize = (p: string) => (parseInt(p, 10) || 1) * 2 + 1;

export const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: poolSize(process.env.PROC || ""),
    queueLimit: 0,
});
