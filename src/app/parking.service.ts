import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Parking } from './parking.model';

@Injectable({
    providedIn: 'root',
})
export class ParkingService {
    constructor(private http: HttpClient) {}

    public getParkings(): Observable<Parking[]>{
        return this.http.get<Parking[]>(`https://parking40cloud20201029175031.azurewebsites.net/parking/api/`);
    }
}