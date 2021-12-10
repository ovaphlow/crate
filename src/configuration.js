module.exports = {
  SECRET: 'ovaphlow-=CRAT=-',

  NODE_PROC: parseInt(process.env.NODE_PROC || 1, 10),

  DB_HOST: process.env.DB_HOST || '127.0.0.1',
  DB_USERNAME: process.env.DB_USERNAME || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_NAME: process.env.DB_NAME || 'ovaphlow',

  EMAIL_SERVICE: process.env.EMAIL_SERVICE || 'qq',
  EMAIL_USERNAME: process.env.EMAIL_USERNAME || 'longzhaopin@foxmail.com',
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || '',

  PUBLIC_KEY: `-----BEGIN PUBLIC KEY-----
  MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEcmjmkELYFMTyYXNx6+n0Gm3HRZEF
  D+h3wh1qzJVYhv5bnvJkGzfkNsG/B5EuNMKudTCZKn7ZIDIyExSxMRynNg==
  -----END PUBLIC KEY-----`,
  PRIVATE_KEY: `-----BEGIN PRIVATE KEY-----
  MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgUzCKw1sBGLgFlVzx
  srKbV+2wyIuVr7wqBNf9rVUEkxyhRANCAARyaOaQQtgUxPJhc3Hr6fQabcdFkQUP
  6HfCHWrMlViG/lue8mQbN+Q2wb8HkS40wq51MJkqftkgMjITFLExHKc2
  -----END PRIVATE KEY-----`,
};
