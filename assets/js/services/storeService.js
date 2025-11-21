// Servicio para gestión de tiendas con Supabase
class StoreService {
  constructor() {
    this.supabase = window.supabaseClient || window.supabase;
  }

  // Obtener todas las tiendas activas
  async getAllStores() {
    try {
      const { data, error } = await this.supabase
        .from('tiendas')
        .select('*')
        .eq('activa', true)
        .order('created_at', { ascending: true })

      if (error) throw error

      return {
        success: true,
        data: data || [],
        message: 'Tiendas obtenidas exitosamente'
      }

    } catch (error) {
      console.error('Error obteniendo tiendas:', error)
      return {
        success: false,
        data: [],
        message: handleSupabaseError(error, 'obtener tiendas')
      }
    }
  }

  // Obtener tienda por ID
  async getStoreById(storeId) {
    try {
      const { data, error } = await this.supabase
        .from('tiendas')
        .select('*')
        .eq('id', storeId)
        .eq('activa', true)
        .single()

      if (error) throw error

      return {
        success: true,
        data: data,
        message: 'Tienda obtenida exitosamente'
      }

    } catch (error) {
      console.error('Error obteniendo tienda:', error)
      return {
        success: false,
        data: null,
        message: handleSupabaseError(error, 'obtener tienda')
      }
    }
  }

  // Obtener tienda por email
  async getStoreByEmail(email) {
    try {
      const { data, error } = await this.supabase
        .from('tiendas')
        .select('*')
        .eq('email', email)
        .eq('activa', true)
        .single()

      if (error) throw error

      return {
        success: true,
        data: data,
        message: 'Tienda obtenida exitosamente'
      }

    } catch (error) {
      console.error('Error obteniendo tienda por email:', error)
      return {
        success: false,
        data: null,
        message: handleSupabaseError(error, 'obtener tienda')
      }
    }
  }

  // Crear nueva tienda
  async createStore(storeData) {
    try {
      // Validar datos requeridos
      const requiredFields = ['nombre', 'propietario', 'email']
      for (const field of requiredFields) {
        if (!storeData[field]) {
          throw new Error(`El campo ${field} es requerido`)
        }
      }

      // Verificar que el email no esté en uso
      const existingStore = await this.getStoreByEmail(storeData.email)
      if (existingStore.success && existingStore.data) {
        throw new Error('Ya existe una tienda con este email')
      }

      const { data, error } = await this.supabase
        .from('tiendas')
        .insert([{
          nombre: storeData.nombre,
          descripcion: storeData.descripcion || '',
          logo: storeData.logo || null,
          propietario: storeData.propietario,
          email: storeData.email,
          telefono: storeData.telefono || null,
          direccion: storeData.direccion || null,
          activa: true,
          verificada: false
        }])
        .select()

      if (error) throw error

      return {
        success: true,
        data: data[0],
        message: 'Tienda creada exitosamente'
      }

    } catch (error) {
      console.error('Error creando tienda:', error)
      return {
        success: false,
        data: null,
        message: handleSupabaseError(error, 'crear tienda')
      }
    }
  }

  // Actualizar tienda
  async updateStore(storeId, storeData) {
    try {
      const updateData = {}
      
      // Solo incluir campos que se están actualizando
      if (storeData.nombre) updateData.nombre = storeData.nombre
      if (storeData.descripcion !== undefined) updateData.descripcion = storeData.descripcion
      if (storeData.logo) updateData.logo = storeData.logo
      if (storeData.propietario) updateData.propietario = storeData.propietario
      if (storeData.telefono !== undefined) updateData.telefono = storeData.telefono
      if (storeData.direccion !== undefined) updateData.direccion = storeData.direccion
      if (storeData.activa !== undefined) updateData.activa = storeData.activa
      if (storeData.verificada !== undefined) updateData.verificada = storeData.verificada

      const { data, error } = await this.supabase
        .from('tiendas')
        .update(updateData)
        .eq('id', storeId)
        .select()

      if (error) throw error

      return {
        success: true,
        data: data[0],
        message: 'Tienda actualizada exitosamente'
      }

    } catch (error) {
      console.error('Error actualizando tienda:', error)
      return {
        success: false,
        data: null,
        message: handleSupabaseError(error, 'actualizar tienda')
      }
    }
  }

  // Desactivar tienda (soft delete)
  async deactivateStore(storeId) {
    try {
      const { data, error } = await this.supabase
        .from('tiendas')
        .update({ activa: false })
        .eq('id', storeId)
        .select()

      if (error) throw error

      return {
        success: true,
        data: data[0],
        message: 'Tienda desactivada exitosamente'
      }

    } catch (error) {
      console.error('Error desactivando tienda:', error)
      return {
        success: false,
        data: null,
        message: handleSupabaseError(error, 'desactivar tienda')
      }
    }
  }

  // Buscar tiendas
  async searchStores(termino) {
    try {
      const { data, error } = await this.supabase
        .from('tiendas')
        .select('*')
        .eq('activa', true)
        .or(`nombre.ilike.%${termino}%,descripcion.ilike.%${termino}%,propietario.ilike.%${termino}%`)
        .order('nombre', { ascending: true })

      if (error) throw error

      return {
        success: true,
        data: data || [],
        message: 'Búsqueda de tiendas completada'
      }

    } catch (error) {
      console.error('Error buscando tiendas:', error)
      return {
        success: false,
        data: [],
        message: handleSupabaseError(error, 'buscar tiendas')
      }
    }
  }

  // Obtener tiendas con estadísticas de productos
  async getStoresWithStats() {
    try {
      const { data: stores, error: storesError } = await this.supabase
        .from('tiendas')
        .select(`
          *,
          productos:productos(count)
        `)
        .eq('activa', true)
        .order('nombre', { ascending: true })

      if (storesError) throw storesError

      // Obtener estadísticas adicionales para cada tienda
      const storesWithStats = await Promise.all(
        stores.map(async (store) => {
          const { data: productStats, error: statsError } = await this.supabase
            .from('productos')
            .select('stock, destacado, activo')
            .eq('tienda_id', store.id)

          if (statsError) {
            console.warn(`Error obteniendo stats para tienda ${store.id}:`, statsError)
            return {
              ...store,
              stats: {
                total_productos: 0,
                productos_activos: 0,
                productos_destacados: 0,
                productos_con_stock: 0
              }
            }
          }

          const stats = {
            total_productos: productStats.length,
            productos_activos: productStats.filter(p => p.activo).length,
            productos_destacados: productStats.filter(p => p.activo && p.destacado).length,
            productos_con_stock: productStats.filter(p => p.activo && p.stock > 0).length
          }

          return {
            ...store,
            stats
          }
        })
      )

      return {
        success: true,
        data: storesWithStats,
        message: 'Tiendas con estadísticas obtenidas exitosamente'
      }

    } catch (error) {
      console.error('Error obteniendo tiendas con stats:', error)
      return {
        success: false,
        data: [],
        message: handleSupabaseError(error, 'obtener tiendas con estadísticas')
      }
    }
  }

  // Verificar disponibilidad de email
  async checkEmailAvailability(email, excludeId = null) {
    try {
      let query = this.supabase
        .from('tiendas')
        .select('id')
        .eq('email', email)

      if (excludeId) {
        query = query.neq('id', excludeId)
      }

      const { data, error } = await query

      if (error) throw error

      return {
        success: true,
        available: data.length === 0,
        message: data.length === 0 ? 'Email disponible' : 'Email ya está en uso'
      }

    } catch (error) {
      console.error('Error verificando disponibilidad de email:', error)
      return {
        success: false,
        available: false,
        message: handleSupabaseError(error, 'verificar email')
      }
    }
  }
}

// Crear instancia global
window.storeService = new StoreService()

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StoreService
}