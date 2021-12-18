export const SECRET = 'ovaphlow-=CRAT=-';

export const PROC = parseInt(process.env.PROC || 1, 10);

export const DATACENTER_ID = 3420;
export const WORKER_ID = 3420;
export const EPOCH = 1639191301218;
export const DB_HOST = process.env.DB_HOST || '127.0.0.1';
export const DB_USERNAME = process.env.DB_USERNAME || 'root';
export const DB_PASSWORD = process.env.DB_PASSWORD || '';
export const DB_NAME = process.env.DB_NAME || 'ovaphlow';

export const EMAIL_SERVICE = process.env.EMAIL_SERVICE || 'qq';
export const EMAIL_USERNAME = process.env.EMAIL_USERNAME || 'longzhaopin@foxmail.com';
export const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD || '';

export const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEcmjmkELYFMTyYXNx6+n0Gm3HRZEF
D+h3wh1qzJVYhv5bnvJkGzfkNsG/B5EuNMKudTCZKn7ZIDIyExSxMRynNg==
-----END PUBLIC KEY-----`;
export const PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgUzCKw1sBGLgFlVzx
srKbV+2wyIuVr7wqBNf9rVUEkxyhRANCAARyaOaQQtgUxPJhc3Hr6fQabcdFkQUP
6HfCHWrMlViG/lue8mQbN+Q2wb8HkS40wq51MJkqftkgMjITFLExHKc2
-----END PRIVATE KEY-----`;
