import React, { useEffect, useState, useRef } from 'react';
import { View, Text } from 'react-native';

interface RequestTimerProps {
  duration: number;
  onTimeout: () => void;
  requestId: string;
}

const RequestTimer = ({ duration, onTimeout, requestId }: RequestTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [shouldStop, setShouldStop] = useState(false);
  const timerRef = useRef<NodeJS.Timeout>();
  const statusIntervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const checkRequestStatus = async () => {
      if (!requestId) {
        console.log('No requestId provided');
        return;
      }

      try {
        console.log('Checking status for request:', requestId);
        const response = await fetch(`/(api)/request/fetch/${requestId}`);
        const data = await response.json();
        console.log('Request status check:', { requestId, status: data.status });
        
        // Stop timer if request is not pending
        if (data.status && data.status !== 'pending') {
          console.log('Stopping timer - request status:', data.status);
          setShouldStop(true);
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          if (statusIntervalRef.current) {
            clearInterval(statusIntervalRef.current);
          }
        }
      } catch (error) {
        console.error('Error checking request status:', error);
      }
    };

    // Only start if we have a requestId
    if (requestId) {
      // Check status immediately
      checkRequestStatus();
      
      // Set up status checking interval
      statusIntervalRef.current = setInterval(checkRequestStatus, 1000);

      // Set up countdown timer
      if (!shouldStop && timeLeft > 0) {
        timerRef.current = setInterval(() => {
          setTimeLeft(prev => {
            if (prev <= 1) {
              // Clear intervals when time is up
              if (timerRef.current) clearInterval(timerRef.current);
              if (statusIntervalRef.current) clearInterval(statusIntervalRef.current);
              onTimeout();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    }

    // Cleanup function
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (statusIntervalRef.current) clearInterval(statusIntervalRef.current);
    };
  }, [requestId, shouldStop]);

  // Don't render if should stop or no requestId
  if (shouldStop || !requestId) {
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