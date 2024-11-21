import { child, get, getDatabase, ref } from "firebase/database";
import { getDistance } from 'geolib';

export function getCurrentDrivesOnline(setDrivesOnline) {
    const dbRef = ref(getDatabase());
    get(child(dbRef, 'locations/drivers'))
        .then((snapshot) => {
            if (snapshot.exists()) {
                const response = snapshot.val();
                const driverArray = Object.keys(response).map(key => ({
                    id: key,
                    ...response[key]
                }));
                setDrivesOnline(driverArray);
            } else {
                console.log('No data available');
            }
        })
        .catch((error) => {
            console.error(error);
        });
};

export const filterAndSortLocations = (currentLocation, driverLocations, maxDistance) => {
    if (!currentLocation || !currentLocation.latitude || !currentLocation.longitude) {
      console.error("Invalid current location");
      return [];
    }
  
    return driverLocations
      .filter(driver => {
        if (!driver.latitude || !driver.longitude) return false; // Ensure driver's coordinates exist
        if (!driver.visible) return false; // Only include visible drivers
  
        const distance = getDistance(
          { latitude: currentLocation.latitude, longitude: currentLocation.longitude },
          { latitude: driver.latitude, longitude: driver.longitude }
        );
  
        return distance <= maxDistance; // Filter drivers within the distance
      })
      .sort((a, b) => {
        // Optionally sort by distance (ascending)
        const distanceA = getDistance(
          { latitude: currentLocation.latitude, longitude: currentLocation.longitude },
          { latitude: a.latitude, longitude: a.longitude }
        );
  
        const distanceB = getDistance(
          { latitude: currentLocation.latitude, longitude: currentLocation.longitude },
          { latitude: b.latitude, longitude: b.longitude }
        );
  
        return distanceA - distanceB;
      });
  };
