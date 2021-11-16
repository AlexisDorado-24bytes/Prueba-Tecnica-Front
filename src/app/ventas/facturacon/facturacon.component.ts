import { Component, OnInit } from '@angular/core';
import { Cliente } from '../interfaces/cliente.interface';
import { ClientesService } from '../services/clientes.service';

@Component({
  selector: 'app-facturacon',
  templateUrl: './facturacon.component.html',
  styleUrls: ['./facturacon.component.scss'],
})
export class FacturaconComponent implements OnInit {
  constructor(private clienteService: ClientesService) {}

  public cliente: boolean = false;
  public listaClientes: Cliente[] = [];

  public clientePersonalizado: Cliente[] = [];

  gudarCliente() {
    var nombre = localStorage.getItem('ClienteSeleccionado');
    console.log(nombre);
    this.cliente = true;
  }
  buscarCliente() {
    var cliente = localStorage.getItem('ClienteSeleccionado');

    if (cliente) {
      console.log('Se encontó cliente');
      this.cliente = true;
      return;
    }

    console.log('Sin cliente seleciconado');

    this.cliente = false;
  }

  ngOnInit(): void {
    this.buscarCliente();

    //Cargando todos los clientes
    this.clienteService.getAllClientes().subscribe((res) => {
      this.listaClientes = res.data;
    });
  }
}
