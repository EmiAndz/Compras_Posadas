// Servicio para gestión de productos con Supabase
class ProductService {
  constructor() {
    this.supabase = window.supabaseClient || null;
  }

  // Inicializar cliente Supabase
  getClient() {
    if (!this.supabase) {
      this.supabase = window.supabaseClient;
    }
    if (!this.supabase) {
      console.warn('Cliente Supabase no disponible en ProductService');
      return null;
    }
    return this.supabase;
  }

  // Obtener todos los productos con información de tienda y categoría
  async getAllProducts(filters = {}) {
    try {
      const client = this.getClient();

      let query = client
        .from('productos')
        .select(`
          *,
          categorias:categoria_id (
            id,
            nombre,
            icono
          ),
          tiendas:tienda_id (
            id,
            nombre,
            email,
            telefono,
            direccion
          )
        `)
        .eq('activo', true)

      // Aplicar filtros
      if (filters.categoria_id) {
        query = query.eq('categoria_id', filters.categoria_id)
      }

      if (filters.tienda_id) {
        query = query.eq('tienda_id', filters.tienda_id)
      }

      if (filters.destacado) {
        query = query.eq('destacado', true)
      }

      if (filters.termino) {
        query = query.or(`nombre.ilike.%${filters.termino}%,descripcion.ilike.%${filters.termino}%`)
      }

      if (filters.stock_disponible) {
        query = query.gt('stock', 0)
      }

      // Ordenar
      query = query.order('destacado', { ascending: false })
      query = query.order('created_at', { ascending: false })

      // Límite
      if (filters.limit) {
        query = query.limit(filters.limit)
      }

      const { data, error } = await query

      if (error) throw error

      return {
        success: true,
        data: data || [],
        message: 'Productos obtenidos exitosamente'
      }

    } catch (error) {
      console.error('Error obteniendo productos:', error)
      return {
        success: false,
        data: [],
        message: handleSupabaseError(error, 'obtener productos')
      }
    }
  }

  // Obtener productos de una tienda específica
  async getProductsByStore(storeId) {
    try {
      const { data, error } = await this.getClient()
        .from('productos')
        .select(`
          *,
          categorias:categoria_id (
            id,
            nombre,
            icono
          )
        `)
        .eq('tienda_id', storeId)
        .eq('activo', true)
        .order('created_at', { ascending: false })

      if (error) throw error

      return {
        success: true,
        data: data || [],
        message: 'Productos de la tienda obtenidos exitosamente'
      }

    } catch (error) {
      console.error('Error obteniendo productos de tienda:', error)
      return {
        success: false,
        data: [],
        message: handleSupabaseError(error, 'obtener productos de tienda')
      }
    }
  }

  // Obtener productos destacados
  async getFeaturedProducts(limit = 8) {
    return this.getAllProducts({ 
      destacado: true, 
      stock_disponible: true,
      limit: limit 
    })
  }

  // Crear nuevo producto
  async createProduct(productData) {
    try {
      // Validar datos requeridos
      const requiredFields = ['nombre', 'descripcion', 'precio', 'categoria_id', 'tienda_id']
      for (const field of requiredFields) {
        if (!productData[field]) {
          throw new Error(`El campo ${field} es requerido`)
        }
      }

      const { data, error } = await this.getClient()
        .from('productos')
        .insert([{
          nombre: productData.nombre,
          descripcion: productData.descripcion,
          precio: parseFloat(productData.precio),
          imagen: productData.imagen || null,
          categoria_id: productData.categoria_id,
          tienda_id: productData.tienda_id,
          stock: parseInt(productData.stock) || 0,
          destacado: productData.destacado || false,
          especificaciones: productData.especificaciones || {},
          activo: true
        }])
        .select()

      if (error) throw error

      return {
        success: true,
        data: data[0],
        message: 'Producto creado exitosamente'
      }

    } catch (error) {
      console.error('Error creando producto:', error)
      return {
        success: false,
        data: null,
        message: handleSupabaseError(error, 'crear producto')
      }
    }
  }

  // Actualizar producto
  async updateProduct(productId, productData) {
    try {
      const updateData = {}
      
      // Solo incluir campos que se están actualizando
      if (productData.nombre) updateData.nombre = productData.nombre
      if (productData.descripcion) updateData.descripcion = productData.descripcion
      if (productData.precio !== undefined) updateData.precio = parseFloat(productData.precio)
      if (productData.imagen) updateData.imagen = productData.imagen
      if (productData.categoria_id) updateData.categoria_id = productData.categoria_id
      if (productData.stock !== undefined) updateData.stock = parseInt(productData.stock)
      if (productData.destacado !== undefined) updateData.destacado = productData.destacado
      if (productData.especificaciones) updateData.especificaciones = productData.especificaciones
      if (productData.activo !== undefined) updateData.activo = productData.activo

      const { data, error } = await this.getClient()
        .from('productos')
        .update(updateData)
        .eq('id', productId)
        .select()

      if (error) throw error

      return {
        success: true,
        data: data[0],
        message: 'Producto actualizado exitosamente'
      }

    } catch (error) {
      console.error('Error actualizando producto:', error)
      return {
        success: false,
        data: null,
        message: handleSupabaseError(error, 'actualizar producto')
      }
    }
  }

  // Eliminar producto (soft delete)
  async deleteProduct(productId) {
    try {
      const { data, error } = await this.getClient()
        .from('productos')
        .update({ activo: false })
        .eq('id', productId)
        .select()

      if (error) throw error

      return {
        success: true,
        data: data[0],
        message: 'Producto eliminado exitosamente'
      }

    } catch (error) {
      console.error('Error eliminando producto:', error)
      return {
        success: false,
        data: null,
        message: handleSupabaseError(error, 'eliminar producto')
      }
    }
  }

  // Buscar productos
  async searchProducts(termino, filters = {}) {
    return this.getAllProducts({
      ...filters,
      termino: termino
    })
  }

  // Obtener producto por ID
  async getProductById(productId) {
    try {
      const { data, error } = await this.getClient()
        .from('productos')
        .select(`
          *,
          categorias:categoria_id (
            id,
            nombre,
            icono
          ),
          tiendas:tienda_id (
            id,
            nombre,
            email,
            telefono,
            direccion
          )
        `)
        .eq('id', productId)
        .eq('activo', true)
        .single()

      if (error) throw error

      return {
        success: true,
        data: data,
        message: 'Producto obtenido exitosamente'
      }

    } catch (error) {
      console.error('Error obteniendo producto:', error)
      return {
        success: false,
        data: null,
        message: handleSupabaseError(error, 'obtener producto')
      }
    }
  }

  // Obtener estadísticas de productos de una tienda
  async getStoreStats(storeId) {
    try {
      const { data, error } = await this.getClient()
        .from('productos')
        .select('id, stock, destacado, activo')
        .eq('tienda_id', storeId)

      if (error) throw error

      const stats = {
        total: data.length,
        activos: data.filter(p => p.activo).length,
        conStock: data.filter(p => p.activo && p.stock > 0).length,
        sinStock: data.filter(p => p.activo && p.stock === 0).length,
        destacados: data.filter(p => p.activo && p.destacado).length
      }

      return {
        success: true,
        data: stats,
        message: 'Estadísticas obtenidas exitosamente'
      }

    } catch (error) {
      console.error('Error obteniendo estadísticas:', error)
      return {
        success: false,
        data: null,
        message: handleSupabaseError(error, 'obtener estadísticas')
      }
    }
  }
}

// Crear instancia global
window.productService = new ProductService()

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProductService
}
