import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import Swal from 'sweetalert2';
import { Cliente } from '../interfaces/cliente.interface';
import {
  DetalleFacturaProducto,
  Producto,
} from '../interfaces/detalleproducto.interface';
import { FacturaDatos } from '../interfaces/facturaDatos.interface';
import { ProductoGetAllProductos } from '../interfaces/producto.interface';
import { DataServiceService } from '../services/data-service.service';
import { FacturaInicialService } from '../services/factura-inicial.service';
import { MovimientoFacturaProductoService } from '../services/movimiento-factura-producto.service';
import { ProductosService } from '../services/productos.service';

@Component({
  selector: 'app-factura',
  templateUrl: './factura.component.html',
  styleUrls: ['./factura.component.scss'],
})
export class FacturaComponent implements OnInit {
  public clienteSeleccionado!: Cliente;
  public listaMovimientos: DetalleFacturaProducto[] = [];
  public jsonCliente: Cliente | undefined;
  public cantidadTotal: number = 0;
  public valorTotalFactura: number = 0;
  public valorUnitarioFactura: string = 'COP 0,00';
  public monedaConvertida: string = 'COP 0,00';

  @Output() estadoClienteSeleccionado = new EventEmitter<boolean>();
  consultarDatos() {
    //Traemos los datos del localstorage
    var strData = localStorage.getItem('ClienteSeleccionado');
    var jsonData = JSON.parse(strData || 'No existe datos');
    this.clienteSeleccionado = jsonData;

    //Si llega a este momento es porque tenemos un cpdigo uniico guardado
    var codigo: string = localStorage.getItem('CodigoUnico') || '';

    //Cargando los datos iniciales y esperando respuesta positiva
    if (codigo && codigo != '') {
      this.servicioFacturaDetalle
        .consultarMovimientosFactura(codigo)
        .then((respuestaServidor) => {
          //Una vez se obtiene una respuesta positiva, se actualiza la lista de movimientos
          //y se emite esa nueva lista

          respuestaServidor.subscribe((nuevalistaMovimientos) => {
            //Emitimos nueva lista
            this.servicioDataEmiter.listaMovimientos$.emit(
              nuevalistaMovimientos.detalleFacturaProducto
            );
          });
        });
    }
  }
  eliminarTransaccion(movimento: DetalleFacturaProducto) {
    //Eliminamos la transacción y esperamos una respuesta positiva para emitir una nueva lista actualizada
    this.servicioFacturaDetalle
      .eliminarMovimiento(movimento.detalleFacturaProductoId)
      .then((respuestaEliminacionMotiviento) => {
        //Una vez procesaada la soictud, tenemos ésta respuesta positiva
        //actualizamos la lista de movimientos y emitimos la lista actualizada
        respuestaEliminacionMotiviento.subscribe(() => {
          this.servicioFacturaDetalle
            .consultarMovimientosFactura(movimento.codigo)
            .then((respuestaServidor) => {
              //Al tener una respuesta positiva, emiturmos la lista retornada
              respuestaServidor.subscribe((nuevaListaMovimientos) => {
                //Emisión de la la lista actualizada
                this.servicioDataEmiter.listaMovimientos$.emit(
                  nuevaListaMovimientos.detalleFacturaProducto
                );
              });
            });
          //Actualizamos lista de productos
          this.actualizarListaProductos();

          //ALerrta de transacion elimimada
          const Toast = Swal.mixin({
            toast: true,
            position: 'bottom-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
              toast.addEventListener('mouseenter', Swal.stopTimer);
              toast.addEventListener('mouseleave', Swal.resumeTimer);
            },
          });

          Toast.fire({
            icon: 'success',
            title: 'Transaccion eliminada de la base de datos',
          });
        });
      });
  }
  actualizarListaProductos() {
    this.productosService.GetAllProductos().then((respuestaServidor) => {
      respuestaServidor.subscribe((nuevaListaProductos) => {
        this.emitirListaProductos(nuevaListaProductos.data);
      });
    });
  }

  emitirListaProductos(listaProductos: ProductoGetAllProductos[]) {
    this.servicioDataEmiter.listaProdutos$.emit(listaProductos);
  }
  cambiarCliente() {
    //Pregutnar si desea eliminar todo
    Swal.fire({
      title: '¿Seguro de eliminar factura?',
      text: 'Se borrarán todos los movimientos y los productos regresarán al stock',
      icon: 'warning',
      showCancelButton: true,
      width: 900,
      heightAuto: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, continue.',
    }).then((result) => {
      if (result.isConfirmed) {
        var codigo: string = localStorage.getItem('CodigoUnico') || '';

        if (codigo && codigo != '') {
          this.facturaService
            .eliminarFacturaYMovimientos(codigo)
            .then((respuestaServidor) => {
              respuestaServidor.subscribe(() => {
                localStorage.clear();
                this.estadoClienteSeleccionado.emit(false);

                this.actualizarListaProductos();

                const Toast = Swal.mixin({
                  toast: true,
                  position: 'bottom-end',
                  showConfirmButton: false,
                  timer: 3000,
                  timerProgressBar: true,
                  didOpen: (toast) => {
                    toast.addEventListener('mouseenter', Swal.stopTimer);
                    toast.addEventListener('mouseleave', Swal.resumeTimer);
                  },
                });

                Toast.fire({
                  icon: 'success',
                  title: 'Factura eliminada corréctamente',
                });
              });
            });
        } else {
          localStorage.clear();
          this.estadoClienteSeleccionado.emit(false);

          this.actualizarListaProductos();
        }
      }
    });
  }
  pagar() {
    Swal.fire({
      title: 'Desea pagar la factura?',
      text: 'Se confirmará la venta',
      icon: 'info',
      showCancelButton: true,
      width: 900,
      heightAuto: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, continue.',
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        this.estadoClienteSeleccionado.emit(false);

        this.actualizarListaProductos();

        const Toast = Swal.mixin({
          toast: true,
          position: 'bottom-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
          },
        });

        Toast.fire({
          icon: 'success',
          title: 'Factura pagada corréctamente',
        });
      }
    });
  }
  constructor(
    private servicioFacturaDetalle: MovimientoFacturaProductoService,
    private servicioDataEmiter: DataServiceService,
    private productosService: ProductosService,
    private facturaService: FacturaInicialService
  ) {}

  ngOnInit(): void {
    this.consultarDatos();

    //Nos suscribimos al emiter para obtener los cambios y mistrarlos cía listaMovimientos
    this.servicioDataEmiter.listaMovimientos$.subscribe((listaActualizada) => {
      this.listaMovimientos = listaActualizada;
      var suma = 0;
      var valorTotal = 0;
      var valorUnitario = 0;
      this.listaMovimientos.forEach((movimiento) => {
        suma += movimiento.cantidad;
        valorTotal += movimiento.valorTotal;
        valorUnitario += movimiento.valorUnitario;
      });
      this.cantidadTotal = suma;
      this.valorTotalFactura = valorTotal;
      this.valorUnitarioFactura = valorUnitario.toLocaleString('en-ES', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 2,
      });
      this.monedaConvertida = valorTotal.toLocaleString('en-ES', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 2,
      });
    });
  }
}
