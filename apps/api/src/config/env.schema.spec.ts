import { validateEnv } from './env.schema';

const base = {
  DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
  JWT_SECRET: 'x'.repeat(32),
  PASSWORD_PEPPER: 'y'.repeat(32),
};

describe('validateEnv', () => {
  it('allows development defaults', () => {
    expect(() =>
      validateEnv({ ...base, CHECK_ALLOW_PRIVATE_NETWORKS: 'true' }),
    ).not.toThrow();
  });

  it('rejects private network checks in production', () => {
    expect(() =>
      validateEnv({
        ...base,
        NODE_ENV: 'production',
        WEB_APP_URL: 'https://app.example.com',
        CHECK_ALLOW_PRIVATE_NETWORKS: 'true',
      }),
    ).toThrow(/CHECK_ALLOW_PRIVATE_NETWORKS/);
  });

  it('rejects a localhost web app URL in production', () => {
    expect(() => validateEnv({ ...base, NODE_ENV: 'production' })).toThrow(
      /WEB_APP_URL/,
    );
  });

  it('accepts a complete production configuration', () => {
    expect(() =>
      validateEnv({
        ...base,
        NODE_ENV: 'production',
        WEB_APP_URL: 'https://app.example.com',
      }),
    ).not.toThrow();
  });
});
