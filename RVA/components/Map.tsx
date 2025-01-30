import React, { useEffect, useState, useCallback, useRef } from "react";
import { ActivityIndicator, Platform, Text, View } from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";

import { icons } from "@/constants/index";
import { useFetch } from "@/lib/fetch";
import { generateMarkersFromData } from "@/lib/map";
import { useDriverStore, useLocationStore, useServiceStore } from "@/store";
import { Driver, MarkerData } from "@/types/type";

const directionsAPI = process.env.EXPO_PUBLIC_DIRECTIONS_API_KEY;

function Map() {
  const { userLatitude, userLongitude } = useLocationStore();
  const { selectedDriver, drivers, setDrivers, setSelectedDriver } = useDriverStore();
  const selectedService = useServiceStore((state) => state.selectedService);
  const mapRef = useRef<MapView>(null);
  const [directionsKey, setDirectionsKey] = useState(0);
  const [isUpdatingDirections, setIsUpdatingDirections] = useState(false);

  const { data: driversResponse, loading, error } = useFetch<Driver[]>("/(api)/driver");
  
  useEffect(() => {
    const driversData = driversResponse;
    if (Array.isArray(driversData) && userLatitude && userLongitude) {
      const filteredDrivers = driversData.filter(driver => 
        selectedService ? driver.service_id === selectedService : true
      );

      const newMarkers = generateMarkersFromData({
        data: filteredDrivers,
        userLatitude,
        userLongitude,
      });
      setDrivers(newMarkers);
    }
  }, [driversResponse, userLatitude, userLongitude, selectedService]);

  const handleMarkerPress = useCallback((markerId: number) => {
    if (!isUpdatingDirections) {
      setIsUpdatingDirections(true);
      setSelectedDriver(markerId);
      setDirectionsKey(prev => prev + 1);
      requestAnimationFrame(() => {
        setIsUpdatingDirections(false);
      });
    }
  }, [isUpdatingDirections]);

  useEffect(() => {
    if (selectedDriver && !isUpdatingDirections) {
      setIsUpdatingDirections(true);
      setDirectionsKey(prev => prev + 1);

      const marker = drivers.find(d => d.id === selectedDriver);
      if (marker && userLatitude && userLongitude && mapRef.current) {
        mapRef.current.fitToCoordinates([
          { latitude: userLatitude, longitude: userLongitude },
          { latitude: marker.latitude, longitude: marker.longitude }
        ], {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true
        });
      }

      requestAnimationFrame(() => {
        setIsUpdatingDirections(false);
      });
    }
  }, [selectedDriver, drivers, userLatitude, userLongitude]);

  const selectedDriverMarker = drivers.find(d => d.id === selectedDriver);

  if (loading || (!userLatitude && !userLongitude))
    return (
      <View className="flex justify-between items-center w-full">
        <ActivityIndicator size="small" color="#000" />
      </View>
    );

  if (error)
    return (
      <View className="flex justify-between items-center w-full">
        <Text>Error: {error}</Text>
      </View>
    );

  return (
    <MapView
      ref={mapRef}
      style={{ width: "100%", height: "100%" }}
      provider={PROVIDER_DEFAULT}
      className="w-full h-full rounded-2xl"
      tintColor="black"
      mapType={Platform.OS === 'ios' ? 'mutedStandard' : 'standard'}
      showsPointsOfInterest={false}
      initialRegion={{
        latitude: Number(userLatitude) || 37.78825,
        longitude: Number(userLongitude) || -122.4324,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
      showsUserLocation={true}
      userInterfaceStyle="light"
    >
      {drivers.map((marker) => (
        <Marker
          key={marker.id}
          coordinate={{
            latitude: Number(marker.latitude),
            longitude: Number(marker.longitude),
          }}
          title={`${marker.first_name} (${marker.distance}km away)`}
          description={`${marker.time} mins | $${marker.price}`}
          image={selectedDriver === marker.id ? icons.selectedMarker : icons.marker}
          onPress={() => handleMarkerPress(marker.id)}
        />
      ))}

      {selectedDriverMarker && userLatitude && userLongitude && !isUpdatingDirections && (
        <MapViewDirections
          key={`directions-${directionsKey}-${selectedDriver}`}
          origin={{
            latitude: Number(userLatitude),
            longitude: Number(userLongitude),
          }}
          destination={{
            latitude: Number(selectedDriverMarker.latitude),
            longitude: Number(selectedDriverMarker.longitude),
          }}
          apikey={directionsAPI!}
          strokeColor="#0286FF"
          strokeWidth={3}
        />
      )}
    </MapView>
  );
}

export default Map;
