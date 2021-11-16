import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import {
  DetalleFacturaProducto,
  RespuestaDetalleProducto,
} from '../interfaces/detalleproducto.interface';
import { RespuestaServidor } from '../interfaces/respuestaServidor.interface';

@Injectable({
  providedIn: 'root',
})
export class MovimientoFacturaProductoService {
  public listaGeneralDeMovimientos: DetalleFacturaProducto[] = [];
  constructor(private http: HttpClient) {}

  async crearMovimientoFacturaDetalle(body: string) {
    var url = environment.base + environment.facturaDetalle;
    var httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        // 'Access-Control-Allow-Origin': '*',
      }),
    };

    var agregar = this.http.post<RespuestaServidor>(url, body, httpOptions);
    return agregar;
  }

  async consultarMovimientosFactura(codigoUnico: string) {
    var url =
      environment.base + environment.consultarFacturaDetalle + codigoUnico;

    return this.http.get<RespuestaDetalleProducto>(url);
  }

  async eliminarMovimiento(idMovimiento: string) {
    var ruta =
      environment.base + environment.facturaDetalle + '/' + idMovimiento;
    return this.http.delete(ruta);
  }
}
