import { View, StyleSheet } from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

export default function InputLocation(props) {

  return (
    <View>
      <GooglePlacesAutocomplete
        placeholder="Search"
        onPress={(data, details = null) => {
          const destinationDetails = {
            latitude: details?.geometry.location.lat,
            longitude: details?.geometry.location.lng,
            name: details?.name,
            key: details?.place_id,
          };
          props.setDestination(destinationDetails);
        }}
        fetchDetails
        query={{
          key: "AIzaSyDo1tnDHs2gmgdo9fPsig6KBaoz0zIz9zc",
          language: "en",
          components: "country:in",
          location: `${props.bounds?.lat},${props.bounds?.lng}`,
          radius: `${props.bounds?.radius}`,
          strictbounds: true,
        }}
        styles={{
          textInput: styles.input,
          listView: styles.listView,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    flex: 1,
    height: 40,
    borderColor: "gray",
    borderBottomWidth: 0.2,
    borderRadius: 5,
    paddingLeft: 40,
    zIndex: 0,
    paddingHorizontal: 2,
  },
  listView: {
    borderWidth: 1,
    borderColor: "gray",
    backgroundColor: "white",
    borderRadius: 5,
    marginTop: 10,
  },
});
