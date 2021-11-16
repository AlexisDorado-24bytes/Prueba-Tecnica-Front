import { Component, OnInit } from '@angular/core';
import {
  GetAllProductos,
  ProductoGetAllProductos,
} from '../interfaces/producto.interface';
import { ProductosService } from '../services/productos.service';
import Swal from 'sweetalert2';
import { Cliente } from '../interfaces/cliente.interface';
import * as uuid from 'uuid';
import * as moment from 'moment';
import { FacturaInicialService } from '../services/factura-inicial.service';
import { RespuestaServidor } from '../interfaces/respuestaServidor.interface';
import { MovimientoFacturaProductoService } from '../services/movimiento-factura-producto.service';
import { DataServiceService } from '../services/data-service.service';
import { DetalleFacturaProducto } from '../interfaces/detalleproducto.interface';
@Component({
  selector: 'app-lista-productos',
  templateUrl: './lista-productos.component.html',
  styleUrls: ['./lista-productos.component.scss'],
})
export class ListaProductosComponent implements OnInit {
  public productosLista: ProductoGetAllProductos[] = [];

  validarClienteSeleccionado(idProducto: string) {
    var cliente = localStorage.getItem('ClienteSeleccionado');
    if (!cliente) {
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
        icon: 'error',
        title: 'Primero debes seleccionar un cliente.',
      });
    } else {
      var objCliente: Cliente = JSON.parse(cliente);

      //Validamos si ya existe la factura
      var facturaPrincipal = localStorage.getItem('FacturaDatos');
      //Si no existe la factura inicial, es porque es la primer venta, por tanto se crea esa factura inicial
      if (!facturaPrincipal) {
        this.crearFacturaInicial(objCliente.clienteId, idProducto);
      } else {
        //Convertimos los datos del localstorage para usar el codigo
        var datosFactura = JSON.parse(facturaPrincipal);
        //Si ya existe, se crea movimiento o venta de producto y ya no se crea el unicial porque ya existe
        this.crearMovimientoFacturaDetalle(idProducto, datosFactura.codigo);
      }
    }
  }
  crearFacturaInicial(idCliente: string, idProducto: string) {
    var codigoUnicoFactura = uuid.v4();
    localStorage.setItem('CodigoUnico', codigoUnicoFactura);
    var fechaFactura = new Date();
    var body = {
      fechaFactura: fechaFactura,
      codigo: codigoUnicoFactura,
      clienteId: idCliente,
    };

    //Enviamos datos para crear la factura
    this.servicioFacturaInical
      .crearfacturaInicial(JSON.stringify(body))
      .subscribe((res) => {
        this.crearPrimerMovimientoFacturaDetalle(
          res,
          idProducto,
          codigoUnicoFactura
        );
      });

    //Guardamos los datos de la facura inicial
    localStorage.setItem('FacturaDatos', JSON.stringify(body));
  }

  crearPrimerMovimientoFacturaDetalle(
    respuesta: RespuestaServidor,
    idProducto: string,
    codigoUnico: string
  ) {
    if (!respuesta.succeeded) {
      localStorage.clear();
      window.location.reload();
      return;
    }
    //Guardamos el id de la factura para futuras consultas
    localStorage.setItem('FacturaId', respuesta.data);

    ///Enviamos peticion para guardar la data del producto
    var body = {
      codigo: codigoUnico,
      productoId: idProducto,
      cantidad: 1,
    };
    this.servicioVenta
      .crearMovimientoFacturaDetalle(JSON.stringify(body))
      .then((respuestaNuevoMovimiento) => {
        //Despues de obtener una respuesta positiva actualizamos lista de movimientos y emitimos la lista
        respuestaNuevoMovimiento.subscribe(() => {
          this.servicioVenta
            .consultarMovimientosFactura(codigoUnico)
            .then((respuestaServidor) => {
              //Una vez todo sale correcto se suscribe a la respuesta
              respuestaServidor.subscribe((listaActualizadaMovimientos) => {
                //Después de obtener una respuesta positiva, Se emite un cambio actualizando la lista.

                this.servicioDataEmiter.listaMovimientos$.emit(
                  listaActualizadaMovimientos.detalleFacturaProducto
                );
                this.actualizarListaProductos();
              });
            });
        });
      });

    localStorage.setItem('CodigoUnico', codigoUnico);
    this.servicioVenta.consultarMovimientosFactura(codigoUnico);
  }

  crearMovimientoFacturaDetalle(idProducto: string, codigoUnico: string) {
    ///Enviamos peticion para guardar la data del producto
    var body = {
      codigo: codigoUnico,
      productoId: idProducto,
      cantidad: 1,
    };

    //Se crea el movimiento y se espera una respuesta positiva
    this.servicioVenta
      .crearMovimientoFacturaDetalle(JSON.stringify(body))
      .then((respuestaNuevoMovimiento) => {
        //Se actualiza la lista de transacciones, Después de obtener una respuesta positiva,
        //Se emite un cambio actualizando la lista movimientos
        respuestaNuevoMovimiento.subscribe(() => {
          this.servicioVenta
            .consultarMovimientosFactura(codigoUnico)
            .then((respuestaServidor) => {
              //Una vez, teniendo respuesta positiva, nos suscribimos y emitimos la nueva lista

              respuestaServidor.subscribe((listaMovimientos) => {
                //Obtenemos la lista de movimientos y emitimos esa misa lista
                this.servicioDataEmiter.listaMovimientos$.emit(
                  listaMovimientos.detalleFacturaProducto
                );
              });
            });
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
            title: 'Producto agregado a factura.',
          });
          //Actualizamos lista de productos y emitimos la nueva lista
          this.actualizarListaProductos();
        });
      });
  }

  enviar(pro: ProductoGetAllProductos) {
    this.validarClienteSeleccionado(pro.productoId);
    this.validarStock(pro.stock);
  }
  validarStock(stock: number) {
    if (stock < 1) {
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
        icon: 'error',
        title: 'El producto no tiene unidades disponibles.',
      });
    }
  }

  emitirListaProductos(listaProductos: ProductoGetAllProductos[]) {
    this.servicioDataEmiter.listaProdutos$.emit(listaProductos);
  }
  actualizarListaProductos() {
    this.productosService.GetAllProductos().then((respuestaServidor) => {
      respuestaServidor.subscribe((nuevaListaProductos) => {
        this.emitirListaProductos(nuevaListaProductos.data);
      });
    });
  }
  actualizarListaProductosByNombre(nombreProducto: string) {
    this.productosService
      .GetAllProductosByNombre(nombreProducto)
      .then((respuestaServidor) => {
        respuestaServidor.subscribe((nuevaListaProductos) => {
          this.emitirListaProductos(nuevaListaProductos.data);
        });
      });
  }
  inputBuscar(nombreProducto: string) {
    this.actualizarListaProductosByNombre(nombreProducto);
  }

  constructor(
    private productosService: ProductosService,
    private servicioFacturaInical: FacturaInicialService,
    private servicioVenta: MovimientoFacturaProductoService,
    public servicioDataEmiter: DataServiceService
  ) {}

  ngOnInit(): void {
    //Nos suscribimos al emiter de tipo lista de productos
    this.servicioDataEmiter.listaProdutos$.subscribe(
      (listaActualizadaProductos) => {
        this.productosLista = listaActualizadaProductos;
      }
    );
    //Cargamos los datos iniciales de la lista
    this.productosService.GetAllProductos().then((respuestaServidor) => {
      respuestaServidor.subscribe((nuevaListaPriductos) => {
        this.productosLista = nuevaListaPriductos.data;
      });
    });
  }
}
