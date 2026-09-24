// Drizzle wraps driver errors in DrizzleQueryError; the Postgres code lives on
// the cause.
function pgErrorCode(error: unknown): string | undefined {
  for (let current = error; current;) {
    if (typeof current !== 'object') return undefined;
    if ('code' in current && typeof current.code === 'string') {
      return current.code;
    }
    current = 'cause' in current ? current.cause : undefined;
  }
  return undefined;
}

export function isUniqueViolation(error: unknown): boolean {
  return pgErrorCode(error) === '23505';
}

export function isForeignKeyViolation(error: unknown): boolean {
  return pgErrorCode(error) === '23503';
}
