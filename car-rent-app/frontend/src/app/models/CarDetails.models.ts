export type CarStatus = 'AVAILABLE' | 'BOOKED' | 'UNAVAILABLE';
export type FuelType = 'PETROL' | 'DIESEL' | 'ELECTRIC' | 'HYBRID';
export type GearBoxType = 'MANUAL' | 'AUTOMATIC';
export type ClimateControlOption =
  | 'NONE'
  | 'AIR_CONDITIONER'
  | 'CLIMATE_CONTROL'
  | 'TWO_ZONE_CLIMATE_CONTROL';
  export type CategoryOptions= 'Passenger' | 'SUV' | 'LUXURY' | 'ECONOMY'

  
export interface CarDetailsResponseBody {
  carId: string;                    // Car ID
  model: string;                    // Car brand, model, year
  location: string;                 // Car location
  pricePerDay: string;             // Car price per day
  carRating: string;                // Car rating
  serviceRating: string;           // Service rating
  status: CarStatus;               // Car status
  carCategory:string
  engineCapacity: string;          // Engine capacity
  fuelConsumption: string;         // Fuel consumption
  fuelType: FuelType;              // Fuel type
  gearBoxType: GearBoxType;        // Gearbox type
  climateControlOption: ClimateControlOption;  // Climate control
  passengerCapacity: string;       // Passenger capacity
  images: string[];                // Array of image URLs
}
