import React from 'react';
import { Modal, View, Text, ActivityIndicator } from 'react-native';

interface LoadingModalProps {
  visible: boolean;
  message: string;
}

const LoadingModal = ({ visible, message }: LoadingModalProps) => {
  return (
    <Modal transparent visible={visible}>
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-white p-5 rounded-xl items-center">
          <ActivityIndicator size="large" color="#0286FF" />
          <Text className="mt-3 text-lg font-JakartaMedium">{message}</Text>
        </View>
      </View>
    </Modal>
  );
};

export default LoadingModal; 