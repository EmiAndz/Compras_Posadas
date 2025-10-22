// Configuración de Supabase
// Reemplaza estas URLs con las de tu proyecto
const SUPABASE_URL = 'https://ckcbzeizzjhnbhdaenrg.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNrY2J6ZWl6empobmJoZGFlbnJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwNjI5NDAsImV4cCI6MjA3NTYzODk0MH0.YKgnKRG4UdS2BQPyzjIhe7wtXufIxr_p6drnurQyE_U'

// Variable global para el cliente
let supabase = null;

// Función para inicializar Supabase
function initializeSupabase() {
  try {
    // Verificar si Supabase está disponible
    if (typeof window.supabase === 'undefined') {
      console.warn('⚠️ Supabase SDK no está cargado');
      return null;
    }

    // Crear cliente de Supabase
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      },
      realtime: {
        enabled: true
      }
    });

    console.log('✅ Cliente Supabase inicializado correctamente');
    return supabase;

  } catch (error) {
    console.error('❌ Error inicializando Supabase:', error);
    return null;
  }
}

// Verificar conexión
async function testSupabaseConnection() {
  try {
    if (!supabase) {
      console.warn('⚠️ Cliente Supabase no inicializado');
      return false;
    }

    const { data, error } = await supabase
      .from('categorias')
      .select('count(*)')
      .limit(1)
    
    if (error) {
      console.error('Error conectando a Supabase:', error)
      return false
    }
    
    console.log('✅ Conexión a Supabase exitosa')
    return true
  } catch (error) {
    console.error('❌ No se pudo conectar a Supabase:', error)
    return false
  }
}

// Función para manejar errores de Supabase
function handleSupabaseError(error, context = '') {
  console.error(`Error en ${context}:`, error)
  
  // Mostrar mensaje amigable al usuario
  let message = 'Ha ocurrido un error. Inténtalo nuevamente.'
  
  if (error.code === 'PGRST116') {
    message = 'No se encontraron resultados.'
  } else if (error.code === '23505') {
    message = 'Ya existe un registro con estos datos.'
  } else if (error.code === '42501') {
    message = 'No tienes permisos para realizar esta acción.'
  } else if (error.message.includes('JWT')) {
    message = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'
  }
  
  return message
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  // Inicializar Supabase
  const client = initializeSupabase();
  
  // Exportar para uso global
  window.supabaseClient = client;
  window.testSupabaseConnection = testSupabaseConnection;
  window.handleSupabaseError = handleSupabaseError;
  
  // Verificar conexión en desarrollo
  if (client && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    setTimeout(() => {
      testSupabaseConnection();
    }, 1000);
  }
});

// Log de carga del script
console.log('📡 Script de configuración Supabase cargado');