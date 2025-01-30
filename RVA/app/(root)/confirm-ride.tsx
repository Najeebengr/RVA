import { router } from "expo-router";
import { FlatList, View } from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { useState, useRef } from "react";

import CustomButton from "@/components/CustomButton";
import DriverCard from "@/components/DriverCard";
import RideLayout from "@/components/RideLayout";
import { useDriverStore, useLocationStore, useServiceStore, useRequestStore } from "@/store";
import LoadingModal from "@/components/LoadingModal";
import RequestWaitingScreen from "@/components/RequestWaitingScreen";

const ConfirmRide = () => {
  const { user } = useUser();
  const { drivers, selectedDriver, setSelectedDriver } = useDriverStore();
  const { selectedService, rideDetails } = useServiceStore();
  const { userLatitude, userLongitude, userAddress } = useLocationStore();
  const { setCurrentRequest, clearRequest } = useRequestStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showWaiting, setShowWaiting] = useState(false);
  const pollIntervalRef = useRef<NodeJS.Timeout>();
  const currentRequestRef = useRef<string>();

  const filteredDrivers = drivers.filter(driver => {
    const matches = selectedService ? driver.service_id.toString() === selectedService.toString() : true;
    return matches;
  });

  const handleRequestTimeout = async () => {
    if (currentRequestRef.current) {
      try {
        await fetch(`/(api)/request/${currentRequestRef.current}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            requestId: currentRequestRef.current,
            status: 'timeout'
          }),
        });
      } catch (error) {
        console.error('Error updating request status:', error);
      }
    }
    clearRequest();
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
    alert('Request timed out. No drivers available.');
    router.back();
  };

  const handleRequestDriver = async () => {
    if (!selectedDriver || !user) return;

    setIsLoading(true);
    setShowWaiting(true);
    try {
      const response = await fetch("/(api)/request/insert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          driverId: selectedDriver,
          serviceId: selectedService,
          rideDetails,
          userLocation: {
            latitude: userLatitude,
            longitude: userLongitude,
            address: userAddress,
          },
        }),
      });
      const request = await response.json();
      console.log(request , "request");
      currentRequestRef.current = request.id;
      setCurrentRequest(request);

      // Start polling for status updates
      pollIntervalRef.current = setInterval(async () => {
        try {
          const statusResponse = await fetch(`/(api)/request/${request.id}`);
          const { status } = await statusResponse.json();

          if (status === 'accepted') {
            clearInterval(pollIntervalRef.current);
            router.push("/(root)/book-ride");
          } else if (status === 'rejected') {
            clearInterval(pollIntervalRef.current);
            alert("Driver is unavailable. Please try another driver.");
            clearRequest();
            router.back();
          }
        } catch (error) {
          console.error('Error checking request status:', error);
        }
      }, 2000);

    } catch (error) {
      console.error("Error sending ride request:", error);
      alert("Failed to send request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (showWaiting) {
    return <RequestWaitingScreen onTimeout={handleRequestTimeout} />;
  }

  return (
    <RideLayout title={"Choose a Driver"} snapPoints={["65%", "85%"]}>
      <FlatList
        data={filteredDrivers}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <DriverCard
            item={item}
            selected={selectedDriver!}
            setSelected={() => setSelectedDriver(item.id!)}
          />
        )}
        ListFooterComponent={() => (
          <View className="mx-5 mt-10">
            <CustomButton
              title="Request Driver"
              disabled={!selectedDriver || isLoading}
              className={`${!selectedDriver || isLoading ? "opacity-50" : ""}`}
              onPress={handleRequestDriver}
            />
          </View>
        )}
      />
      <LoadingModal 
        visible={isLoading} 
        message="Sending request..."
      />
    </RideLayout>
  );
};

export default ConfirmRide;
