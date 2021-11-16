import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListaProductosComponent } from './lista-productos/lista-productos.component';
import { VentasComponent } from './ventas/ventas.component';
import { FacturaconComponent } from './facturacon/facturacon.component';
import { ListaClientesComponent } from './lista-clientes/lista-clientes.component';
import { FacturaComponent } from './factura/factura.component';
import { SpinnerComponent } from './spinner/spinner.component';

@NgModule({
  declarations: [
    ListaProductosComponent,
    VentasComponent,
    FacturaconComponent,
    ListaClientesComponent,
    FacturaComponent,
    SpinnerComponent,
  ],
  imports: [CommonModule],
  exports: [ListaProductosComponent, FacturaconComponent, SpinnerComponent],
})
export class VentasModule {}
