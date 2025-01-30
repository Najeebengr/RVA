import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { useFetch } from "@/lib/fetch";
import { icons } from "@/constants/index";
import { formatTime } from "@/lib/utils";
import { DriverCardProps, Service } from "@/types/type";
import CustomButton from "@/components/CustomButton";

const DriverCard = ({ item, selected, setSelected }: DriverCardProps) => {
  const { data: servicesData } = useFetch<Service[]>("/(api)/service");
  // Find service name from fetched services
  const service = servicesData?.find(s => Number(s.id) === Number(item.service_id));
  const serviceName = service ? service.name : 'Loading...';

  const handleSelection = () => {
    // Immediately set the selected driver
    setSelected();
  };

  return (
    <View className="bg-white rounded-xl">
      
      <TouchableOpacity
        onPress={handleSelection}
        activeOpacity={0.7}
        className={`${
          selected === item.id ? "bg-general-600" : "bg-white"
        } flex flex-row items-center justify-between py-5 px-3 rounded-xl`}
      >
        <Image
          source={{ uri: item.profile_image_url }}
          className="w-14 h-14 rounded-full"
        />

        <View className="flex-1 flex flex-col items-start justify-center mx-3">
          <View className="flex flex-row items-center justify-start mb-1">
            <Text className="text-lg font-JakartaRegular">{item.first_name}</Text>

            <View className="flex flex-row items-center space-x-1 ml-2">
              <Image source={icons.star} className="w-3.5 h-3.5" />
              <Text className="text-sm font-JakartaRegular">4</Text>
            </View>
          </View>

          <View className="flex flex-row items-center justify-start mb-2">
            <Text className="text-lg font-JakartaRegular">
              {serviceName}
            </Text>
            
          </View>

          <View className="flex flex-row items-center justify-center">
            <View className="flex flex-row items-center">
              <Image source={icons.dollar} className="w-4 h-4" />
              <Text className="text-sm font-JakartaRegular ml-1">
                ${item.price}
              </Text>
            </View>

            <Text className="text-sm font-JakartaRegular text-general-800 mx-1">
              |
            </Text>
            <Text className="text-sm font-JakartaRegular text-general-800">
              {item.distance}km away
            </Text>

            <Text className="text-sm font-JakartaRegular text-general-800 mx-1">
              |
            </Text>
            <Text className="text-sm font-JakartaRegular text-general-800">
              {formatTime(parseInt(`${item.time}`) || 5)}
            </Text>
            
          </View>
         
          
        </View>

        {/* <Image
          source={{ uri: item.car_image_url }}
          className="h-14 w-14"
          resizeMode="contain"
        /> */}
        
      </TouchableOpacity>
    <View className="flex flex-row items-center justify-center">
      {selected === item.id && (
          <CustomButton
            title="Show Directions"
            onPress={() => setSelected()} // This will refresh the directions
            bgVariant="outline"
            textVariant="primary"
            className="mt-4 w-[50%] border-[1px] border-[#0286FF]"
          />
      )}
      </View>
    </View>
  );
};

export default React.memo(DriverCard);
