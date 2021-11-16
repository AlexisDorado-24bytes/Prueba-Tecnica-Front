import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Cliente, ClienteDatos } from '../interfaces/cliente.interface';

@Injectable({
  providedIn: 'root',
})
export class ClientesService {
  constructor(private http: HttpClient) {}

  getClientesByCedula(cedula: number) {
    return this.http.get<ClienteDatos>(
      environment.base + environment.clientesBuscar + cedula + '&PageSize=20'
    );
  }
  getAllClientes() {
    return this.http.get<ClienteDatos>(
      environment.base + environment.clientesTodos
    );
  }
}
