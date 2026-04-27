/**
 * Client-side errors from auth HTTP API (no raw secrets).
 */
export const AUTH_ERR_NETWORK = 'AUTH_ERR_NETWORK' as const;
export const AUTH_ERR_UNAUTHORIZED = 'AUTH_ERR_UNAUTHORIZED' as const;
export const AUTH_ERR_BAD_REQUEST = 'AUTH_ERR_BAD_REQUEST' as const;
export const AUTH_ERR_FORBIDDEN = 'AUTH_ERR_FORBIDDEN' as const;
export const AUTH_ERR_RATE = 'AUTH_ERR_RATE' as const;
export const AUTH_ERR_DELIVERY = 'AUTH_ERR_DELIVERY' as const;
export const AUTH_ERR_SERVER = 'AUTH_ERR_SERVER' as const;
export const AUTH_ERR_UNKNOWN = 'AUTH_ERR_UNKNOWN' as const;

export class AuthApiError extends Error {
  override readonly name = 'AuthApiError';

  constructor(
    public readonly code: string,
    message: string,
    public readonly httpStatus?: number,
    public readonly serverCode?: string,
  ) {
    super(message);
  }
}
