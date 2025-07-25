import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
  FlatList,
  StyleSheet,
  ScrollView,
} from 'react-native';
import axios from 'axios';
import Constants from "expo-constants";
import LottieView from 'lottie-react-native';
import animationData from '../../assets/anime/anime-2.json';
import Icon from 'react-native-vector-icons/Ionicons';
import useAxios from "../auth/useAxios";

const Search = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLottie, setShowLottie] = useState(false);
  const axiosInstance = useAxios();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`http://10.0.2.2:8080/admin/get-all-categories`);
        const data = await response.json();
        if (data.success) {
          setCategories([{ id: 'all', name: 'All' }, ...data.data]);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      let response;
      if (activeCategory === 'All') {
        response = await fetch(`http://10.0.2.2:8080/admin/get-all-items`);
      } else {
        const categoryId = categories.find(c => c.name === activeCategory)?.id;
        response = await fetch(`http://10.0.2.2:8080/admin/items/${categoryId}`);
      }
      const data = await response.json();
      if (data.success) {
        setMenuItems(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, categories]);

  useEffect(() => {
    if (categories.length > 0) {
      fetchItems();
    }
  }, [fetchItems, categories]);

  const handleAddToCart = async (itemId) => {
    try {
      await axiosInstance.post(`/customer/add-product/${itemId}`);
      setCartItems(prev => [...prev, itemId]);
      setShowLottie(true);
      setTimeout(() => setShowLottie(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredItems = useMemo(() => {
    return menuItems.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [menuItems, searchQuery]);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image
        source={{ uri: item.itemImage || 'https://via.placeholder.com/150' }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.cardContent}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemDesc}>{item.description}</Text>
        <Text style={styles.itemPrice}>${item.price?.toFixed(2)}</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => handleAddToCart(item.id)}
        >
          <Icon name="add-circle-outline" size={20} color="white" />
          <Text style={styles.addButtonText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderHeader = () => (
    <View>
      <Text style={styles.header}>Our Menu</Text>

      <TextInput
        placeholder="Search..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.searchInput}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categories}>
        {categories.map(category => (
          <TouchableOpacity
            key={category.id}
            onPress={() => setActiveCategory(category.name)}
            style={[
              styles.categoryButton,
              activeCategory === category.name && styles.categoryActive
            ]}
          >
            <Text style={[
              styles.categoryText,
              activeCategory === category.name && styles.categoryTextActive
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}

      {loading ? (
        <ActivityIndicator size="large" color="#ff6b6b" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={filteredItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Lottie Animation Modal */}
      <Modal visible={showLottie} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <LottieView
            source={animationData}
            autoPlay
            loop={false}
            style={{ width: 150, height: 150 }}
          />
          <Text style={{ marginTop: 10, fontSize: 16 }}>Item added to cart!</Text>
        </View>
      </Modal>
    </View>
  );
};

export default Search;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff9f2',
    paddingHorizontal: 16,
    paddingTop: 50
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#2e2e2e'
  },
  searchInput: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 25,
    marginBottom: 15,
    paddingHorizontal: 20,
    borderColor: '#ddd',
    borderWidth: 1
  },
  categories: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 10,
    backgroundColor: '#fff'
  },
  categoryActive: {
    backgroundColor: '#ff6b6b',
    borderColor: '#ff6b6b'
  },
  categoryText: {
    color: '#666',
    fontWeight: '500'
  },
  categoryTextActive: {
    color: '#fff'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 3
  },
  image: {
    height: 180,
    width: '100%',
    backgroundColor: '#eee'
  },
  cardContent: {
    padding: 15
  },
  itemName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2e2e2e',
    marginBottom: 5
  },
  itemDesc: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10
  },
  itemPrice: {
    fontSize: 16,
    color: '#ff6b6b',
    fontWeight: 'bold',
    marginBottom: 10
  },
  addButton: {
    backgroundColor: '#ff6b6b',
    borderRadius: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  addButtonText: {
    color: 'white',
    marginLeft: 5,
    fontWeight: '600'
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center'
  }
});
