import { SafeResourceUrl } from "@angular/platform-browser";


export interface LocationInfo{
    locationAddress: string,
    locationId: string,
    locationImageUrl: string,
    locationName: string,
    id:string,
    safeMapSrc?: SafeResourceUrl
}
