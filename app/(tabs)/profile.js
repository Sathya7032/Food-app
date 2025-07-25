import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import useAxios from "../auth/useAxios";
import { useNavigation } from "@react-navigation/native";
import { router } from "expo-router";

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    addresses: [],
    deliveredOrdersCount: 0,
    processingOrdersCount: 0,
    cancelledOrdersCount: 0,
  });
  const axiosInstance = useAxios();

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await axiosInstance.get("/customer/profile");
        setProfileData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Profile</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <Image
            source={{
              uri: `https://ui-avatars.com/api/?name=${
                profileData.fullName || "User"
              }&background=ff6b6b&color=fff&size=150`,
            }}
            style={styles.avatar}
          />
          
          <Text style={styles.userName}>{profileData.fullName || "USER"}</Text>
          <Text style={styles.userEmail}>{profileData.email}</Text>
          
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => router.push('/EditProfile')}
          >
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="info" size={20} color="#ff6b6b" />
            <Text style={styles.sectionTitle}>Personal Information</Text>
          </View>
          
          <View style={styles.infoItem}>
            <MaterialIcons name="person" size={20} color="#7D7D7D" />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Full Name</Text>
              <Text style={styles.infoValue}>{profileData.fullName || "Not provided"}</Text>
            </View>
          </View>
          
          <View style={styles.infoItem}>
            <MaterialIcons name="email" size={20} color="#7D7D7D" />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{profileData.email}</Text>
            </View>
          </View>
          
          <View style={styles.infoItem}>
            <MaterialIcons name="phone" size={20} color="#7D7D7D" />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{profileData.mobile}</Text>
            </View>
          </View>
        </View>

        {/* Address Section */}
        <View style={styles.infoSection}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="location-on" size={20} color="#ff6b6b" />
            <Text style={styles.sectionTitle}>Saved Addresses</Text>
          </View>
          
          {profileData.addresses.length > 0 ? (
            profileData.addresses.map((address) => (
              <View key={address.id} style={styles.addressCard}>
                <View style={styles.addressHeader}>
                  <Text style={styles.addressType}>{address.addressType}</Text>
                  {address.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultBadgeText}>Default</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.addressText}>
                  {address.street}, {address.city}
                </Text>
                <Text style={styles.addressText}>
                  {address.state}, {address.postalCode}
                </Text>
                {address.landmark && (
                  <Text style={styles.addressText}>Landmark: {address.landmark}</Text>
                )}
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No addresses saved</Text>
          )}
          
          <TouchableOpacity style={styles.addButton} onPress={()=>router.push('/address')}>
            <Text style={styles.addButtonText}>+ Add New Address</Text>
          </TouchableOpacity>
        </View>

        {/* Order Stats */}
        <View style={styles.statsSection}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="shopping-bag" size={20} color="#ff6b6b" />
            <Text style={styles.sectionTitle}>Order Summary</Text>
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{profileData.processingOrdersCount || 0}</Text>
              <Text style={styles.statLabel}>Processing</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{profileData.deliveredOrdersCount || 0}</Text>
              <Text style={styles.statLabel}>Delivered</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{profileData.cancelledOrdersCount || 0}</Text>
              <Text style={styles.statLabel}>Cancelled</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.viewAllButton}>
            <Text style={styles.viewAllButtonText}>View All Orders</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  container: {
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ff6b6b",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F8F9FA",
  },
  errorText: {
    color: "#DC3545",
    fontSize: 16,
    textAlign: "center",
  },
  header: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#ff6b6b",
    textAlign: 'center'
  },
  profileCard: {
    alignItems: "center",
    padding: 25,
    backgroundColor: "#FFFFFF",
    margin: 15,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
    
  },
  userName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#ff6b6b",
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: "#ff6b6b",
    marginBottom: 20,
  },
  editButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ff6b6b",
  },
  editButtonText: {
    color: "#ff6b6b",
    fontWeight: "600",
  },
  infoSection: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#212529",
    marginLeft: 10,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  infoText: {
    marginLeft: 15,
  },
  infoLabel: {
    fontSize: 12,
    color: "#6C757D",
    marginBottom: 3,
  },
  infoValue: {
    fontSize: 16,
    color: "#212529",
  },
  addressCard: {
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  addressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  addressType: {
    fontWeight: "600",
    fontSize: 16,
    color: "#212529",
  },
  defaultBadge: {
    backgroundColor: "#4A90E2",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  defaultBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  addressText: {
    color: "#6C757D",
    marginBottom: 5,
    fontSize: 14,
  },
  emptyText: {
    textAlign: "center",
    color: "#6C757D",
    marginVertical: 15,
  },
  addButton: {
    padding: 15,
    borderRadius: 8,
    backgroundColor: "#ff6b6b",
    alignItems: "center",
    marginTop: 10,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  statsSection: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 15,
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: "600",
    color: "#ff6b6b",
  },
  statLabel: {
    fontSize: 14,
    color: "#6C757D",
    marginTop: 5,
  },
  viewAllButton: {
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ff6b6b",
    alignItems: "center",
  },
  viewAllButtonText: {
    color: "#ff6b6b",
    fontWeight: "600",
  },
});

export default Profile;