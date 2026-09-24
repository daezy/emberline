process.env.NODE_ENV = 'test';
process.env.DATABASE_URL ??= 'postgresql://test:test@localhost:5432/test';
process.env.JWT_SECRET ??= 'test-secret-that-is-at-least-32-characters-long';
process.env.PASSWORD_PEPPER ??=
  'test-pepper-that-is-at-least-32-characters-long';
process.env.WORKER_ENABLED ??= 'false';
process.env.LOG_LEVEL ??= 'fatal';
