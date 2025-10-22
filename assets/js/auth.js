// Sistema de autenticación para vendedores
class AuthManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkExistingSession();
    }

    setupEventListeners() {
        const form = document.getElementById('login-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleLogin(e));
        }
    }

    // Verificar si ya hay una sesión activa
    checkExistingSession() {
        const currentUser = localStorage.getItem('currentStore');
        if (currentUser && window.location.pathname.includes('login-vendedor.html')) {
            window.location.href = 'panel-vendedor.html';
        }
    }

    // Manejar login
    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        try {
            const user = await this.authenticateUser(email, password);
            
            if (user) {
                // Guardar sesión
                localStorage.setItem('currentStore', JSON.stringify(user));
                localStorage.setItem('currentStoreId', user.id);
                
                // Redirigir al panel
                window.location.href = 'panel-vendedor.html';
            } else {
                this.showError('Credenciales incorrectas. Verifica tu email y contraseña.');
            }
        } catch (error) {
            console.error('Error en login:', error);
            this.showError('Error de conexión. Inténtalo nuevamente.');
        }
    }

    // Autenticar usuario (simulado)
    async authenticateUser(email, password) {
        // Simular delay de autenticación
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Cargar datos de tiendas
        try {
            const response = await fetch('assets/data/tiendas.json');
            const tiendas = await response.json();
            
            // Buscar tienda por email
            const tienda = tiendas.find(t => t.email === email);
            
            if (tienda && password === 'demo123') { // Contraseña demo
                return tienda;
            }
            
            return null;
        } catch (error) {
            console.error('Error cargando tiendas:', error);
            return null;
        }
    }

    // Mostrar error
    showError(message) {
        document.getElementById('error-message').textContent = message;
        document.getElementById('error-modal').classList.remove('hidden');
        document.getElementById('error-modal').classList.add('flex');
    }

    // Cerrar sesión
    static logout() {
        localStorage.removeItem('currentStore');
        localStorage.removeItem('currentStoreId');
        window.location.href = 'login-vendedor.html';
    }

    // Obtener usuario actual
    static getCurrentStore() {
        const storeData = localStorage.getItem('currentStore');
        return storeData ? JSON.parse(storeData) : null;
    }

    // Verificar autenticación
    static isAuthenticated() {
        return localStorage.getItem('currentStore') !== null;
    }

    // Proteger páginas que requieren autenticación
    static requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = 'login-vendedor.html';
            return false;
        }
        return true;
    }
}

// Funciones globales
function fillDemo(email, password) {
    document.getElementById('email').value = email;
    document.getElementById('password').value = password;
}

function closeErrorModal() {
    document.getElementById('error-modal').classList.add('hidden');
    document.getElementById('error-modal').classList.remove('flex');
}

// Inicializar cuando la página esté cargada
document.addEventListener('DOMContentLoaded', () => {
    new AuthManager();
});