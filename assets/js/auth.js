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

    // Mapeo de emails a UUIDs de Supabase
    getStoreUuidMapping() {
        return {
            'carlos@casahogar.com': '049f61f2-c7ff-40d4-8aa1-fd449b9d198a',
            'hola@jugueteriafeliz.com': '1c6744e9-49f1-456a-a4a7-98943ac0b49e',
            'hola@fashionstore.com': '44c682be-bb35-450c-8bdb-cb482de20b32',
            'info@outdoorlife.com.ar': '505e0a23-e880-4051-8d5e-2cae4ebd801b',
            'juan@techstore.com': '6e899453-08c8-4b2a-a6d1-393fc5b0ae73',
            'ventas@perfumeriaglamour.com': '8dca74c7-78fe-414e-9257-dc355712c8a7',
            'ventas@electromax.com.ar': '8dce6c2b-40c8-4d43-9874-1754ed6ccdcf',
            'contacto@libreriasaber.com': 'd0c43a0f-4a10-4ab8-b73d-24a0fd77d8e6',
            'hola@bellapiel.com.ar': 'e7387398-ab0d-45e5-adbc-713e810982d7',
            'contacto@deportesextremos.com': 'f933ba2c-5d40-4da3-ba21-4ce3e77efcf2'
        };
    }

    // Autenticar usuario con Supabase
    async authenticateUser(email, password) {
        // Simular delay de autenticación
        await new Promise(resolve => setTimeout(resolve, 500));
        
        try {
            // Verificar contraseña demo
            if (password !== 'demo123') {
                return null;
            }

            // Obtener UUID de Supabase desde el mapeo
            const storeMapping = this.getStoreUuidMapping();
            const supabaseId = storeMapping[email];

            console.log('🔍 Debug login - Email:', email);
            console.log('🔍 Debug login - UUID encontrado:', supabaseId);

            if (!supabaseId) {
                console.error('❌ Email no encontrado en mapeo:', email);
                console.log('📋 Emails disponibles:', Object.keys(storeMapping));
                return null;
            }

            // Verificar cliente Supabase
            const client = window.supabaseClient;
            if (!client) {
                console.error('❌ Cliente Supabase no disponible');
                throw new Error('Cliente Supabase no disponible');
            }

            // Obtener tienda desde Supabase por UUID
            console.log('🔍 Buscando tienda con UUID:', supabaseId);
            
            const { data: tiendas, error } = await client
                .from('tiendas')
                .select('*')
                .eq('id', supabaseId);

            if (error) {
                console.error('❌ Error obteniendo tienda desde Supabase:', error);
                console.error('❌ Detalle del error:', error.message);
                console.error('❌ UUID buscado:', supabaseId);
                return null;
            }

            console.log('📊 Resultado de búsqueda:', tiendas);
            console.log('📊 Cantidad de tiendas encontradas:', tiendas?.length || 0);

            if (!tiendas || tiendas.length === 0) {
                console.error('❌ Tienda no encontrada en Supabase para UUID:', supabaseId);
                console.log('🔍 Verificar que la tienda existe en Supabase con este UUID');
                
                // Intentar listar todas las tiendas para debug
                const { data: todasTiendas, error: errorTodas } = await client
                    .from('tiendas')
                    .select('id, nombre, email');
                
                if (!errorTodas && todasTiendas) {
                    console.log('📋 Tiendas disponibles en Supabase:', todasTiendas);
                }
                
                return null;
            }

            const tienda = tiendas[0];

            console.log('✅ Tienda autenticada desde Supabase:', tienda.nombre);
            console.log('🔑 UUID de tienda:', supabaseId);
            
            // Agregar el UUID para uso posterior
            tienda.supabase_id = supabaseId;
            return tienda;
            
        } catch (error) {
            console.error('❌ Error en autenticación:', error);
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