import type React from "react"
import { useState } from "react"
import { View, Text } from "react-native"
import { Picker } from "@react-native-picker/picker"

interface DropdownItem {
  label: string
  value: string
}

interface CustomDropdownProps {
  items: DropdownItem[]
  onValueChange: (itemValue: string, itemIndex: number) => void
  selectedValue: string
  label: string
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({ items, onValueChange, selectedValue, label }) => {
  return (
    <View className="bg-transparent rounded-full">
      <Text className="text-lg font-JakartaSemiBold mb-3">{label}</Text>
      <View className="bg-transparent rounded-full">
        <Picker selectedValue={selectedValue} onValueChange={onValueChange}>
          {items.map((item) => (
            <Picker.Item key={item.value} label={item.label} value={item.value} />
          ))}
        </Picker>
      </View>
    </View>
  )
}


export default CustomDropdown

