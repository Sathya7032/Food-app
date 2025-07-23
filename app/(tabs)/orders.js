import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import {
  MaterialIcons,
  FontAwesome,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import useAxios from "../auth/useAxios";
import LottieView from "lottie-react-native";

const { width, height } = Dimensions.get("window");

const orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const axiosInstance = useAxios();
  const animationRef = useRef(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axiosInstance.get("/customer/orders");
        if (response.data.success) {
          setOrders(response.data.data);
        } else {
          setError(response.data.message || "Failed to fetch orders");
        }
      } catch (err) {
        setError(err.message || "Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case "PROCESSING":
        return (
          <MaterialCommunityIcons
            name="clock-time-four-outline"
            size={24}
            color="#FFC107"
          />
        );
      case "ACCEPTED":
        return <MaterialIcons name="check-circle" size={24} color="#17A2B8" />;
      case "PREPARING":
        return <FontAwesome5 name="utensils" size={20} color="#007BFF" />;
      case "OUT_FOR_DELIVERY":
        return (
          <MaterialCommunityIcons name="moped" size={24} color="#17A2B8" />
        );
      case "DELIVERED":
        return <MaterialIcons name="check-circle" size={24} color="#28A745" />;
      case "CANCELLED":
        return <MaterialIcons name="cancel" size={24} color="#DC3545" />;
      case "REJECTED":
        return <MaterialIcons name="cancel" size={24} color="#DC3545" />;
      default:
        return (
          <MaterialCommunityIcons
            name="package-variant-closed"
            size={24}
            color="#6C757D"
          />
        );
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "PROCESSING":
        return "Processing";
      case "ACCEPTED":
        return "Accepted";
      case "PREPARING":
        return "Preparing";
      case "OUT_FOR_DELIVERY":
        return "On the way";
      case "DELIVERED":
        return "Delivered";
      case "CANCELLED":
        return "Cancelled";
      case "REJECTED":
        return "Rejected";
      default:
        return "Unknown";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff6b6b" />
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

  if (orders.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <LottieView
          ref={animationRef}
          source={require("../../assets/anime/empty.json")}
          autoPlay
          loop
          style={styles.animation}
        />
        <Text style={styles.emptyText}>No orders found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {orders.map((order) => (
        <View key={order.orderId} style={styles.orderCard}>
          <View style={styles.orderHeader}>
            <View style={styles.statusContainer}>
              {getStatusIcon(order.orderStatus)}
              <Text style={styles.statusText}>
                {getStatusText(order.orderStatus)}
              </Text>
            </View>
            <Text style={styles.orderId}>Order #{order.orderId}</Text>
            <Text style={styles.orderDate}>{formatDate(order.orderTime)}</Text>
          </View>

          <View style={styles.itemsContainer}>
            {order.orderItemDTOS.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <Text style={styles.itemName}>
                  {item.quantity}x {item.itemName}
                </Text>
                <Text style={styles.itemPrice}>
                  ₹{(item.price * item.quantity).toFixed(2)}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal:</Text>
              <Text style={styles.summaryValue}>
                ₹{order.totalAmount.toFixed(2)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Discount:</Text>
              <Text style={styles.discountValue}>
                -₹{order.totalDiscount.toFixed(2)}
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>
                ₹{(order.totalAmount - order.totalDiscount).toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "#DC3545",
    fontSize: 16,
    textAlign: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyImage: {
    width: 180,
    height: 180,
    opacity: 0.7,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    color: "#7f8c8d",
  },
  orderCard: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: {
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  orderId: {
    fontSize: 14,
    color: "#2c3e50",
    fontWeight: "bold",
  },
  orderDate: {
    fontSize: 12,
    color: "#95a5a6",
    marginTop: 4,
  },
  itemsContainer: {
    marginVertical: 8,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  itemName: {
    fontSize: 14,
    color: "#2c3e50",
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2c3e50",
  },
  summaryContainer: {
    marginTop: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#2c3e50",
  },
  summaryValue: {
    fontSize: 14,
    color: "#2c3e50",
  },
  discountValue: {
    fontSize: 14,
    color: "#28A745",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#ECF0F1",
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  totalValue: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  animationContainer: {
    alignItems: "center",
    marginTop: height * 0.02,
    height: height * 0.3,
  },
  animation: {
    width: width * 1,
    height: "50%",
  },
});

export default orders;
