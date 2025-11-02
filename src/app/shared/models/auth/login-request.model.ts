/**
 * Title
 * 1-eSIM self-care API Specification
 *
 * The version of the OpenAPI document: 1.0.0
 */

export interface LoginRequest {
    /**
     * Login name of the subscriber
     */
    loginName: string;
    /**
     * Password of the subscriber
     */
    password: string;
    /**
     * Remember me
     */
    rememberMe?: boolean;
}

