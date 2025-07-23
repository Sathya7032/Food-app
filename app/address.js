import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  FlatList,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import useAxios from './auth/useAxios';

const Address = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [currentAddress, setCurrentAddress] = useState({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    landmark: '',
    addressType: 'Home',
    latitude: 0,
    longitude: 0
  });
  const axiosInstance = useAxios();

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/customer/get-customer-address');
      setAddresses(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch addresses');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to save addresses');
        return;
      }

      setLoading(true);
      let location = await Location.getCurrentPositionAsync({});
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      setCurrentAddress(prev => ({
        ...prev,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      }));
      setMapModalVisible(true);
    } catch (err) {
      Alert.alert('Error', 'Failed to get current location');
      console.error('Location error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setCurrentAddress(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddAddress = async () => {
    try {
      setLoading(true);
      await axiosInstance.post('/customer/add-address', currentAddress);
      await fetchAddresses();
      setModalVisible(false);
      Alert.alert('Success', 'Address added successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add address');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAddress = async (id) => {
    try {
      setLoading(true);
      await axiosInstance.put(`/customer/update-address/${id}`, currentAddress);
      await fetchAddresses();
      setModalVisible(false);
      setEditMode(false);
      Alert.alert('Success', 'Address updated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update address');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      setLoading(true);
      await axiosInstance.delete(`/customer/delete-address/${id}`);
      await fetchAddresses();
      Alert.alert('Success', 'Address deleted successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete address');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (address) => {
    setCurrentAddress(address);
    setCurrentLocation({
      latitude: address.latitude,
      longitude: address.longitude
    });
    setEditMode(true);
    setModalVisible(true);
  };

  const openAddModal = () => {
    setCurrentAddress({
      street: '',
      city: '',
      state: '',
      postalCode: '',
      landmark: '',
      addressType: 'Home',
      latitude: 0,
      longitude: 0
    });
    setEditMode(false);
    setModalVisible(true);
  };

  const confirmLocation = () => {
    setMapModalVisible(false);
  };

  const renderAddressItem = ({ item }) => (
    <View style={styles.addressCard}>
      <View style={styles.addressHeader}>
        <Text style={styles.addressType}>{item.addressType}</Text>
        <View style={styles.addressActions}>
          <TouchableOpacity onPress={() => openEditModal(item)}>
            <MaterialIcons name="edit" size={24} color="#ff6b6b" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDeleteAddress(item.id)}>
            <MaterialIcons name="delete" size={24} color="#ff6b6b" />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.addressText}>{item.street}</Text>
      <Text style={styles.addressText}>{item.city}, {item.state} {item.postalCode}</Text>
      {item.landmark && <Text style={styles.addressText}>Landmark: {item.landmark}</Text>}
      <TouchableOpacity 
        style={styles.viewOnMapButton}
        onPress={() => {
          setCurrentLocation({
            latitude: item.latitude,
            longitude: item.longitude
          });
          setMapModalVisible(true);
        }}
      >
        <Text style={styles.viewOnMapText}>View on Map</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && addresses.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff6b6b" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={40} color="#ff6b6b" />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
        <Text style={styles.addButtonText}>Add New Address</Text>
      </TouchableOpacity>

      <FlatList
        data={addresses}
        renderItem={renderAddressItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
      />

      {/* Address Form Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editMode ? 'Edit Address' : 'Add New Address'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Street"
              value={currentAddress.street}
              onChangeText={text => handleInputChange('street', text)}
            />

            <TextInput
              style={styles.input}
              placeholder="City"
              value={currentAddress.city}
              onChangeText={text => handleInputChange('city', text)}
            />

            <TextInput
              style={styles.input}
              placeholder="State"
              value={currentAddress.state}
              onChangeText={text => handleInputChange('state', text)}
            />

            <TextInput
              style={styles.input}
              placeholder="Postal Code"
              value={currentAddress.postalCode}
              onChangeText={text => handleInputChange('postalCode', text)}
              keyboardType="numeric"
            />

            <TextInput
              style={styles.input}
              placeholder="Landmark (Optional)"
              value={currentAddress.landmark}
              onChangeText={text => handleInputChange('landmark', text)}
            />

            <TouchableOpacity 
              style={styles.getLocationButton}
              onPress={getCurrentLocation}
              disabled={loading}
            >
              <MaterialIcons name="location-on" size={20} color="#fff" />
              <Text style={styles.getLocationText}>
                {currentAddress.latitude ? 'Update Location' : 'Get Current Location'}
              </Text>
            </TouchableOpacity>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={editMode ? () => handleUpdateAddress(currentAddress.id) : handleAddAddress}
                disabled={loading || !currentAddress.latitude}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>
                    {editMode ? 'Update' : 'Save'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Map View Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={mapModalVisible}
        onRequestClose={() => setMapModalVisible(false)}
      >
        <View style={styles.mapContainer}>
          {currentLocation && (
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              }}
            >
              <Marker
                coordinate={{
                  latitude: currentLocation.latitude,
                  longitude: currentLocation.longitude
                }}
                title="Your Location"
              />
            </MapView>
          )}
          <View style={styles.mapButtons}>
            <TouchableOpacity
              style={[styles.mapButton, styles.confirmButton]}
              onPress={confirmLocation}
            >
              <Text style={styles.mapButtonText}>Confirm Location</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.mapButton, styles.backButton]}
              onPress={() => setMapModalVisible(false)}
            >
              <Text style={styles.mapButtonText}>Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 20,
  },
  addressCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  addressType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  addressActions: {
    flexDirection: 'row',
    gap: 12,
  },
  addressText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  viewOnMapButton: {
    marginTop: 8,
    paddingVertical: 4,
  },
  viewOnMapText: {
    color: '#ff6b6b',
    fontSize: 14,
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: '#ff6b6b',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#ff6b6b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '90%',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
  },
  getLocationButton: {
    backgroundColor: '#ff6b6b',
    padding: 12,
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  getLocationText: {
    color: '#fff',
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  modalButton: {
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  saveButton: {
    backgroundColor: '#ff6b6b',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  mapButtons: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mapButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  confirmButton: {
    backgroundColor: '#ff6b6b',
  },
  backButton: {
    backgroundColor: '#333',
  },
  mapButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default Address;