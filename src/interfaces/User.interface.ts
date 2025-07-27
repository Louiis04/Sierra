export interface User {
    id: string;
    username: string;
    email: string;
    password: string;
    createdAt: Date;
    lastLogin?: Date;
    isActive: boolean;
}

export interface UserSession {
    userId: string;
    username: string;
    email: string;
    sessionId: string;
    expiresAt: Date;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
}