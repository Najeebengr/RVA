import { router } from "expo-router";
import { FlatList, View } from "react-native";

import CustomButton from "@/components/CustomButton";
import DriverCard from "@/components/DriverCard";
import RideLayout from "@/components/RideLayout";
import { useDriverStore, useServiceStore } from "@/store";

const ConfirmRide = () => {
  const { drivers, selectedDriver, setSelectedDriver } = useDriverStore();
  const { selectedService } = useServiceStore();

  console.log("Current drivers:", drivers);
  console.log("Selected service in confirm ride:", selectedService);

  const filteredDrivers = drivers.filter(driver => {
    const matches = selectedService ? driver.service_id.toString() === selectedService.toString() : true;
    console.log("Comparing:", {
      driverServiceId: driver.service_id,
      selectedService,
      matches
    });
    return matches;
  });

  console.log("Filtered drivers:", filteredDrivers);

  return (
    <RideLayout title={"Choose a Rider"} snapPoints={["65%", "85%"]}>
      <FlatList
        data={filteredDrivers}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <DriverCard
            item={item}
            selected={selectedDriver!}
            setSelected={() => setSelectedDriver(item.id!)}
          />
        )}
        ListFooterComponent={() => (
          <View className="mx-5 mt-10">
            <CustomButton
              title="Select Driver"
              disabled={!selectedDriver}
              className={`${!selectedDriver ? "opacity-50" : ""}`}
              onPress={() => router.push("/(root)/book-ride")}
            />
          </View>
        )}
      />
    </RideLayout>
  );
};

export default ConfirmRide;
