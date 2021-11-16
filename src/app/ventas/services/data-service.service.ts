import { EventEmitter, Injectable } from '@angular/core';
import { DetalleFacturaProducto } from '../interfaces/detalleproducto.interface';
import { ProductoGetAllProductos } from '../interfaces/producto.interface';

@Injectable({
  providedIn: 'root',
})
export class DataServiceService {
  public listaMovimientos$ = new EventEmitter<DetalleFacturaProducto[]>();
  public listaProdutos$ = new EventEmitter<ProductoGetAllProductos[]>();
  constructor() {}
}
