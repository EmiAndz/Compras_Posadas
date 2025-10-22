// Servicio para gestión de categorías con Supabase
class CategoryService {
  constructor() {
    this.supabase = window.supabaseClient
  }

  // Obtener todas las categorías activas
  async getAllCategories() {
    try {
      const { data, error } = await this.supabase
        .from('categorias')
        .select('*')
        .eq('activa', true)
        .order('nombre', { ascending: true })

      if (error) throw error

      return {
        success: true,
        data: data || [],
        message: 'Categorías obtenidas exitosamente'
      }

    } catch (error) {
      console.error('Error obteniendo categorías:', error)
      return {
        success: false,
        data: [],
        message: handleSupabaseError(error, 'obtener categorías')
      }
    }
  }

  // Obtener categoría por ID
  async getCategoryById(categoryId) {
    try {
      const { data, error } = await this.supabase
        .from('categorias')
        .select('*')
        .eq('id', categoryId)
        .eq('activa', true)
        .single()

      if (error) throw error

      return {
        success: true,
        data: data,
        message: 'Categoría obtenida exitosamente'
      }

    } catch (error) {
      console.error('Error obteniendo categoría:', error)
      return {
        success: false,
        data: null,
        message: handleSupabaseError(error, 'obtener categoría')
      }
    }
  }

  // Obtener categorías con contador de productos
  async getCategoriesWithProductCount() {
    try {
      const { data, error } = await this.supabase
        .from('categorias')
        .select(`
          *,
          productos:productos(count)
        `)
        .eq('activa', true)
        .order('nombre', { ascending: true })

      if (error) throw error

      return {
        success: true,
        data: data || [],
        message: 'Categorías con contadores obtenidas exitosamente'
      }

    } catch (error) {
      console.error('Error obteniendo categorías con contadores:', error)
      return {
        success: false,
        data: [],
        message: handleSupabaseError(error, 'obtener categorías con contadores')
      }
    }
  }

  // Crear nueva categoría
  async createCategory(categoryData) {
    try {
      // Validar datos requeridos
      if (!categoryData.nombre) {
        throw new Error('El nombre de la categoría es requerido')
      }

      const { data, error } = await this.supabase
        .from('categorias')
        .insert([{
          nombre: categoryData.nombre,
          descripcion: categoryData.descripcion || '',
          icono: categoryData.icono || '📦',
          activa: true
        }])
        .select()

      if (error) throw error

      return {
        success: true,
        data: data[0],
        message: 'Categoría creada exitosamente'
      }

    } catch (error) {
      console.error('Error creando categoría:', error)
      return {
        success: false,
        data: null,
        message: handleSupabaseError(error, 'crear categoría')
      }
    }
  }

  // Actualizar categoría
  async updateCategory(categoryId, categoryData) {
    try {
      const updateData = {}
      
      // Solo incluir campos que se están actualizando
      if (categoryData.nombre) updateData.nombre = categoryData.nombre
      if (categoryData.descripcion !== undefined) updateData.descripcion = categoryData.descripcion
      if (categoryData.icono) updateData.icono = categoryData.icono
      if (categoryData.activa !== undefined) updateData.activa = categoryData.activa

      const { data, error } = await this.supabase
        .from('categorias')
        .update(updateData)
        .eq('id', categoryId)
        .select()

      if (error) throw error

      return {
        success: true,
        data: data[0],
        message: 'Categoría actualizada exitosamente'
      }

    } catch (error) {
      console.error('Error actualizando categoría:', error)
      return {
        success: false,
        data: null,
        message: handleSupabaseError(error, 'actualizar categoría')
      }
    }
  }

  // Desactivar categoría (soft delete)
  async deactivateCategory(categoryId) {
    try {
      const { data, error } = await this.supabase
        .from('categorias')
        .update({ activa: false })
        .eq('id', categoryId)
        .select()

      if (error) throw error

      return {
        success: true,
        data: data[0],
        message: 'Categoría desactivada exitosamente'
      }

    } catch (error) {
      console.error('Error desactivando categoría:', error)
      return {
        success: false,
        data: null,
        message: handleSupabaseError(error, 'desactivar categoría')
      }
    }
  }
}

// Crear instancia global
window.categoryService = new CategoryService()

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CategoryService
}