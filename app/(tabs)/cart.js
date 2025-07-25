import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
} from "react-native";
import {
  Ionicons,
  MaterialIcons,
  FontAwesome,
  AntDesign,
} from "@expo/vector-icons";
import useAxios from "../auth/useAxios";
import { useNavigation } from "@react-navigation/native";
import Constants from "expo-constants";
import * as WebBrowser from "expo-web-browser";
import RazorpayCheckout from "react-native-razorpay";
import { router } from "expo-router";

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [cartValue, setCartValue] = useState(0);
  const [discountValue, setDiscountValue] = useState(0);
  const [customerName, setCustomerName] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [cartId, setCartId] = useState(null);
  const AxiosConfig = useAxios();

  const navigation = useNavigation();
  const rzpKey = "rzp_test_aImlfafFbJKRYb"; // Replace with your actual Razorpay key

  const fetchCartData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch cart data
      const cartResponse = await AxiosConfig.get("/customer/get-customer-cart");
      const { cartValue, discountValue, customerName, items, id } =
        cartResponse.data.data;

      // Fetch addresses
      const addressResponse = await AxiosConfig.get(
        "/customer/get-customer-address"
      );

      setCartItems(items || []);
      setCartValue(cartValue || 0);
      setDiscountValue(discountValue || 0);
      setCustomerName(customerName || "");
      setAddresses(addressResponse.data.data || []);
      setCartId(id);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load cart data");
      console.error("Cart fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartData();
  }, []);

  const updateQuantity = async (id, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      setUpdating(true);
      await AxiosConfig.put(
        `/customer/update-cart-item/${id}?quantity=${newQuantity}`
      );

      // Optimistic update
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.id === id ? { ...item, orderQuantity: newQuantity } : item
        )
      );

      // Refresh cart data to get updated values
      await fetchCartData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update quantity");
      console.error("Update quantity error:", err);
      // Revert optimistic update if API fails
      await fetchCartData();
    } finally {
      setUpdating(false);
    }
  };

  const removeItem = async (id) => {
    try {
      setUpdating(true);
      await AxiosConfig.delete(`/customer/remove-product/${id}`);

      // Optimistic update
      setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));

      // Refresh cart data to get updated values
      await fetchCartData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove item");
      console.error("Remove item error:", err);
      await fetchCartData();
    } finally {
      setUpdating(false);
    }
  };

  const subtotal = cartValue;
  const deliveryFee = 2.99;
  const tax = subtotal * 0.08;
  const totalBeforeDiscount = subtotal + deliveryFee + tax;
  const total = totalBeforeDiscount - discountValue;

  const handleCheckout = async () => {
    if (!selectedAddress) {
      Alert.alert("Error", "Please select a shipping address.");
      return;
    }

    try {
      const orderRequest = {
        cartId: cartId,
        addressId: selectedAddress,
      };

      const orderResponse = await AxiosConfig.post(
        "/customer/place-order",
        orderRequest
      );
      const orderData = orderResponse.data.data;

      if (!orderData) {
        throw new Error("Failed to create order");
      }

      const options = {
        description: `Order #${orderData.orderId}`,
        image:
          "https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg",
        currency: "INR",
        key: rzpKey,
        amount: orderData.totalAmount * 100,
        name: "Food app",
        order_id: orderData.razorpayOrderId,
        prefill: {
          email: "customer@email.com",
          contact: "9199999999",
          name: customerName,
        },
        theme: { color: "#ff6b6b" },
      };

      RazorpayCheckout.open(options)
        .then(async (response) => {
          console.log("✅ Payment Successful!");
          console.log("razorpay_order_id:", orderData.razorpayOrderId);
          console.log("razorpay_payment_id:", response.razorpay_payment_id);
          console.log("razorpay_signature:", response.razorpay_signature);
          const verificationResponse = await AxiosConfig.post(
            "/customer/verify-payment",
            null,
            {
              params: {
              orderId: orderData.razorpayOrderId,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              }
            }
          );
         
          
            Alert.alert(
              "Success",
              "Payment verified! Your order is confirmed.",
              [{ text: "OK", onPress: () => router.push("/orders") }]
            );
       
        })
        .catch((error) => {
          console.error("Payment failed:", error);
          console.log(
            orderData.razorpayOrderId,
            response.razorpay_payment_id,
            response.razorpay_signature
          );
          Alert.alert(
            "Payment Failed",
            error.description || "Payment could not be completed"
          );
        });
    } catch (err) {
      console.error("Checkout error:", err);
      Alert.alert(
        "Error",
        err.response?.data?.message || "Failed to process payment"
      );
    }
  };

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItemCard}>
      <View style={styles.cartItemRow}>
        <Image source={{ uri: item.itemImage }} style={styles.cartItemImage} />
        <View style={styles.cartItemDetails}>
          <View style={styles.cartItemHeader}>
            <Text style={styles.itemName}>{item.name}</Text>
            <TouchableOpacity
              onPress={() => removeItem(item.id)}
              disabled={updating}
            >
              {updating ? (
                <ActivityIndicator size="small" color="#ff6b6b" />
              ) : (
                <MaterialIcons name="cancel" size={24} color="#ff6b6b" />
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>

          <View style={styles.quantityControl}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => updateQuantity(item.id, item.orderQuantity - 1)}
              disabled={updating || item.orderQuantity <= 1}
            >
              {updating ? (
                <ActivityIndicator size="small" color="#ff6b6b" />
              ) : (
                <Text style={styles.quantityButtonText}>-</Text>
              )}
            </TouchableOpacity>
            <Text style={styles.quantityText}>{item.orderQuantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => updateQuantity(item.id, item.orderQuantity + 1)}
              disabled={updating}
            >
              {updating ? (
                <ActivityIndicator size="small" color="#ff6b6b" />
              ) : (
                <Text style={styles.quantityButtonText}>+</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  const renderAddressItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.addressItem,
        selectedAddress === item.id && styles.selectedAddressItem,
      ]}
      onPress={() => setSelectedAddress(item.id)}
    >
      <Text style={styles.addressType}>{item.addressType}</Text>
      <Text style={styles.addressText}>{item.street}</Text>
      <Text style={styles.addressText}>
        {item.city}, {item.state} {item.postalCode}
      </Text>
      {item.landmark && (
        <Text style={styles.addressLandmark}>Near {item.landmark}</Text>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff6b6b" />
        <Text style={styles.loadingText}>Loading your cart...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={48} color="#ff6b6b" />
        <Text style={styles.errorTitle}>Error loading cart</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchCartData}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Ionicons name="cart" size={28} color="#ff6b6b" />
            <Text style={styles.headerTitle}>Your Cart</Text>
          </View>
          <Text style={styles.itemsCount}>
            {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
          </Text>
          <Text style={styles.customerName}>Customer: {customerName}</Text>
        </View>

        {cartItems.length === 0 ? (
          <View style={styles.emptyCart}>
            <FontAwesome name="shopping-basket" size={100} color="#ccc" />
            <Text style={styles.emptyCartTitle}>Your cart is empty</Text>
            <Text style={styles.emptyCartText}>
              Looks like you haven't added anything to your cart yet
            </Text>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => navigation.navigate("Menu")}
            >
              <AntDesign name="arrowleft" size={16} color="white" />
              <Text style={styles.browseButtonText}>Browse Menu</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
          />
        )}

        {cartItems.length > 0 && (
          <>
            <View style={styles.addressSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Delivery Address</Text>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => navigation.navigate("AddAddress")}
                >
                  <AntDesign name="plus" size={16} color="#ff6b6b" />
                  <Text style={styles.addButtonText}>Add New</Text>
                </TouchableOpacity>
              </View>

              {addresses.length === 0 ? (
                <View style={styles.noAddress}>
                  <Text style={styles.noAddressText}>
                    No addresses saved. Please add a delivery address.
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={addresses}
                  renderItem={renderAddressItem}
                  keyExtractor={(item) => item.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                />
              )}
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Order Summary</Text>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery Fee</Text>
                <Text style={styles.summaryValue}>
                  ${deliveryFee.toFixed(2)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tax (8%)</Text>
                <Text style={styles.summaryValue}>${tax.toFixed(2)}</Text>
              </View>
              <View style={[styles.summaryRow, styles.discountRow]}>
                <Text style={styles.discountLabel}>Discount</Text>
                <Text style={styles.discountValue}>
                  −${discountValue.toFixed(2)}
                </Text>
              </View>

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.checkoutButton,
                  (updating || !selectedAddress) &&
                    styles.checkoutButtonDisabled,
                ]}
                disabled={updating || !selectedAddress}
                onPress={handleCheckout}
              >
                {updating ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.checkoutButtonText}>
                    Proceed to Checkout
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingTop: Constants.statusBarHeight,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#333",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
    color: "#333",
  },
  errorMessage: {
    fontSize: 16,
    color: "#666",
    marginTop: 8,
    marginBottom: 24,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#ff6b6b",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  header: {
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginLeft: 8,
    color: "#333",
  },
  itemsCount: {
    fontSize: 16,
    color: "#666",
    marginBottom: 4,
  },
  customerName: {
    fontSize: 14,
    color: "#666",
  },
  emptyCart: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyCartTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
    color: "#333",
  },
  emptyCartText: {
    fontSize: 16,
    color: "#666",
    marginTop: 8,
    marginBottom: 24,
    textAlign: "center",
  },
  browseButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ff6b6b",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  cartItemCard: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cartItemRow: {
    flexDirection: "row",
    padding: 12,
  },
  cartItemImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 12,
  },
  cartItemDetails: {
    flex: 1,
  },
  cartItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  itemName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
    marginRight: 8,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ff6b6b",
    marginBottom: 12,
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#ff6b6b",
    justifyContent: "center",
    alignItems: "center",
  },
  quantityButtonText: {
    fontSize: 18,
    color: "#ff6b6b",
  },
  quantityText: {
    fontSize: 18,
    marginHorizontal: 16,
    color: "#333",
  },
  addressSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  addButtonText: {
    fontSize: 14,
    color: "#ff6b6b",
    marginLeft: 4,
  },
  noAddress: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  noAddressText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  addressItem: {
    width: 250,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedAddressItem: {
    borderWidth: 2,
    borderColor: "#ff6b6b",
  },
  addressType: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  addressLandmark: {
    fontSize: 14,
    color: "#999",
    marginTop: 4,
  },
  summaryCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: "#666",
  },
  summaryValue: {
    fontSize: 16,
    color: "#333",
  },
  discountRow: {
    marginBottom: 12,
  },
  discountLabel: {
    fontSize: 16,
    color: "#28a745",
  },
  discountValue: {
    fontSize: 16,
    color: "#28a745",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ff6b6b",
  },
  checkoutButton: {
    backgroundColor: "#ff6b6b",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  checkoutButtonDisabled: {
    backgroundColor: "#ccc",
  },
  checkoutButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default CartPage;
