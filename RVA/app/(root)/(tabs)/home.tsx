import { useUser } from "@clerk/clerk-expo";
import { useAuth } from "@clerk/clerk-expo";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  Platform,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import GoogleTextInput from "@/components/GoogleTextInput";
import Map from "@/components/Map";
import RideCard from "@/components/RideCard";
import { icons, images } from "@/constants/index";
import { useFetch } from "@/lib/fetch";
import { useLocationStore, useServiceStore } from "@/store";
import { Ride, Service } from "@/types/type";
import CustomButton from "@/components/CustomButton";
import React from "react";
import RequestTimer from "@/components/RequestTimer";

interface Request {
  id: string;
  user_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'timeout';
  service_id: string;
  ride_details: {
    vehicleType?: string;
    vehicleModel?: string;
    fuelQuantity?: string;
  };
  user_location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  created_at: string;
}

const DriverView = ({ user, signOut, requests, loadingRequests, handleRequest, renderRequestCard }: { user: any, signOut: any, requests: any, loadingRequests: any, handleRequest: any, renderRequestCard: any }) => (
  <>
    <View className="flex-row items-center justify-between px-5 my-5">
      <Text className="text-2xl capitalize font-JakartaExtraBold">
        Welcome{" "}
        {user?.firstName ||
          user?.emailAddresses[0].emailAddress.split("@")[0]} {" "} 
        👋
      </Text>
      <TouchableOpacity
        onPress={() => signOut()}
        className="justify-center items-center w-10 h-10 rounded-full bg-white"
      >
        <Image source={icons.out} className="w-4 h-4" />
      </TouchableOpacity>
    </View>

    <Text className="text-xl font-JakartaBold px-5 mb-3">
      Incoming Requests
    </Text>
    {requests.length === 0 ? (
      <View className="flex-1 justify-center items-center">
        <Text className="text-lg text-gray-500 font-JakartaMedium">
          No pending requests
        </Text>
      </View>
    ) : (
      <FlatList
        data={requests}
        renderItem={renderRequestCard}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    )}
  </>
);

const UserView = ({ user, signOut, recentRides, loading, userAddress, handleInitialLocationPress }: { user: any, signOut: any, recentRides: any, loading: any, userAddress: any, handleInitialLocationPress: any }) => {
  if (!user) return null;

  return (
    <FlatList
      data={recentRides?.slice(0, 5)}
      renderItem={({ item }) => <RideCard ride={item} />}
      keyExtractor={(item, index) => index.toString()}
      className="px-5"
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{
        paddingBottom: 100,
      }}
      ListEmptyComponent={() => (
        <View className="flex flex-col items-center justify-center">
          {!loading ? (
            <>
              <Image
                source={images.noResult}
                className="w-40 h-40"
                alt="No recent rides found"
                resizeMode="contain"
              />
              <Text className="text-sm">No recent rides found</Text>
            </>
          ) : (
            <ActivityIndicator size="small" color="#000" />
          )}
        </View>
      )}
      ListHeaderComponent={
        <>
          <View className="flex flex-row items-center justify-between my-5">
            <Text className="text-2xl capitalize font-JakartaExtraBold">
              Welcome{" "}
              {user?.firstName ||
                user?.emailAddresses[0]?.emailAddress?.split("@")[0]} {" "} 
              👋
            </Text>
            <TouchableOpacity
              onPress={() => signOut()}
              className="justify-center items-center w-10 h-10 rounded-full bg-white"
            >
              <Image source={icons.out} className="w-4 h-4" />
            </TouchableOpacity>
          </View>

          <GoogleTextInput
            icon={icons.target}
            initialLocation={userAddress}
            containerStyle="bg-neutral-100 shadow-md shadow-neutral-300"
            textInputBackgroundColor="#f5f5f5"
            handlePress={handleInitialLocationPress}
          />

          <View className="flex flex-row items-center justify-start mt-5">
            <CustomButton
              title="Find Driver with Current Location"
              onPress={() => router.push("/(root)/find-ride")}
            />
          </View>

          <Text className="text-xl font-JakartaBold mt-5 mb-3">
            Your current location
          </Text>
          <View className="flex flex-row items-center bg-transparent h-[300px]">
            {Platform.OS === 'web' ? (
              <View 
                style={{ 
                  width: "100%", 
                  height: "100%", 
                  backgroundColor: "#f0f0f0",
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: 16,
                }}
              >
                <Text>Map is only available on mobile devices</Text>
              </View>
            ) : (
              <Map />
            )}
          </View>

          <Text className="text-xl font-JakartaBold mt-5 mb-3">
            Recent Rides
          </Text>
        </>
      }
    />
  );
};

const Home = () => {
  const { user } = useUser();
  const { signOut } = useAuth();
  const { setUserLocation, setDestinationLocation, userAddress } = useLocationStore();
  const [isDriver, setIsDriver] = useState<boolean>(false);
  const [requests, setRequests] = useState<Request[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [driverId, setDriverId] = useState<string | null>(null);
  
  const { data: servicesData, loading: servicesLoading } = useFetch<Service[]>("/(api)/service");
  const { data: recentRides, loading: ridesLoading } = useFetch<Ride[]>(`/(api)/ride/${user?.id}`);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await checkUserRole();
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    const initLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      let location = await Location.getCurrentPositionAsync({});
      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords?.latitude!,
        longitude: location.coords?.longitude!,
      });

      setUserLocation({
        latitude: location.coords?.latitude,
        longitude: location.coords?.longitude,
        address: `${address[0].name}, ${address[0].region}`,
      });
    };

    initLocation();
  }, []);

  // Add polling for driver requests
  useEffect(() => {
    if (isDriver && driverId) {
      fetchPendingRequests();
      const interval = setInterval(fetchPendingRequests, 3000);
      return () => clearInterval(interval);
    }
  }, [isDriver, driverId]);

  const fetchPendingRequests = async () => {
    if (!driverId) return;
    
    try {
      const response = await fetch(`/(api)/request/pending/${driverId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch requests');
      }
      const data = await response.json();
      setRequests(data);
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    }
  };

  const checkUserRole = async () => {
    try {
      const response = await fetch(`/(api)/user/role/${user?.id}`);
      const data = await response.json();
      setIsDriver(data.user_type === 'driver');
      if (data.user_type === 'driver') {
        setDriverId(data.driver_id);
        // console.log(data , "driverId");
      }
    } catch (error) {
      console.error('Error checking user role:', error);
    }
  };

  const handleInitialLocationPress = (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => {
    setUserLocation(location);
    router.push("/(root)/find-ride");
  };

  const handleRequest = async (requestId: string, status: 'accepted' | 'rejected' | 'timeout') => {
    setLoadingRequests(true);
    try {
      await fetch(`/(api)/request/fetch/${requestId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId,
          status
        }),
      });

      // If accepted, start polling for payment completion
      if (status === 'accepted') {
        let attempts = 0;
        const maxAttempts = 60; // 1 minute timeout
        
        const checkStatusInterval = setInterval(async () => {
          try {
            const response = await fetch(`/(api)/request/fetch/${requestId}`);
            const data = await response.json();
            
            if (data.status === 'paid_and_created') {
              clearInterval(checkStatusInterval);
              const url = `https://www.google.com/maps/dir/?api=1&destination=${data.user_location.latitude},${data.user_location.longitude}`;
              await Linking.openURL(url);
            }

            attempts++;
            if (attempts >= maxAttempts) {
              clearInterval(checkStatusInterval);
            }
          } catch (error) {
            console.error('Error checking request status:', error);
          }
        }, 1000);
      }

      setRequests(prev => prev.filter(req => req.id !== requestId));
    } catch (error) {
      console.error('Error updating request:', error);
    } finally {
      setLoadingRequests(false);
    }
  };

  const renderRequestCard = ({ item }: { item: Request }) => {
    if (servicesLoading || !servicesData) {
      return (
        <View className="bg-white p-4 rounded-xl mb-4 mx-4">
          <ActivityIndicator size="small" color="#000" />
        </View>
      );
    }

    // Convert both IDs to numbers for comparison
    const service = servicesData.find(s => Number(s.id) === Number(item.service_id));
    console.log('Service lookup:', {
      services: servicesData,
      requestServiceId: item.service_id,
      foundService: service
    });
    
    const serviceName = service ? service.name : 'Unknown Service';
    const timeAgo = new Date(item.created_at).toLocaleTimeString();

    return (
      <View className="bg-white p-4 rounded-xl mb-4 mx-4">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-lg font-JakartaSemiBold">{serviceName}</Text>
          <Text className="text-sm text-gray-500">{timeAgo}</Text>
        </View>

        <View className="mb-3">
          <Text className="text-gray-700 mb-1">Pickup Location:</Text>
          <Text className="font-JakartaMedium">{item.user_location.address}</Text>
        </View>

        {item.service_id === "1" && (
          <>
            <Text className="text-gray-700">Vehicle: {item.ride_details.vehicleType}</Text>
            <Text className="text-gray-700 mb-2">Model: {item.ride_details.vehicleModel}</Text>
          </>
        )}
        {item.service_id === "2" && (
          <Text className="text-gray-700 mb-2">Vehicle: {item.ride_details.vehicleType}</Text>
        )}
        {item.service_id === "3" && (
          <Text className="text-gray-700 mb-2">Fuel Quantity: {item.ride_details.fuelQuantity} Liters</Text>
        )}

        <RequestTimer 
          duration={30} 
          onTimeout={() => handleRequest(item.id, 'timeout')} 
          requestId={item.id}
        />

        <View className="flex-row justify-between mt-2">
          <TouchableOpacity 
            onPress={() => handleRequest(item.id, 'accepted')}
            disabled={loadingRequests}
            className="bg-[#0286FF] py-2 px-6 rounded-lg flex-1 mr-2"
          >
            <Text className="text-white text-center font-JakartaMedium">Accept</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => handleRequest(item.id, 'rejected')}
            disabled={loadingRequests}
            className="bg-red-500 py-2 px-6 rounded-lg flex-1 ml-2"
          >
            <Text className="text-white text-center font-JakartaMedium">Reject</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="bg-general-500 flex-1">
      {isDriver ? (
        <DriverView 
          user={user}
          signOut={signOut}
          requests={requests}
          loadingRequests={loadingRequests}
          handleRequest={handleRequest}
          renderRequestCard={renderRequestCard}
        />
      ) : (
        <UserView
          user={user}
          signOut={signOut}
          recentRides={recentRides}
          loading={ridesLoading}
          userAddress={userAddress}
          handleInitialLocationPress={handleInitialLocationPress}
        />
      )}
    </SafeAreaView>
  );
};

export default Home;
