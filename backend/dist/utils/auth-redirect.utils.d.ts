export declare function getAuthRedirectSettings(): Promise<Record<string, string>>;
export declare function getLoginRedirectUrl(userId: string): Promise<string>;
export declare function getLogoutRedirectUrl(): Promise<string>;
export declare function getRegisterRedirectUrl(): Promise<string>;
export declare function getAuthSetting(key: string): Promise<string | null>;
export declare function updateAuthRedirectSetting(key: string, value: string, userId?: string): Promise<void>;
