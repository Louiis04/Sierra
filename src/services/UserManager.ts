import bcrypt from 'bcrypt';
import { User, UserSession, LoginRequest, RegisterRequest } from '../interfaces/User.interface';
import { UserProfileTree } from '../trees/UserProfileTree';

export class UserManager {
    private users: Map<string, User> = new Map();
    private sessions: Map<string, UserSession> = new Map();
    private userProfiles: Map<string, UserProfileTree> = new Map();

    constructor() {
        // Criar usuário admin padrão para desenvolvimento
        this.createDefaultUser();
    }

    private async createDefaultUser() {
        const adminUser: User = {
            id: 'admin-001',
            username: 'admin',
            email: 'admin@recomenda.ai',
            password: await bcrypt.hash('admin123', 10),
            createdAt: new Date(),
            isActive: true
        };
        
        this.users.set(adminUser.id, adminUser);
        this.userProfiles.set(adminUser.id, new UserProfileTree());
        console.log('👤 Usuário admin criado: admin@recomenda.ai / admin123');
    }

    async register(registerData: RegisterRequest): Promise<{ success: boolean; message: string; userId?: string }> {
        // Validar se email já existe
        const existingUser = Array.from(this.users.values()).find(u => u.email === registerData.email);
        if (existingUser) {
            return { success: false, message: 'Email já está em uso' };
        }

        // Validar se username já existe
        const existingUsername = Array.from(this.users.values()).find(u => u.username === registerData.username);
        if (existingUsername) {
            return { success: false, message: 'Nome de usuário já está em uso' };
        }

        // Criar novo usuário
        const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const hashedPassword = await bcrypt.hash(registerData.password, 10);

        const newUser: User = {
            id: userId,
            username: registerData.username,
            email: registerData.email,
            password: hashedPassword,
            createdAt: new Date(),
            isActive: true
        };

        this.users.set(userId, newUser);
        this.userProfiles.set(userId, new UserProfileTree());

        return { success: true, message: 'Usuário criado com sucesso', userId };
    }

    async login(loginData: LoginRequest): Promise<{ success: boolean; message: string; session?: UserSession }> {
        const user = Array.from(this.users.values()).find(u => u.email === loginData.email);
        
        if (!user || !user.isActive) {
            return { success: false, message: 'Credenciais inválidas' };
        }

        const isPasswordValid = await bcrypt.compare(loginData.password, user.password);
        if (!isPasswordValid) {
            return { success: false, message: 'Credenciais inválidas' };
        }

        // Criar sessão
        const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const session: UserSession = {
            userId: user.id,
            username: user.username,
            email: user.email,
            sessionId,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas
        };

        this.sessions.set(sessionId, session);

        // Atualizar último login
        user.lastLogin = new Date();

        return { success: true, message: 'Login realizado com sucesso', session };
    }

    logout(sessionId: string): boolean {
        return this.sessions.delete(sessionId);
    }

    validateSession(sessionId: string): UserSession | null {
        const session = this.sessions.get(sessionId);
        
        if (!session || session.expiresAt < new Date()) {
            if (session) this.sessions.delete(sessionId);
            return null;
        }

        return session;
    }

    getUserProfile(userId: string): UserProfileTree | null {
        return this.userProfiles.get(userId) || null;
    }

    getUserById(userId: string): User | null {
        return this.users.get(userId) || null;
    }

    getAllUsers(): User[] {
        return Array.from(this.users.values()).map(user => ({
            ...user,
            password: '***'
        }));
    }
}