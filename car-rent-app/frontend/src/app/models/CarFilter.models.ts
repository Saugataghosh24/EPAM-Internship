// src/app/shared/models/car-filter.model.ts
export type FuelType = 'PETROL' | 'DIESEL' | 'ELECTRIC' | 'HYBRID' | 'ANY';
export type GearBoxType = 'MANUAL' | 'AUTOMATIC' | 'ANY';
export type CategoryOption = 'PASSENGER' | 'SUV' | 'LUXURY' | 'ECONOMY' | 'ANY';

export interface CarFilterOptions {
  pickupLocation?: string;
  dropoffLocation?: string;
  pickupDate?: string;
  dropoffDate?: string;
  fuelType?: FuelType;
  gearboxType?: GearBoxType;
  category?: CategoryOption;
  minPrice?: number;
  maxPrice?: number;
}