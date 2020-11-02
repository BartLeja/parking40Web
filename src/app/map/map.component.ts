import { Component, OnInit } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { Parking } from '../parking.model';
import { ParkingService } from '../parking.service';
import { ParkingSignalRClient } from '../signalr-parking.client';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {

  private map: mapboxgl.Map;
  private style = 'mapbox://styles/mapbox/streets-v11';
  private lngLat: mapboxgl.LngLatLike = [19.959764, 50.057488];
  public mapLayerCollection: any[] = [];
  public mapBoxPopUpCollection: mapboxgl.Popup[] = [];
  private parkings: Parking[];
  constructor(
    private parkingService : ParkingService, 
    private parkingSignalRClient: ParkingSignalRClient ){
  }

  public ngOnInit(): void{
      (mapboxgl as typeof mapboxgl).accessToken = 'pk.eyJ1IjoiZ2Vvcmdpb3MtdWJlciIsImEiOiJjanZidTZzczAwajMxNGVwOGZrd2E5NG90In0.gdsRu_UeU_uPi9IulBruXA';
      this.map = new mapboxgl.Map({
        container: 'map',
        style: this.style,
        zoom: 17,
        pitch: 60,
        center: this.lngLat,
      //  antialias: true // create the gl context with MSAA antialiasing, so custom layers are antialiased
    });

    this.parkingService.getParkings()
    .subscribe(p=> 
      {
        this.parkings = p;
        p.map(p=>{
          this.setParking(
            p.coordinates,
            p.parkingSpots.filter(ps=>ps.status === true).length,
            p.parkingName
          )
        })
      }
    );

    this.parkingSignalRClient.signalRClientInit();
    this.parkingSignalRClient
      .parkingSubject
      .subscribe((p: Parking) => {
        if(this.parkings.some(p=>p.parkingName == p.parkingName)){
          this.parkings = this.parkings.filter(p => p.parkingName !==p.parkingName);
          this.parkings.push(p);
          
          let parkingPopup = this.mapBoxPopUpCollection.find(
            pp=>pp.getLngLat().lng == p.coordinates[0] 
            && pp.getLngLat().lat === p.coordinates[1]);

          let parkingInfo = `<h3> Parking Name: ${p.parkingName}  <br> Parking Spots Left: ${(p.parkingSpots.filter(ps=>ps.status === true).length).toString()}</h3>`
          parkingPopup.setHTML(parkingInfo);
        }else{
          this.parkings.push(p);
          this.setParking(p.coordinates, p.parkingSpots.filter(ps=>ps.status === true).length, p.parkingName);
        }
      });

    this.parkingSignalRClient
      .parkingSpotSubject
      .subscribe(ps=>{  
        const parking = this.parkings.find(p=> p.parkingSpots.find(ps=>ps.id === ps.id));
        parking.parkingSpots.forEach((p,i)=>{
          if(p.id == ps.id ){
            parking.parkingSpots[i].status = ps.status
          }
        })
        this.parkings = this.parkings.filter(p => p.parkingName !== parking.parkingName);
        this.parkings.push(parking);
        let parkingPopup = this.mapBoxPopUpCollection.find(
          p=>p.getLngLat().lng == parking.coordinates[0] 
          && p.getLngLat().lat ===  parking.coordinates[1]);

        let parkingInfo = `<h3> Parking Name: ${parking.parkingName}  <br> Parking Spots Left: ${(parking.parkingSpots.filter(ps=>ps.status === true).length).toString()}</h3>`
        parkingPopup.setHTML(parkingInfo);
      }
    )
  }

  private setParking(lngLat: any, freeParkingSpots: number, parkingName: string): void{
    let parkingInfo = `<h3> Parking Name: ${parkingName} <br> Parking Spots Left: ${freeParkingSpots.toString()}</h3>`
    this.mapBoxPopUpCollection.push(
      // new mapboxgl.Popup({closeButton: false})
      new mapboxgl.Popup()
      .setLngLat(lngLat)
      .setHTML(parkingInfo)
      .addTo(this.map)
    )
  }
}
