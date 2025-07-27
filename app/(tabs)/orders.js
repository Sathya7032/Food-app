import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import {
  MaterialIcons,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import useAxios from "../auth/useAxios";
import LottieView from "lottie-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

const Orders = () => {
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
    const iconProps = { size: 20, style: styles.statusIcon };
    
    switch (status) {
      case "PROCESSING":
        return (
          <MaterialCommunityIcons
            name="clock-time-four-outline"
            color="#FFA500"
            {...iconProps}
          />
        );
      case "ACCEPTED":
        return <MaterialIcons name="check-circle" color="#4CAF50" {...iconProps} />;
      case "PREPARING":
        return <FontAwesome5 name="utensils" color="#2196F3" {...iconProps} />;
      case "OUT_FOR_DELIVERY":
        return <MaterialCommunityIcons name="moped" color="#00BCD4" {...iconProps} />;
      case "DELIVERED":
        return <MaterialIcons name="check-circle" color="#4CAF50" {...iconProps} />;
      case "CANCELLED":
        return <MaterialIcons name="cancel" color="#F44336" {...iconProps} />;
      case "REJECTED":
        return <MaterialIcons name="cancel" color="#F44336" {...iconProps} />;
      default:
        return (
          <MaterialCommunityIcons
            name="package-variant-closed"
            color="#607D8B"
            {...iconProps}
          />
        );
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PROCESSING": return "#FFF3E0";
      case "ACCEPTED": return "#E8F5E9";
      case "PREPARING": return "#E3F2FD";
      case "OUT_FOR_DELIVERY": return "#E0F7FA";
      case "DELIVERED": return "#E8F5E9";
      case "CANCELLED": return "#FFEBEE";
      case "REJECTED": return "#FFEBEE";
      default: return "#ECEFF1";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "PROCESSING": return "Processing";
      case "ACCEPTED": return "Accepted";
      case "PREPARING": return "Preparing";
      case "OUT_FOR_DELIVERY": return "On the way";
      case "DELIVERED": return "Delivered";
      case "CANCELLED": return "Cancelled";
      case "REJECTED": return "Rejected";
      default: return "Unknown";
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
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6200EE" />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={48} color="#F44336" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              setLoading(true);
              setError(null);
              fetchOrders();
            }}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (orders.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyContainer}>
          <LottieView
            ref={animationRef}
            source={require("../../assets/anime/empty.json")}
            autoPlay
            loop
            style={styles.animation}
          />
          <Text style={styles.emptyTitle}>No Orders Yet</Text>
          <Text style={styles.emptySubtitle}>
            Your order history will appear here
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.pageTitle}>Your Orders</Text>
        
        {orders.map((order) => (
          <View key={order.orderId} style={styles.orderCard}>
            <View 
              style={[
                styles.statusHeader, 
                { backgroundColor: getStatusColor(order.orderStatus) }
              ]}
            >
              <View style={styles.statusContainer}>
                {getStatusIcon(order.orderStatus)}
                <Text style={styles.statusText}>
                  {getStatusText(order.orderStatus)}
                </Text>
              </View>
              <Text style={styles.orderDate}>
                {formatDate(order.orderTime)}
              </Text>
            </View>

            <View style={styles.orderBody}>
              <View style={styles.orderIdContainer}>
                <Text style={styles.orderIdLabel}>Order ID:</Text>
                <Text style={styles.orderId}>#{order.orderId}</Text>
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
                  <Text style={styles.totalLabel}>Total Paid:</Text>
                  <Text style={styles.totalValue}>
                    ₹{(order.totalAmount - order.totalDiscount).toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.detailsButton}
              onPress={() => {
                // Navigate to order details
              }}
            >
              <Text style={styles.detailsButtonText}>View Details</Text>
              <MaterialIcons name="chevron-right" size={20} color="#6200EE" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
    marginVertical: 24,
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#FFFFFF",
  },
  errorText: {
    color: "#F44336",
    fontSize: 16,
    textAlign: "center",
    marginVertical: 16,
  },
  retryButton: {
    backgroundColor: "#6200EE",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 4,
    marginTop: 16,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    backgroundColor: "#FFFFFF",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
  },
  animation: {
    width: width * 0.8,
    height: width * 0.8,
  },
  orderCard: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  statusHeader: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusIcon: {
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  orderDate: {
    fontSize: 12,
    color: "#666",
  },
  orderBody: {
    padding: 16,
  },
  orderIdContainer: {
    flexDirection: "row",
    marginBottom: 12,
  },
  orderIdLabel: {
    fontSize: 14,
    color: "#666",
    marginRight: 4,
  },
  orderId: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  itemsContainer: {
    borderTopWidth: 1,
    borderTopColor: "#EEE",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
    paddingVertical: 12,
    marginVertical: 8,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  itemName: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginLeft: 16,
  },
  summaryContainer: {
    marginTop: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
  },
  summaryValue: {
    fontSize: 14,
    color: "#333",
  },
  discountValue: {
    fontSize: 14,
    color: "#4CAF50",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#EEE",
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  totalValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  detailsButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#EEE",
  },
  detailsButtonText: {
    color: "#6200EE",
    fontWeight: "500",
  },
});

export default Orders;