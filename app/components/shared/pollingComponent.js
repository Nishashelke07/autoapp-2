import React, { useEffect, useRef } from 'react';

const PollingComponent = ({
  visibility, // Controls whether polling should run
  pollFunction, // The async function to poll
  pollInterval = 10000, // Default interval in milliseconds
  stopCondition = false, // Stops polling if true
  onPollResult, // Callback to pass polling results back to the parent
}) => {
  const intervalRef = useRef(null);

  useEffect(() => {
    if (visibility && !stopCondition) {
      console.log('Starting polling...132');
      intervalRef.current = setInterval(async () => {
        try {
          const result = await pollFunction();
          if (result.status) {
            onPollResult(result); // Pass result back to the parent
          }
        } catch (error) {
          console.error('Error during polling:', error);
        }
      }, pollInterval);
    } else {
      console.log('Stopping polling...');
      clearInterval(intervalRef.current);
    }

    // Cleanup interval when dependencies change or component unmounts
    return () => clearInterval(intervalRef.current);
  }, [visibility, stopCondition, pollInterval]);

  return null; // No UI for this component
};

export default PollingComponent;
