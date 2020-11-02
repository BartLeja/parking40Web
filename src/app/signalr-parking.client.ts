import {Injectable, EventEmitter} from '@angular/core';
import  { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel} from '@microsoft/signalr'
import { PrivateKeyInput } from 'crypto';
import { Subject } from 'rxjs';
import { Parking, ParkingSpot } from './parking.model';

@Injectable({
    providedIn: 'root',
  })
  export class ParkingSignalRClient{
    private hubConnection: HubConnection;
    private builder : HubConnectionBuilder;
    public parkingSubject = new Subject<Parking>();
    public parkingSpotSubject = new Subject<ParkingSpot>();
    
    public signalRClientInit(){
        this.builder = new HubConnectionBuilder();
        this.hubConnection = this.builder
        .withUrl(`https://parking40cloud20201029175031.azurewebsites.net/parking`)
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Information)
        .build();

        this.hubConnection.on('UpsertParkingMessage', (parking: Parking) => {
           this.parkingSubject.next(parking);
            console.log(parking);
          });

        this.hubConnection.on('ChangeParkingSpotStatusMessage', (parkingSpot: ParkingSpot) => {
          this.parkingSpotSubject.next(parkingSpot);
            console.log(parkingSpot);
        });
        
        this.hubConnection.start();
    }
  }