export interface BookCar{
    id?: string,
    carId: string,
    clientId: string,
    dropOffDateTime: string,
    dropOffLocationId: string,
    pickupDateTime: string,
    pickupLocationId: string,
    supportAgentId?:string
}