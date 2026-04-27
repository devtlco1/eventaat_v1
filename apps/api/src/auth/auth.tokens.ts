/**
 * JWT access payload (English keys only; issued by AuthService / JwtService).
 */
export const ACCESS_JWT_TYPE = 'access' as const;

export type AccessTokenPayload = {
  sub: string;
  /** UserSession.id */
  sid: string;
  typ: typeof ACCESS_JWT_TYPE;
  /** standard JWT iat / exp are added by the library */
};

export function isAccessPayload(p: object | null): p is AccessTokenPayload {
  if (p == null || typeof p !== 'object') return false;
  const o = p as Record<string, unknown>;
  return (
    typeof o.sub === 'string' && typeof o.sid === 'string' && o.typ === ACCESS_JWT_TYPE
  );
}
