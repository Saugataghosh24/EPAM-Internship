export interface CarBriefInfo{
    carId:string,
    carRating:string,
    imageUrl:string,
    location:string,
    model:string,
    pricePerDay:string,
    serviceRating:string
    status:'AVAILABLE' | 'BOOKED' | 'UNAVAILABLE'
}