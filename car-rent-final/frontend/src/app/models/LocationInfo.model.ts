import { SafeResourceUrl } from "@angular/platform-browser";


export interface LocationInfo{
    locationId:string,
    locationAddress: string,
    locationName: string,
    locationMapUrl: string,
    locationImageUrl?: string,
    safeMapSrc?:SafeResourceUrl
}
export interface LocationInfoResponse{
    content:LocationInfo[]
}
