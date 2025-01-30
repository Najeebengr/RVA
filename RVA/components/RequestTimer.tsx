import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { useFetch } from '@/lib/fetch';

interface RequestTimerProps {
  duration: number; // in seconds
  onTimeout: () => void;
  requestId: string; // Add requestId prop
}

const RequestTimer = ({ duration, onTimeout, requestId }: RequestTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const { data: requestStatus } = useFetch<{ status: string }>(`/(api)/request/fetch/${requestId}`);

  useEffect(() => {
    // Stop timer if request is accepted, rejected, or completed
    if (requestStatus?.status && ['accepted', 'rejected', 'completed', 'paid'].includes(requestStatus.status)) {
      return;
    }

    if (timeLeft <= 0) {
      onTimeout();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeout, requestStatus?.status]);

  // Don't show timer if request is not pending
  if (requestStatus?.status && ['accepted', 'rejected', 'completed', 'paid'].includes(requestStatus.status)) {
    return null;
  }

  return (
    <View className="items-center">
      <Text className="text-lg font-JakartaBold">
        {timeLeft > 0 ? `${timeLeft}s` : 'Time expired!'}
      </Text>
    </View>
  );
};

export default RequestTimer; 