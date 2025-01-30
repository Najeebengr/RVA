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

interface ServiceState {
  selectedService: string | null;
  rideDetails: RideDetails;
  setSelectedService: (serviceId: string | null) => void;
  setRideDetails: (details: RideDetails) => void;
}

export const useServiceStore = create<ServiceState>((set) => ({
  selectedService: null,
  rideDetails: {},
  setSelectedService: (serviceId: string | null) => {
    // Ensure serviceId is string if not null
    const normalizedId = serviceId ? serviceId.toString() : null;
    set({ selectedService: normalizedId });
  },
  setRideDetails: (details: RideDetails) => set((state) => ({ 
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

// Add to existing types
interface RideRequest {
  id?: string;
  userId: string;
  driverId: number;
  status: 'pending' | 'accepted' | 'rejected' | 'timeout';
  serviceId: string;
  rideDetails: RideDetails;
  userLocation: {
    latitude: number | null;
    longitude: number | null;
    address: string | null;
  };
}

interface RequestStore {
  currentRequest: RideRequest | null;
  requestStatus: 'pending' | 'accepted' | 'rejected' | 'timeout' | null;
  setCurrentRequest: (request: RideRequest) => void;
  clearRequest: () => void;
  updateRequestStatus: (status: 'pending' | 'accepted' | 'rejected' | 'timeout') => void;
}

export const useRequestStore = create<RequestStore>((set) => ({
  currentRequest: null,
  requestStatus: null,
  setCurrentRequest: (request) => set({ currentRequest: request, requestStatus: 'pending' }),
  clearRequest: () => set({ currentRequest: null, requestStatus: null }),
  updateRequestStatus: (status) => set({ requestStatus: status }),
}));
