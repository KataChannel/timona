import { User } from '../models/user.model';
export declare class AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
    redirectUrl?: string;
}
export declare class TokenResponse {
    accessToken: string;
    refreshToken: string;
}
