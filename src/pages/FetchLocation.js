import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';
import axios from 'axios';

const ESP32_IP = "http://192.168.1.43"; // Replace with your ESP32 IP address

const FetchLocation = () => {
  const [locationList, setLocationList] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [address, setAddress] = useState(null);
  const [intervalId, setIntervalId] = useState(null);

  // Fetch the location, get the address, and send coordinates to ESP32
  const fetchAndSendLocation = async () => {
    try {
      const loc = await Location.getCurrentPositionAsync({});
      const locationData = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };

      // Get address from GPS coordinates
      const geocode = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      const fullAddress = geocode.length > 0 ? `${geocode[0].name}, ${geocode[0].city}, ${geocode[0].region}` : "Address not found";
      setAddress(fullAddress);

      // Update the location list for display
      setLocationList((prevList) => [...prevList, locationData]);

      // Send location to ESP32 (only latitude and longitude)
      await axios.post(`${ESP32_IP}/location`, locationData, {
        headers: { 'Content-Type': 'application/json' },
      });

      console.log("Location sent:", locationData);
    } catch (error) {
      console.error("Error sending location:", error);
      Alert.alert('Error', 'Failed to fetch or send location.');
    }
  };

  // Start sending location every 5 seconds
  const startSendingLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Location access is required!');
      return;
    }

    setIsSending(true);
    const id = setInterval(fetchAndSendLocation, 5000);
    setIntervalId(id);
  };

  // Stop sending location and clear location data
  const stopSendingLocation = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    setIsSending(false);
    setLocationList([]); // Clear the list of locations
    setAddress(null); // Clear the displayed address
  };

  // Clear location data manually using the Clear Table button
  const clearLocationData = () => {
    setLocationList([]);
    setAddress(null);
  };

  // Clean up interval when component unmounts
  useEffect(() => {
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [intervalId]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fetch and Send Device Location</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.clearButton, { backgroundColor: '#FF5722' }]}
          onPress={clearLocationData}
        >
          <Text style={styles.buttonText}>Clear Table</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, { backgroundColor: isSending ? '#ccc' : '#4CAF50' }]}
          onPress={!isSending ? startSendingLocation : null}
          disabled={isSending}
        >
          <Text style={styles.buttonText}>Start Sending</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: isSending ? '#F44336' : '#ccc' }]}
          onPress={isSending ? stopSendingLocation : null}
          disabled={!isSending}
        >
          <Text style={styles.buttonText}>Stop Sending</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.locationContainer}>
        <Text style={styles.addressText}>Address: {address}</Text>

        <ScrollView>
          {locationList.map((loc, index) => (
            <View key={index} style={styles.locationItem}>
              <Text style={styles.locationText}>
                #{index + 1} - Latitude: {loc.latitude}, Longitude: {loc.longitude}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: 20,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  clearButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  locationContainer: {
    flex: 1,
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#fff',
  },
  locationItem: {
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  locationText: {
    fontSize: 14,
  },
  addressText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
});

export default FetchLocation;
