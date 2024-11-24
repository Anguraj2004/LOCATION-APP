import React from 'react';
import { View, Text } from 'react-native';

const DisplayLocation = ({ route }) => {
  const { location } = route.params || {};

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Received Location:</Text>
      {location ? (
        <Text>
          Latitude: {location.latitude}, Longitude: {location.longitude}
        </Text>
      ) : (
        <Text>No location data received.</Text>
      )}
    </View>
  );
};

export default DisplayLocation;
