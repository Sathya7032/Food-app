// app/home.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import { MaterialIcons, Ionicons, FontAwesome } from "@expo/vector-icons";
import { useAuthStore } from "../auth/useAuthStore";
import axios from "axios";
import Constants from "expo-constants";
import LocationMap from "../LocationMap";
import { useRouter } from "expo-router";

const Home = () => {
  const router = useRouter();
  const { mobileNumber, user, logout, isAuthenticated } = useAuthStore();
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addressDetails, setAddressDetails] = useState({
    street: "Loading location...",
    building: "",
  });

  const handleLogout = async () => {
    try {
      Alert.alert(
        "Logout",
        "Are you sure you want to logout?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Logout",
            onPress: async () => {
              const success = await logout();
              if (success) {
                router.replace("/(login)/index"); // Redirect to login page
              }
            },
          },
        ]
      );
    } catch (err) {
      console.error("Logout error:", err);
      Alert.alert("Error", "Failed to logout");
    }
  };

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          `${Constants.expoConfig.extra.API_URL}/admin/get-all-categories`
        );
        if (response.data.success) {
          setCategories(response.data.data);
        } else {
          setError(response.data.message || "Failed to fetch categories");
        }
      } catch (err) {
        setError(err.message || "Failed to fetch categories");
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get(
          `${Constants.expoConfig.extra.API_URL}/admin/get-all-items`
        );
        if (response.data.success) {
          setItems(response.data.data);
        } else {
          setError(response.data.message || "Failed to fetch items");
        }
      } catch (err) {
        setError(err.message || "Failed to fetch items");
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  // Sample data for offers
  const offers = [
    { id: "1", text: "50% OFF up to ₹100", code: "FOODIE50" },
    { id: "2", text: "30% OFF on all orders", code: "HUNGRY30" },
    { id: "3", text: "Free delivery on first order", code: "FREEDEL" },
  ];

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.locationContainer}>
          <Ionicons name="location-sharp" size={20} color="#ff6b6b" />
          <Text style={styles.locationText}>
            {addressDetails.building || addressDetails.street || "My Location"}
          </Text>
          <MaterialIcons name="keyboard-arrow-down" size={20} color="#ff6b6b" />
        </View>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={handleLogout}
        >
          <FontAwesome name="user-o" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <LocationMap
          onLocationUpdate={(newAddress) => setAddressDetails(newAddress)}
        />

        {/* User info */}
        {isAuthenticated && (
          <View style={styles.userInfoContainer}>
            <Text style={styles.userInfoText}>
              Welcome, {user?.name || mobileNumber}
            </Text>
          </View>
        )}

        {/* Offers Carousel */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Best Offers</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.offersContainer}
        >
          {offers.map((offer) => (
            <View key={offer.id} style={styles.offerCard}>
              <Text style={styles.offerText}>{offer.text}</Text>
              <Text style={styles.offerCode}>Use {offer.code}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Food Categories from API */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Food Categories</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryCard}
            >
              <Image
                source={{ uri: category.categoryImage }}
                style={styles.categoryImage}
                resizeMode="cover"
              />
              <Text style={styles.categoryText}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Popular Items */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular Items</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={items}
          scrollEnabled={false}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.itemCard}>
              <Image
                source={{ uri: item.itemImage }}
                style={styles.itemImage}
                resizeMode="cover"
              />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDescription} numberOfLines={2}>
                  {item.description}
                </Text>
                <View style={styles.priceContainer}>
                  <Text style={styles.price}>₹{item.price}</Text>
                  {item.discountPrice > 0 && (
                    <Text style={styles.discountPrice}>
                      ₹{item.price - item.discountPrice}
                    </Text>
                  )}
                </View>
                <View style={styles.vegNonVegContainer}>
                  <View
                    style={[
                      styles.vegNonVegIndicator,
                      {
                        backgroundColor: item.isVeg ? "#0f940f" : "#ff6b6b",
                      },
                    ]}
                  />
                  <Text style={styles.categoryName}>{item.categoryName}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#FFF",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    marginLeft: 5,
    marginRight: 3,
    fontSize: 16,
    fontWeight: "600",
  },
  profileButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  seeAll: {
    color: "#ff6b6b",
    fontSize: 14,
  },
  offersContainer: {
    paddingLeft: 15,
    marginTop: 10,
  },
  offerCard: {
    width: 250,
    height: 100,
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 10,
    marginRight: 10,
    justifyContent: "center",
    elevation: 2,
    marginBottom: 10,
  },
  offerText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
  },
  offerCode: {
    color: "#ff6b6b",
    fontSize: 14,
  },
  categoriesContainer: {
    paddingLeft: 15,
    marginTop: 10,
  },
  categoryCard: {
    width: 100,
    height: 120,
    backgroundColor: "#FFF",
    borderRadius: 10,
    marginRight: 10,
    alignItems: "center",
    elevation: 2,
    overflow: "hidden",
    marginBottom: 10,
  },
  categoryImage: {
    width: "100%",
    height: 80,
  },
  categoryText: {
    marginTop: 8,
    fontSize: 12,
    textAlign: "center",
    padding: 5,
  },
  itemCard: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    marginHorizontal: 15,
    marginBottom: 15,
    elevation: 2,
    overflow: "hidden",
    flexDirection: "row",
  },
  itemImage: {
    width: 120,
    height: "100%",
  },
  itemInfo: {
    flex: 1,
    padding: 10,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  itemDescription: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  price: {
    fontSize: 14,
    color: "#333",
    marginRight: 10,
  },
  discountPrice: {
    fontSize: 14,
    color: "#ff6b6b",
    fontWeight: "bold",
  },
  vegNonVegContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  vegNonVegIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 5,
  },
  categoryName: {
    fontSize: 12,
    color: "#666",
  },
  userInfoContainer: {
    padding: 15,
    backgroundColor: "#fff",
    margin: 15,
    borderRadius: 10,
    elevation: 2,
  },
  userInfoText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default Home;