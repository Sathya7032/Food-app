import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import MapView, { Marker, Polyline, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import { MaterialIcons } from '@expo/vector-icons';
import haversine from 'haversine-distance';

const LocationMap = ({ restaurantLocation, onLocationUpdate }) => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addressDetails, setAddressDetails] = useState({
    street: 'Fetching location...',
    building: '',
    city: '',
    fullAddress: ''
  });
  const [distance, setDistance] = useState(null);
  const [isServiceable, setIsServiceable] = useState(true);

  const defaultRestaurantLocation = {
    latitude: 17.385409,
    longitude: 78.552648,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  };

  const finalRestaurantLocation = restaurantLocation || defaultRestaurantLocation;

  useEffect(() => {
    fetchLocation();
  }, []);

  useEffect(() => {
    if (location && finalRestaurantLocation) {
      calculateDistance();
    }
  }, [location, finalRestaurantLocation]);

  useEffect(() => {
    if (addressDetails.fullAddress && onLocationUpdate) {
      onLocationUpdate({
        ...addressDetails,
        distance,
        isServiceable,
      });
    }
  }, [addressDetails, distance, isServiceable]);

  const fetchLocation = async () => {
    setLoading(true);
    setErrorMsg(null);
    setIsServiceable(true);

    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setLoading(false);
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation(currentLocation);

      await reverseGeocode(currentLocation.coords.latitude, currentLocation.coords.longitude);
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  const reverseGeocode = async (latitude, longitude) => {
    try {
      let geocode = await Location.reverseGeocodeAsync({ latitude, longitude });

      if (geocode && geocode.length > 0) {
        const { name, street, streetNumber, city } = geocode[0];
        const buildingDetails = name || `${streetNumber} ${street}`;
        const fullAddress = [buildingDetails, street, city].filter(Boolean).join(', ');

        setAddressDetails({
          building: buildingDetails,
          street: street,
          city: city,
          fullAddress
        });
      }
    } catch (error) {
      console.error("Reverse geocode error:", error);
      setErrorMsg("Couldn't fetch address details");
    }
  };

  const calculateDistance = () => {
    if (!location || !finalRestaurantLocation) return;

    const customerCoords = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude
    };

    const restaurantCoords = {
      latitude: finalRestaurantLocation.latitude,
      longitude: finalRestaurantLocation.longitude
    };

    const distanceInMeters = haversine(customerCoords, restaurantCoords);

    if (distanceInMeters > 1000) {
      setDistance(`${(distanceInMeters / 1000).toFixed(1)} km`);
    } else {
      setDistance(`${Math.round(distanceInMeters)} m`);
    }

    // Check if within 5km
    if (distanceInMeters > 5000) {
      setIsServiceable(false);
      setErrorMsg("Sorry, we are not serviceable in your area.");
    } else {
      setIsServiceable(true);
      setErrorMsg(null);
    }
  };

  const handleRefresh = async () => {
    await fetchLocation();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff6b6b" />
        <Text style={styles.loadingText}>Finding your location...</Text>
      </View>
    );
  }

  if (errorMsg && !isServiceable) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{errorMsg}</Text>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{errorMsg}</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <MaterialIcons name="refresh" size={24} color="#ff6b6b" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Address and distance display */}
      <View style={styles.infoContainer}>
        <View style={styles.addressContainer}>
          <Text style={styles.infoText} numberOfLines={1}>
            📍 {addressDetails.building || addressDetails.street}
          </Text>
          {distance && (
            <Text style={styles.distanceText}>
              🚗 {distance} from restaurant
            </Text>
          )}
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <MaterialIcons name="refresh" size={24} color="#ff6b6b" />
        </TouchableOpacity>
      </View>

      {/* Interactive Map */}
      {location && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          {/* Customer Marker */}
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="Your Location"
            pinColor="#ff6b6b"
          />

          {/* Restaurant Marker */}
          <Marker
            coordinate={{
              latitude: finalRestaurantLocation.latitude,
              longitude: finalRestaurantLocation.longitude,
            }}
            title="Our Restaurant"
            description="Your favorite food is here!"
            pinColor="#34abeb"
          >
            <View style={styles.restaurantMarker}>
              <MaterialIcons name="restaurant" size={24} color="white" />
            </View>
          </Marker>

          {/* Circle around restaurant (5km radius) */}
          <Circle
            center={{
              latitude: finalRestaurantLocation.latitude,
              longitude: finalRestaurantLocation.longitude,
            }}
            radius={5000}
            strokeColor="#34abeb"
            fillColor="rgba(52, 171, 235, 0.1)"
          />

          {/* Polyline from customer to restaurant */}
          <Polyline
            coordinates={[
              {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
              },
              {
                latitude: finalRestaurantLocation.latitude,
                longitude: finalRestaurantLocation.longitude
              }
            ]}
            strokeColor="#ff6b6b"
            strokeWidth={2}
            lineDashPattern={[5, 5]}
          />
        </MapView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 350,
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginHorizontal: 15,
    marginTop: 15,
    overflow: 'hidden',
    elevation: 2,
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  errorContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 20,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  addressContainer: {
    flex: 1,
    marginRight: 10,
  },
  infoText: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 3,
  },
  distanceText: {
    fontSize: 13,
    color: '#666',
  },
  refreshButton: {
    padding: 5,
  },
  errorText: {
    color: '#ff6b6b',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },
  restaurantMarker: {
    backgroundColor: '#34abeb',
    padding: 5,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'white',
  },
});

export default LocationMap;
