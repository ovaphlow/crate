export const SECRET = "ovaphlow-=CRAT=-";

export const PROC = parseInt(process.env.PROC || 1, 10);

export const DATACENTER_ID = 14;
export const WORKER_ID = 14;
export const EPOCH = 1288834974657;
export const DB_HOST = process.env.DB_HOST || "127.0.0.1";
export const DB_USERNAME = process.env.DB_USERNAME || "root";
export const DB_PASSWORD = process.env.DB_PASSWORD || "";
export const DB_NAME = process.env.DB_NAME || "ovaphlow";

export const EMAIL_SERVICE = process.env.EMAIL_SERVICE || "qq";
export const EMAIL_USERNAME =
  process.env.EMAIL_USERNAME || "longzhaopin@foxmail.com";
export const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD || "";
