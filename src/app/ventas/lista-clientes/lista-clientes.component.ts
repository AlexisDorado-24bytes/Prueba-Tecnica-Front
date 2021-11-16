import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Cliente } from '../interfaces/cliente.interface';
import { ClientesService } from '../services/clientes.service';

@Component({
  selector: 'app-lista-clientes',
  templateUrl: './lista-clientes.component.html',
  styleUrls: ['./lista-clientes.component.scss'],
})
export class ListaClientesComponent implements OnInit {
  public clientes: Cliente[] = [];

  public jsonCliente: Cliente | undefined;
  @Output() estadoClienteSeleccionado = new EventEmitter<boolean>();

  enviar(cliente: Cliente) {
    console.log('cliente', cliente);
  }

  guardarCliente(objCliente: Cliente) {
    localStorage.setItem('ClienteSeleccionado', JSON.stringify(objCliente));
    this.estadoClienteSeleccionado.emit(true);
  }
  inputBuscar(texto: string) {
    var textoInt = parseInt(texto);
    if (!isNaN(textoInt)) {
      this.serviceCliente
        .getClientesByCedula(textoInt)
        .subscribe((listaClientes) => {
          this.clientes = listaClientes.data;
        });
    }
  }
  constructor(private serviceCliente: ClientesService) {}

  ngOnInit() {
    this.serviceCliente.getAllClientes().subscribe((res) => {
      this.clientes = res.data;
    });
  }
}
