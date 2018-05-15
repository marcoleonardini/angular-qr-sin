import { MatSnackBar } from '@angular/material/snack-bar';
import { Factura } from './models/factura.model';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatTableDataSource } from '@angular/material';
import { QrScannerComponent } from 'angular2-qrscanner';
import { trigger, transition, query, stagger, animate, style, keyframes } from '@angular/animations'
import { Angular2Txt } from 'angular2-txt/Angular2-txt';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    animations:[

        trigger('listAnimation', [
          transition('* => *', [
    
            query(':enter', style({ opacity: 0 }), {optional: true}),
    
            query(':enter', stagger('300ms', [
              animate('1s ease-in', keyframes([
                style({opacity: 0, transform: 'translateX(-75%)', offset: 0}),
                style({opacity: .5, transform: 'translateX(35px)',  offset: 0.3}),
                style({opacity: 1, transform: 'translateX(0)',     offset: 1.0}),
            ]))]), {optional: true}),
              
            query(':leave', stagger('300ms', [
            animate('1s ease-in', keyframes([
                style({opacity: 1, transform: 'translateY(0)', offset: 0}),
                style({opacity: .5, transform: 'translateY(35px)',  offset: 0.3}),
                style({opacity: 0, transform: 'translateY(-75%)',     offset: 1.0}),
            ]))]), {optional: true})
          ])
        ])
    
      ]
})
export class AppComponent implements OnInit{

    @ViewChild(QrScannerComponent) qrScannerComponent: QrScannerComponent ;
    displayedColumns = ['nro','nitEmpresa', 'numeroFactura', 'autorizacion', 'codigoControl', 'fecha', 'monto', 'options'];
    public dataSource = new MatTableDataSource();
    private facturas: Factura[] = [ 
                                    { "nit": "1", "numeroFactura": "35315", "autorizacion": "271401700140417", "fecha": "05/03/2018", "monto": 278.50, "montoDescuento": "278.50", "codigoControl": "FC-A9-3F-EE-45", "personNit": "6166245" },
                                    { "nit": "2", "numeroFactura": "35315", "autorizacion": "271401700140417", "fecha": "05/03/2018", "monto": 278.50, "montoDescuento": "278.50", "codigoControl": "FC-A9-3F-EE-45", "personNit": "6166245" },
                                    { "nit": "3", "numeroFactura": "35315", "autorizacion": "271401700140417", "fecha": "05/03/2018", "monto": 278.50, "montoDescuento": "278.50", "codigoControl": "FC-A9-3F-EE-45", "personNit": "6166245" },
                                    { "nit": "4", "numeroFactura": "35315", "autorizacion": "271401700140417", "fecha": "05/03/2018", "monto": 278.50, "montoDescuento": "278.50", "codigoControl": "FC-A9-3F-EE-45", "personNit": "6166245" },
                                    { "nit": "5", "numeroFactura": "35315", "autorizacion": "271401700140417", "fecha": "05/03/2018", "monto": 278.50, "montoDescuento": "278.50", "codigoControl": "FC-A9-3F-EE-45", "personNit": "6166245" },
                                    { "nit": "6", "numeroFactura": "35315", "autorizacion": "271401700140417", "fecha": "05/03/2018", "monto": 278.50, "montoDescuento": "278.50", "codigoControl": "FC-A9-3F-EE-45", "personNit": "6166245" },
                                    { "nit": "7", "numeroFactura": "35315", "autorizacion": "271401700140417", "fecha": "05/03/2018", "monto": 278.50, "montoDescuento": "278.50", "codigoControl": "FC-A9-3F-EE-45", "personNit": "6166245" },
                                    { "nit": "8", "numeroFactura": "35315", "autorizacion": "271401700140417", "fecha": "05/03/2018", "monto": 278.50, "montoDescuento": "278.50", "codigoControl": "FC-A9-3F-EE-45", "personNit": "6166245" }];
    public total: number = 0;
    
	constructor(private snackBar: MatSnackBar) {
        this.dataSource = new MatTableDataSource(this.facturas);
    }
    
    ngOnInit(){
        this.qrScannerComponent.getMediaDevices().then(devices => {
            const videoDevices: MediaDeviceInfo[] = [];
            for (const device of devices) {
                if (device.kind.toString() === 'videoinput') {
                    videoDevices.push(device);
                }
            }
            if (videoDevices.length > 0){
                let choosenDev;
                for (const dev of videoDevices){
                    if (dev.label.includes('front')){
                        choosenDev = dev;
                        break;
                    }
                }
                if (choosenDev) {
                    this.qrScannerComponent.chooseCamera.next(choosenDev);
                } else {
                    this.qrScannerComponent.chooseCamera.next(videoDevices[0]);
                }
            }
        });
  
        this.qrScannerComponent.capturedQr.subscribe(result => {
            const arrayTmp = result.split("|")

            const factura = new Factura();
            factura.nit = arrayTmp[0]
            factura.numeroFactura = arrayTmp[1]
            factura.autorizacion = arrayTmp[2]
            factura.fecha = arrayTmp[3]
            factura.monto = arrayTmp[4]
            factura.montoDescuento = arrayTmp[5]
            factura.codigoControl = arrayTmp[6]
            factura.personNit = arrayTmp[7]
            
            if(!this.validateFactura(factura))
            {
                this.snackBar.open("La factura no es válida", null, {
                    duration: 2000,
                });
                return false;
            }
            if(this.checkFactura(factura) == -1)
            {
                this.facturas.push(factura);
                this.dataSource = new MatTableDataSource(this.facturas)
                // SnackBar se agrego correctamente
                this.snackBar.open("La factura se agregó correctamente", null, {
                    duration: 2000,
                });
                this.sumFacturas();
            }
            else{
                // SnackBar factura repetida
                this.snackBar.open("La factura esta repetida", null, {
                    duration: 2000,
                });
            }
        });
    }
    public checkFactura(factura: Factura){
        return this.facturas.findIndex( x =>{
            return  x.codigoControl === factura.codigoControl &&
            x.autorizacion == factura.autorizacion &&
            x.numeroFactura === factura.numeroFactura &&
            x.nit === factura.nit;
        })
    }
    
    public removeFactura(factura: Factura){
        const index = this.checkFactura(factura)
        
        // Se elimino correctamene
        this.snackBar.open("La factura se elimnió correctamente", null, {
            duration: 2000,
        });
        this.facturas.splice(index , 1 );
        this.dataSource = new MatTableDataSource(this.facturas);
        this.sumFacturas();
    }
    
    public verFactura(factura){
        // Open Detalle Factura;
    }
    
    public validateFactura(factura: Factura) : boolean{
        // 1. Validar Nit Empresa
        if(factura.nit === undefined || factura.nit === null || factura.nit === '0' || factura.nit.length == 0)
            return false;
        // 2. Validar numero factura
        if(factura.numeroFactura === undefined || factura.numeroFactura === null || factura.numeroFactura === '0' || factura.numeroFactura.length == 0)
            return false;
        // 3. Validar numero autorizacion
        if(factura.autorizacion === undefined || factura.autorizacion === null || factura.autorizacion === '0' || factura.autorizacion.length == 0)
            return false;
        // 4. Validar Codigo Control
        if(factura.codigoControl === undefined || factura.codigoControl === null || factura.nit === '0' || factura.nit.length == 0)
            return false;
        // 5. Validar Fecha emision
        if(factura.fecha === undefined || factura.fecha === null || factura.fecha === '0' || factura.fecha.length == 0)
            return false;
        // 6. Validar monto
        if(factura.monto === undefined || factura.monto === null || factura.monto == 0)
            return false;
        // 7. Validar nit persona
        if(factura.personNit === undefined || factura.personNit === null || factura.personNit === '0' || factura.personNit.length == 0)
            return false;
        // datos validos.
        return true;   
    }

    public downloadTxt(){
        var options = { 
            fieldSeparator: '|',
            quoteStrings: '',
            decimalseparator: '.',
            showTitle: false,
            useBom: true
          };
        new Angular2Txt(this.facturas, 'Mis Facturas', options);
    }

    public sumFacturas(){
        this.total = this.facturas.reduce( 
            (a: number, b) => a + b.monto*1, 0);
    }
}
