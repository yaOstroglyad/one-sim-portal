/**
 * Title
 * 1-eSIM self-care API Specification
 *
 * The version of the OpenAPI document: 1.0.0
 */

export interface LoginResponse {
    /**
     * JWT token
     */
    token: string;
    /**
     * Refresh token
     */
    refreshToken?: string;
    /**
     * Token type
     */
    tokenType?: string;
    /**
     * Token expiration time in seconds
     */
    expiresIn?: number;
    /**
     * Token scope
     */
    scope?: string;
    /**
     * Token identifier
     */
    jti?: string;
}

