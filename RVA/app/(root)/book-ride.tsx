import { useUser } from "@clerk/clerk-expo";
import { StripeProvider } from "@stripe/stripe-react-native";
import { Image, Text, View } from "react-native";

import Payment from "@/components/Payment";
import RideLayout from "@/components/RideLayout";
import { icons } from "@/constants/index";
import { formatTime } from "@/lib/utils";
import { useDriverStore, useLocationStore, useServiceStore } from "@/store";
import React from "react";
import { useFetch } from "@/lib/fetch";
import { Service } from "@/types/type";

const BookRide = () => {
  const { user } = useUser();
  const { userAddress, destinationAddress } = useLocationStore();
  const { drivers, selectedDriver } = useDriverStore();
  const { data: servicesData } = useFetch<Service[]>("/(api)/service");
  const driverDetails = drivers?.filter(
    (driver) => +driver.id === selectedDriver,
  )[0];
  const { rideDetails } = useServiceStore();
  return (
    <StripeProvider
      publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!}
      merchantIdentifier="merchant.com.uber"
      urlScheme="myapp"
    >
      <RideLayout title="Book Ride">
        <>
          <Text className="text-xl font-JakartaSemiBold mb-3">
            Ride Information
          </Text>

          <View className="flex flex-col w-full items-center justify-center mt-10">
            <Image
              source={{ uri: driverDetails?.profile_image_url }}
              className="w-28 h-28 rounded-full"
            />

            <View className="flex flex-row items-center justify-center mt-5 space-x-2">
              <Text className="text-lg font-JakartaSemiBold">
                {driverDetails?.first_name}
              </Text>

              <View className="flex flex-row items-center space-x-0.5">
                <Image
                  source={icons.star}
                  className="w-5 h-5"
                  resizeMode="contain"
                />
                <Text className="text-lg font-JakartaRegular">
                  {driverDetails?.rating}
                </Text>
              </View>
            </View>
          </View>

          <View className="flex flex-col w-full items-start justify-center py-3 px-5 rounded-3xl bg-general-600 mt-5">
            <View className="flex flex-row items-center justify-between w-full border-b border-white py-3">
              <Text className="text-lg font-JakartaRegular">Ride Price</Text>
              <Text className="text-lg font-JakartaRegular text-[#0CC25F]">
                ${driverDetails?.price}
              </Text>
            </View>

            <View className="flex flex-row items-center justify-between w-full border-b border-white py-3">
              <Text className="text-lg font-JakartaRegular">Pickup Time</Text>
              <Text className="text-lg font-JakartaRegular">
                {formatTime(parseInt(`${driverDetails?.time}`) || 5)}
              </Text>
            </View>

            <View className="flex flex-row items-center justify-between w-full border-b border-white py-3">
              <Text className="text-lg font-JakartaRegular">Service</Text>
              <Text className="text-lg font-JakartaRegular">
                {servicesData?.find(s => s.id === driverDetails?.service_id.toString())?.name}
              </Text>
            </View>
            { rideDetails?.vehicleType && (driverDetails?.service_id === 2 || driverDetails?.service_id === 1) && (
            <View className="flex flex-row items-center justify-between w-full border-b border-white py-3">
              <Text className="text-lg font-JakartaRegular">Vehicle Type</Text>
              <Text className="text-lg font-JakartaRegular">
                {rideDetails?.vehicleType}
                </Text>
              </View>
            )}
            {rideDetails?.fuelQuantity && driverDetails?.service_id === 3 && (
              <View className="flex flex-row items-center justify-between w-full border-b border-white py-3">
                <Text className="text-lg font-JakartaRegular">Fuel Quantity</Text>
              <Text className="text-lg font-JakartaRegular">
                {rideDetails?.fuelQuantity} Liters              
                </Text>
            </View>
           )}
           {rideDetails?.vehicleModel && driverDetails?.service_id === 1  && (
            <View className="flex flex-row items-center justify-between w-full border-b border-white py-3">
              <Text className="text-lg font-JakartaRegular">Vehicle Model</Text>
              <Text className="text-lg font-JakartaRegular">
                {rideDetails?.vehicleModel}
              </Text>
            </View>
           )}
          </View>

          <View className="flex flex-col w-full items-start justify-center mt-5">
            <View className="flex flex-row items-center justify-start mt-3 border-t border-b border-general-700 w-full py-3">
              <Image source={icons.to} className="w-6 h-6" />
              <Text className="text-lg font-JakartaRegular ml-2">
                {userAddress}
              </Text>
            </View>

          
          </View>

          <Payment
            fullName={user?.fullName!}
            email={user?.emailAddresses[0].emailAddress!}
            amount={driverDetails?.price!}
            driverId={driverDetails?.id}
            rideTime={driverDetails?.time!}
          />
        </>
      </RideLayout>
    </StripeProvider>
  );
};

export default BookRide;
