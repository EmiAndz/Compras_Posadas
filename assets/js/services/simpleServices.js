// Servicios simplificados para Supabase - SOLO SUPABASE
class SimpleSupabaseService {
  static getClient() {
    const client = window.supabaseClient;
    if (!client) {
      console.error('❌ Cliente Supabase no disponible');
      throw new Error('Cliente Supabase no disponible. Verifica tu conexión y configuración.');
    }
    return client;
  }

  // Obtener todos los productos
  static async getAllProducts() {
    try {
      console.log('📡 Obteniendo productos desde Supabase...');
      const client = this.getClient();

      const { data, error } = await client
        .from('productos')
        .select(`
          *,
          categorias!inner (
            id,
            nombre,
            icono
          ),
          tiendas!inner (
            id,
            nombre,
            email
          )
        `)
        .order('destacado', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error obteniendo productos:', error);
        console.error('Detalles del error:', error.message);
        
        // Fallback: obtener productos sin JOIN
        console.log('🔄 Intentando obtener productos sin relaciones...');
        const { data: fallbackData, error: fallbackError } = await client
          .from('productos')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (fallbackError) {
          console.error('❌ Error en fallback:', fallbackError);
          return { success: false, data: [], error: fallbackError.message };
        }
        
        console.log(`✅ ${fallbackData?.length || 0} productos obtenidos (sin relaciones)`);
        return { success: true, data: fallbackData || [] };
      }

      console.log(`✅ ${data?.length || 0} productos obtenidos desde Supabase`);
      return {
        success: true,
        data: data || []
      };

    } catch (error) {
      console.error('❌ Error creando producto:', error);
      return { success: false, data: null, error: error.message };
    }
  }

  // Eliminar producto
  static async deleteProduct(productId) {
    try {
      console.log(`📡 Eliminando producto ${productId} desde Supabase...`);
      const client = this.getClient();

      const { error } = await client
        .from('productos')
        .delete()
        .eq('id', productId);

      if (error) {
        console.error('❌ Error eliminando producto:', error);
        throw error;
      }

      console.log('✅ Producto eliminado exitosamente de Supabase');
      return {
        success: true,
        message: 'Producto eliminado exitosamente'
      };

    } catch (error) {
      console.error('❌ Error eliminando producto:', error);
      return { success: false, error: error.message };
    }
  }

  // Obtener productos destacados
  static async getFeaturedProducts(limit = 8) {
    try {
      console.log('📡 Obteniendo productos destacados desde Supabase...');
      const client = this.getClient();

      const { data, error } = await client
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
            email
          )
        `)
        .eq('activo', true)
        .eq('destacado', true)
        .limit(limit)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error obteniendo productos destacados:', error);
        throw error;
      }

      console.log(`✅ ${data.length} productos destacados obtenidos desde Supabase`);
      return {
        success: true,
        data: data || []
      };

    } catch (error) {
      console.error('❌ Error obteniendo productos destacados:', error);
      throw error; // No fallback
    }
  }

  // Obtener todas las tiendas
  static async getAllStores() {
    try {
      console.log('📡 Obteniendo tiendas desde Supabase...');
      const client = this.getClient();

      const { data, error } = await client
        .from('tiendas')
        .select('*')
        .order('nombre', { ascending: true });

      if (error) {
        console.error('❌ Error obteniendo tiendas:', error);
        console.error('Detalles del error:', error.message);
        throw error;
      }

      console.log(`✅ ${data?.length || 0} tiendas obtenidas desde Supabase`);
      return {
        success: true,
        data: data || []
      };

    } catch (error) {
      console.error('❌ Error obteniendo tiendas:', error);
      throw error; // No fallback
    }
  }

  // Obtener todas las categorías
  static async getAllCategories() {
    try {
      console.log('📡 Obteniendo categorías desde Supabase...');
      const client = this.getClient();

      const { data, error } = await client
        .from('categorias')
        .select('*')
        .order('nombre', { ascending: true });

      if (error) {
        console.error('❌ Error obteniendo categorías:', error);
        console.error('Detalles del error:', error.message);
        return { success: false, data: [], error: error.message };
      }

      console.log(`✅ ${data?.length || 0} categorías obtenidas desde Supabase`);
      return {
        success: true,
        data: data || []
      };

    } catch (error) {
      console.error('❌ Error obteniendo categorías:', error);
      return { success: false, data: [], error: error.message };
    }
  }

  // Obtener productos por tienda
  static async getProductsByStore(storeId) {
    try {
      console.log(`📡 Obteniendo productos de tienda ${storeId} desde Supabase...`);
      const client = this.getClient();

      const { data, error } = await client
        .from('productos')
        .select(`
          *,
          categorias (
            id,
            nombre,
            icono
          ),
          tiendas (
            id,
            nombre,
            email
          )
        `)
        .eq('tienda_id', storeId)
        .eq('activo', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error obteniendo productos de tienda:', error);
        return { success: false, data: [], error: error.message };
      }

      console.log(`✅ ${data?.length || 0} productos obtenidos de tienda ${storeId}`);
      return {
        success: true,
        data: data || []
      };

    } catch (error) {
      console.error('❌ Error obteniendo productos de tienda:', error);
      return { success: false, data: [], error: error.message };
    }
  }

  // Crear producto
  static async createProduct(productData) {
    try {
      console.log('📡 Creando producto en Supabase...');
      const client = this.getClient();

      const { data, error } = await client
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
        .select();

      if (error) {
        console.error('❌ Error creando producto:', error);
        throw error;
      }

      console.log('✅ Producto creado exitosamente en Supabase');
      return {
        success: true,
        data: data[0],
        message: 'Producto creado exitosamente'
      };

    } catch (error) {
      console.error('❌ Error creando producto:', error);
      return {
        success: false,
        message: error.message || 'Error al crear producto'
      };
    }
  }

  // Actualizar producto
  static async updateProduct(productId, productData) {
    try {
      console.log(`📡 Actualizando producto ${productId} en Supabase...`);
      console.log('📋 Datos recibidos:', productData);
      
      const client = this.getClient();

      const updateData = {
        nombre: productData.nombre,
        descripcion: productData.descripcion,
        precio: parseFloat(productData.precio),
        categoria_id: productData.categoria_id, // Mantener como string (UUID)
        stock: parseInt(productData.stock) || 0,
        destacado: productData.destacado || false
      };

      console.log('📋 Datos a enviar a Supabase:', updateData);

      // Solo agregar imagen si se proporciona
      if (productData.imagen) {
        updateData.imagen = productData.imagen;
      }

      const { data, error } = await client
        .from('productos')
        .update(updateData)
        .eq('id', productId)
        .select(`
          *,
          categorias (
            id,
            nombre,
            icono
          ),
          tiendas (
            id,
            nombre,
            email
          )
        `)
        .single();

      if (error) {
        console.error('❌ Error actualizando producto:', error);
        console.error('❌ Detalle del error:', error.message);
        throw error;
      }

      console.log('✅ Producto actualizado exitosamente en Supabase');
      return {
        success: true,
        data: data,
        message: 'Producto actualizado exitosamente'
      };

    } catch (error) {
      console.error('❌ Error actualizando producto:', error);
      return {
        success: false,
        message: error.message || 'Error al actualizar producto'
      };
    }
  }

  // Crear tienda
  static async createStore(storeData) {
    try {
      console.log('📡 Creando tienda en Supabase...');
      console.log('Datos recibidos:', storeData);
      
      const client = this.getClient();

      // Validar campos requeridos
      if (!storeData.nombre) {
        throw new Error('El nombre de la tienda es requerido');
      }
      if (!storeData.email) {
        throw new Error('El email de la tienda es requerido');
      }
      if (!storeData.propietario) {
        throw new Error('El propietario de la tienda es requerido');
      }

      const datosLimpios = {
        nombre: storeData.nombre,
        descripcion: storeData.descripcion || `Tienda ${storeData.nombre}`,
        logo: storeData.logo || null,
        propietario: storeData.propietario,
        email: storeData.email,
        telefono: storeData.telefono || null,
        direccion: storeData.direccion || null,
        activa: storeData.activa !== undefined ? storeData.activa : true,
        verificada: storeData.verificada !== undefined ? storeData.verificada : false
      };

      console.log('Datos a insertar:', datosLimpios);

      const { data, error } = await client
        .from('tiendas')
        .insert([datosLimpios])
        .select();

      if (error) {
        console.error('❌ Error creando tienda:', error);
        console.error('Código de error:', error.code);
        console.error('Detalles:', error.details);
        console.error('Mensaje:', error.message);
        
        // Errores más específicos
        if (error.code === '23505') {
          throw new Error(`Ya existe una tienda con el email ${storeData.email}`);
        } else if (error.code === '42501') {
          throw new Error('Error de permisos: Verifica las políticas RLS de la tabla tiendas');
        } else {
          throw new Error(`Error de BD: ${error.message}`);
        }
      }

      console.log('✅ Tienda creada exitosamente:', data[0]);
      return {
        success: true,
        data: data[0],
        message: 'Tienda creada exitosamente'
      };

    } catch (error) {
      console.error('❌ Error creando tienda:', error);
      return {
        success: false,
        error: error.message || 'Error al crear tienda'
      };
    }
  }

  // ===== FUNCIONES DE STORAGE PARA IMÁGENES =====
  
  // Subir imagen de producto (con manejo robusto de errores)
  static async uploadProductImage(file, productName) {
    try {
      console.log('📤 Subiendo imagen a Supabase Storage...');
      const client = this.getClient();

      // Verificar si Storage está disponible
      if (!client.storage) {
        throw new Error('Supabase Storage no está disponible');
      }

      // Generar nombre único para el archivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${productName.replace(/\s+/g, '_').toLowerCase()}.${fileExt}`;
      const filePath = `productos/${fileName}`;

      // Intentar crear el bucket si no existe
      console.log('🔍 Verificando bucket "productos"...');
      
      // Subir archivo al bucket 'productos'
      const { data, error } = await client.storage
        .from('productos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('❌ Error subiendo imagen:', error);
        
        // Si el bucket no existe, devolver un error específico
        if (error.message && error.message.includes('Bucket not found')) {
          return {
            success: false,
            error: 'Bucket "productos" no existe. Debe crearse en Supabase Dashboard.',
            needsBucket: true
          };
        }
        
        throw error;
      }

      // Obtener URL pública del archivo
      const { data: urlData } = client.storage
        .from('productos')
        .getPublicUrl(filePath);

      console.log('✅ Imagen subida exitosamente:', urlData.publicUrl);
      return {
        success: true,
        url: urlData.publicUrl,
        path: filePath
      };

    } catch (error) {
      console.error('❌ Error en uploadProductImage:', error);
      return {
        success: false,
        error: error.message || 'Error desconocido subiendo imagen'
      };
    }
  }

  // Eliminar imagen de producto
  static async deleteProductImage(filePath) {
    try {
      console.log('🗑️ Eliminando imagen de Supabase Storage...');
      const client = this.getClient();

      const { error } = await client.storage
        .from('productos')
        .remove([filePath]);

      if (error) {
        console.error('❌ Error eliminando imagen:', error);
        throw error;
      }

      console.log('✅ Imagen eliminada exitosamente');
      return {
        success: true
      };

    } catch (error) {
      console.error('❌ Error en deleteProductImage:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Hacer disponible globalmente
window.SimpleSupabaseService = SimpleSupabaseService;

// Crear aliases para compatibilidad - SOLO SUPABASE
window.productService = {
  getAllProducts: () => SimpleSupabaseService.getAllProducts(),
  getFeaturedProducts: (limit) => SimpleSupabaseService.getFeaturedProducts(limit),
  createProduct: (data) => SimpleSupabaseService.createProduct(data),
  uploadProductImage: (file, productName) => SimpleSupabaseService.uploadProductImage(file, productName),
  deleteProductImage: (filePath) => SimpleSupabaseService.deleteProductImage(filePath)
};

window.storeService = {
  getAllStores: () => SimpleSupabaseService.getAllStores()
};

window.categoryService = {
  getAllCategories: () => SimpleSupabaseService.getAllCategories()
};

console.log('✅ Servicios Supabase-ONLY cargados - Sin fallback a JSON');