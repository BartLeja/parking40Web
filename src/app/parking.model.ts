export class Parking {
    public parkingName : string;
    public coordinates : number[];
    public parkingSpots : ParkingSpot[];
}

export class ParkingSpot {
    public id : string;
    public status: boolean;
    public date : Date;
}