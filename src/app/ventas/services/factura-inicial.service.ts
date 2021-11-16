import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { RespuestaServidor } from '../interfaces/respuestaServidor.interface';

@Injectable({
  providedIn: 'root',
})
export class FacturaInicialService {
  constructor(private http: HttpClient) {}

  crearfacturaInicial(body: string) {
    var httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        // 'Access-Control-Allow-Origin': '*',
      }),
    };
    var url = environment.base + environment.facturaInicial;
    return this.http.post<RespuestaServidor>(url, body, httpOptions);
  }

  async eliminarFacturaYMovimientos(codigo: string) {
    var httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        // 'Access-Control-Allow-Origin': '*',
      }),
    };
    var url = environment.base + environment.facturaInicial + '/' + codigo;
    return this.http.delete<RespuestaServidor>(url);
  }
}
