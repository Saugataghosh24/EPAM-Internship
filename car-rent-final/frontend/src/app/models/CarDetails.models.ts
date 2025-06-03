export type CarStatus = 'AVAILABLE' | 'BOOKED' | 'UNAVAILABLE';
export type FuelType = 'PETROL' | 'DIESEL' | 'ELECTRIC' | 'HYBRID';
export type GearBoxType = 'MANUAL' | 'AUTOMATIC';
export type ClimateControlOption ='NONE'|'AIR_CONDITIONER'| 'CLIMATE_CONTROL'| 'TWO_ZONE_CLIMATE_CONTROL';
  export type CategoryOptions= 'ECONOMY' | 'PREMIUM' | 'CROSSOVER' | 'COMFORT'| 'BUSINESS'| 'MINIVAN'| 'ELECTRIC'

  
export interface CarDetailsResponseBody {
  carId: string;                    // Car ID
  carRating: string;                // Car rating
  climateControlOption: ClimateControlOption;  // Climate control
  engineCapacity: string;          // Engine capacity
  fuelConsumption: string;         // Fuel consumption
  fuelType: FuelType;              // Fuel type
  gearBoxType: GearBoxType;        // Gearbox type
  images: string[];          // Array of image URLs
  location: string;                 // Car location
  model: string;                    // Car brand, model, year
  passengerCapacity: string;       // Passenger capacity
  pricePerDay: string;             // Car price per day
  serviceRating: string;           // Service rating
  status: CarStatus;               // Car status
  carCategory?:CategoryOptions;
}
export interface CarBookedDaysResponseBody {
  content: string[]; // Array of booked days in YYYY-MM-DD format
}
