import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { GetAllProductos } from '../interfaces/producto.interface';

@Injectable({
  providedIn: 'root',
})
export class ProductosService {
  constructor(private http: HttpClient) {}

  async GetAllProductos() {
    return this.http.get<GetAllProductos>(
      environment.base + environment.productosTodos
    );
  }
  async GetAllProductosByNombre(nombreProducto: string) {
    return this.http.get<GetAllProductos>(
      environment.base +
        environment.buscarProdcutoNombre +
        nombreProducto +
        '&PageSize=20'
    );
  }
}
