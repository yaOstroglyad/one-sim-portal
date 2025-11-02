/**
 * Title
 * 1-eSIM self-care API Specification
 *
 * The version of the OpenAPI document: 1.0.0
 */

import { UsageInfo } from './usage-info.model';


export interface SubscriberUsage {
    /**
     * Usage information
     */
    data?: Array<UsageInfo>;
}

