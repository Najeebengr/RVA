import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import RequestTimer from './RequestTimer';

interface RequestWaitingScreenProps {
  onTimeout: () => void;
  requestId: string;
}

const RequestWaitingScreen = ({ onTimeout , requestId}: RequestWaitingScreenProps) => {
  return (
    <View className="flex-1 justify-center items-center bg-white">
      <ActivityIndicator size="large" color="#0286FF" />
      <Text className="text-xl font-JakartaBold mt-4 mb-2">
        Waiting for driver response
      </Text>
      <RequestTimer duration={30} onTimeout={onTimeout} requestId={requestId} />
      <Text className="text-sm text-gray-500 mt-2">
        Request will expire in
      </Text>
    </View>
  );
};

export default RequestWaitingScreen; 