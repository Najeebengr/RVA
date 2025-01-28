import { router } from "expo-router";
import { useState } from "react";
import { Text, View, TextInput } from "react-native";
  
import CustomButton from "@/components/CustomButton";
import GoogleTextInput from "@/components/GoogleTextInput";
import RideLayout from "@/components/RideLayout";
import { icons } from "@/constants/index";
import { useLocationStore, useServiceStore } from "@/store";
import CustomDropdown from "@/components/CustomDropdown";
import { Service } from "@/types/type";
import { useFetch } from "@/lib/fetch";

const FindRide = () => {
  const {
    userAddress,
    destinationAddress,
    setDestinationLocation,
    setUserLocation,
  } = useLocationStore();
  const { setSelectedService, setRideDetails } = useServiceStore();
  const { data: servicesData } = useFetch<Service[]>("/(api)/service");
  const [selectedService, setLocalSelectedService] = useState<string | null>("1");
  const [vehicleType, setVehicleType] = useState<string>("");
  const [vehicleModel, setVehicleModel] = useState<string>("");
  const [fuelQuantity, setFuelQuantity] = useState<string>("");

  const handleFindNow = () => {
    // Validate required fields based on selected service
    if (selectedService === "1" && (!vehicleType || !vehicleModel)) {
      alert("Please fill in all required fields");
      return;
    }
    if (selectedService === "2" && !vehicleType) {
      alert("Please fill in vehicle type");
      return;
    }
    if (selectedService === "3" && !fuelQuantity) {
      alert("Please enter fuel quantity");
      return;
    }

    console.log('Selected service before navigation:', selectedService, typeof selectedService);
    setSelectedService(selectedService);
    setRideDetails({
      vehicleType,
      vehicleModel,
      fuelQuantity
    });
    router.push("/(root)/confirm-ride");
  };

  return (
    <RideLayout title="Ride">
      <View className="my-3">
        <Text className="text-lg font-JakartaSemiBold mb-3">Location</Text>

        <GoogleTextInput
          icon={icons.target}
          initialLocation={userAddress!}
          containerStyle="bg-neutral-100"
          textInputBackgroundColor="#f5f5f5"
          handlePress={(location) => setUserLocation(location)}
        />
      </View>

      {servicesData && servicesData.length > 0 && (
        <View className="my-2">
          <CustomDropdown
            items={servicesData?.map(service => ({
              label: service.name,
              value: service.id.toString()
            }))}
            onValueChange={(itemValue: string) => {
              console.log('Service selection changed:', itemValue, typeof itemValue);
              setLocalSelectedService(itemValue);
            }}
            selectedValue={selectedService || ""}
            label="Service Type"
          />
        </View>
      )}

      {selectedService === "1" && (
        <>
          <View className="my-2">
            <Text className="text-lg font-JakartaSemiBold mb-2">Vehicle Type<Text className="text-red-500">*</Text></Text>
            <TextInput
              value={vehicleType}
              onChangeText={setVehicleType}
              placeholder="Enter vehicle type (e.g. Car, Motorcycle, Van)"
              className="bg-neutral-100 p-6 rounded-lg"
            />
          </View>

          <View className="my-2">
            <Text className="text-lg font-JakartaSemiBold mb-2">Vehicle Model<Text className="text-red-500">*</Text></Text>
            <TextInput
              value={vehicleModel}
              onChangeText={setVehicleModel}
              placeholder="Enter vehicle model (e.g. Toyota, Honda, BMW)"
              className="bg-neutral-100 p-6 rounded-lg"
            />
          </View>
        </>
      )}

      {selectedService === "3" && (
        <View className="my-2">
          <Text className="text-lg font-JakartaSemiBold mb-2">Fuel Quantity (Liters)<Text className="text-red-500">*</Text></Text>
          <TextInput
            value={fuelQuantity}
            onChangeText={setFuelQuantity}
            placeholder="Enter quantity of fuel needed in liters"
            keyboardType="numeric"
            className="bg-neutral-100 p-6 rounded-lg"
          />
        </View>
      )}

      {selectedService === "2" && (
        <View className="my-2">
          <Text className="text-lg font-JakartaSemiBold mb-2">Vehicle Type<Text className="text-red-500">*</Text></Text>
          <TextInput
            value={vehicleType}
            onChangeText={setVehicleType}
            placeholder="Enter vehicle type (e.g. Car, Motorcycle, Van)"
            className="bg-neutral-100 p-6 rounded-lg"
          />
        </View>
      )}

      <View className="my-3 hidden">
        <Text className="text-lg font-JakartaSemiBold mb-3">To</Text>

        <GoogleTextInput
          icon={icons.map}
          initialLocation={destinationAddress!}
          containerStyle="bg-neutral-100"
          textInputBackgroundColor="transparent"
          handlePress={(location) => setDestinationLocation(location)}
        />
      </View>

      <CustomButton
        title="Find Now"
        onPress={handleFindNow}
        className="mt-5"
      />
    </RideLayout>
  );
};

export default FindRide;
