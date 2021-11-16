export interface GetAllProductos {
  pageNumber: number;
  pageSize: number;
  succeeded: boolean;
  message: null;
  errors: null;
  data: ProductoGetAllProductos[];
}

export interface ProductoGetAllProductos {
  productoId: string;
  nombre: string;
  descripcion: string;
  stock: number;
  precioVentaCliente: number;
  categoriaProductoId: string;
}
