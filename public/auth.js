class AuthManager {
    constructor() {
        this.user = null;
        this.checkAuthStatus();
    }

    async checkAuthStatus() {
        try {
            const response = await fetch('/api/auth/me', {
                credentials: 'include'
            });
            
            if (response.ok) {
                this.user = await response.json();
                this.updateUI();
            } else {
                this.redirectToLogin();
            }
        } catch (error) {
            console.error('Erro ao verificar autenticação:', error);
            this.redirectToLogin();
        }
    }

    updateUI() {
        const userInfo = document.getElementById('user-info');
        if (userInfo && this.user) {
            userInfo.innerHTML = `
                <div class="user-info">
                    <span class="user-name">👤 Olá, ${this.user.username}!</span>
                    <button id="logout-btn" class="logout-btn">🚪 Sair</button>
                </div>
            `;

            // Adicionar evento de logout
            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', () => {
                    this.logout();
                });
            }
        }
    }

    async logout() {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });
        } catch (error) {
            console.error('Erro no logout:', error);
        } finally {
            localStorage.removeItem('user');
            window.location.href = '/login.html';
        }
    }

    redirectToLogin() {
        if (!window.location.pathname.includes('login.html')) {
            window.location.href = '/login.html';
        }
    }

    getUser() {
        return this.user;
    }

    getAuthHeaders() {
        return {
            'Content-Type': 'application/json'
        };
    }
}

// Instanciar o gerenciador de autenticação
const authManager = new AuthManager();