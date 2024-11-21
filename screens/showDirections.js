import MapViewDirections from "react-native-maps-directions";

export default function ShowDirections (props) {
    const { pickup, destination } = props;
    const key= "AIzaSyDo1tnDHs2gmgdo9fPsig6KBaoz0zIz9zc";

    return (
        <MapViewDirections
              origin={pickup}
              destination={destination}
              apikey={key}
              strokeWidth={3}
              strokeColor="#1E90FF"
            />
    )
}