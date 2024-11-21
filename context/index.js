import React, { createContext, useState } from "react";

const AppContext = createContext();

const AppProvider = ({ children }) => {
  const [authInfo, setAuthInfo] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [rideAccept, setRideAccept] = useState(false);
  const [destinationContext, setDestinationContext] = useState('');
  const [pickUpDetails, setPickUpDetails] = useState('');
  const [selectedDriver, setSelectedDriver] = useState('');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [destination, setDestination] = useState(null);

  return (
    <AppContext.Provider
      value={{
        authInfo,
        setAuthInfo,
        isCompleted, setIsCompleted,
        rideAccept, setRideAccept,
        setDestinationContext, destinationContext,
        setPickUpDetails, pickUpDetails,
        setSelectedDriver, selectedDriver,
        setDestination, destination,
        setCurrentLocation, currentLocation
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export { AppContext, AppProvider };
