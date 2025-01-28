import { create } from "zustand";

import { DriverStore, LocationStore, MarkerData, Service } from "@/types/type";

// New store for services
interface RideDetails {
  vehicleType?: string;
  vehicleModel?: string;
  fuelQuantity?: string;
}

interface ServiceStore {
  services: Service[];
  selectedService: string | null;
  rideDetails: RideDetails;
  setServices: (services: Service[]) => void;
  setSelectedService: (serviceId: string | null) => void;
  getServiceName: (serviceId: string) => string;
  setRideDetails: (details: RideDetails) => void;
}

export const useServiceStore = create<ServiceStore>((set, get) => ({
  services: [],
  selectedService: null,
  rideDetails: {},
  setServices: (services) => {
    console.log('Setting services:', services);
    set({ services: services || [] }); // Access the data property from API response
  },
  setSelectedService: (serviceId) => {
    console.log('Setting selected service:', serviceId);
    set({ selectedService: serviceId });
  },
  getServiceName: (serviceId) => {
    const services = get().services;
    console.log('Current services:', services);
    console.log('Looking for service ID:', serviceId);
    const service = services.find(s => s.id.toString() === serviceId.toString());
    console.log('Found service:', service);
    return service ? service.name : 'Unknown Service';
  },
  setRideDetails: (details) => set((state) => ({ 
    ...state, 
    rideDetails: details 
  })),
}));

export const useLocationStore = create<LocationStore>((set) => ({
  userLatitude: null,
  userLongitude: null,
  userAddress: null,
  destinationLatitude: null,
  destinationLongitude: null,
  destinationAddress: null,
  setUserLocation: ({
    latitude,
    longitude,
    address,
  }: {
    latitude: number;
    longitude: number;
    address: string;
  }) => {
    console.log('Setting user location:', { latitude, longitude, address });
    set(() => ({
      userLatitude: latitude,
      userLongitude: longitude,
      userAddress: address,
    }));

    // if driver is selected and now new location is set, clear the selected driver
    const { selectedDriver, clearSelectedDriver } = useDriverStore.getState();
    if (selectedDriver) clearSelectedDriver();
  },

  setDestinationLocation: ({
    latitude,
    longitude,
    address,
  }: {
    latitude: number;
    longitude: number;
    address: string;
  }) => {
    set(() => ({
      destinationLatitude: latitude,
      destinationLongitude: longitude,
      destinationAddress: address,
    }));

    // if driver is selected and now new location is set, clear the selected driver
    const { selectedDriver, clearSelectedDriver } = useDriverStore.getState();
    if (selectedDriver) clearSelectedDriver();
  },
}));

export const useDriverStore = create<DriverStore>((set) => ({
  drivers: [] as MarkerData[],
  selectedDriver: null,
  setSelectedDriver: (driverId: number) => {
    console.log(driverId);
    set({ selectedDriver: driverId });
  },
  setDrivers: (drivers: MarkerData[]) => set({ drivers }),
  clearSelectedDriver: () => set({ selectedDriver: null }),
}));
