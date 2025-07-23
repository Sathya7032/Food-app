import React from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5, MaterialIcons, Ionicons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const TabBar = ({ state }) => {
  const router = useRouter();
  const tabWidth = width / 5;

  const tabs = [
    {
      name: 'home',
      icon: (focused) => (
        <Ionicons 
          name={focused ? 'home' : 'home-outline'} 
          size={24} 
          color={focused ? '#FF6B6B' : '#888'} 
        />
      ),
      route: '/home'
    },
    {
      name: 'Search',
      icon: (focused) => (
        <Feather 
          name="search" 
          size={24} 
          color={focused ? '#FF6B6B' : '#888'} 
        />
      ),
      route: '/search'
    },
    {
      name: 'Orders',
      icon: (focused) => (
        <MaterialIcons 
          name={focused ? 'receipt-long' : 'receipt-long'} 
          size={24} 
          color={focused ? '#FF6B6B' : '#888'} 
        />
      ),
      route: '/orders'
    },
    {
      name: 'Favorites',
      icon: (focused) => (
        <Ionicons 
          name={focused ? 'heart' : 'heart-outline'} 
          size={24} 
          color={focused ? '#FF6B6B' : '#888'} 
        />
      ),
      route: '/favorites'
    },
    {
      name: 'Profile',
      icon: (focused) => (
        <FontAwesome5 
          name={focused ? 'user-alt' : 'user'} 
          size={22} 
          color={focused ? '#FF6B6B' : '#888'} 
        />
      ),
      route: '/profile'
    },
  ];

  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: withSpring(state.index * tabWidth, { damping: 10 }) }],
    };
  });

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <View style={styles.tabBar}>
        <Animated.View style={[styles.activeIndicator, animatedStyles, { width: tabWidth }]} />
        
        {tabs.map((tab, index) => {
          const isFocused = state.index === index;

          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.tab}
              activeOpacity={0.8}
              onPress={() => router.push(tab.route)}
            >
              <View style={styles.iconContainer}>
                {tab.icon(isFocused)}
                <Text style={[styles.tabText, isFocused && styles.activeTabText]}>
                  {tab.name}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  tabBar: {
    flexDirection: 'row',
    height: Platform.OS === 'ios' ? 80 : 70,
    backgroundColor: '#FFF',
    borderTopWidth: 0.5,
    borderTopColor: '#EEE',
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  tabText: {
    fontSize: 10,
    marginTop: 4,
    color: '#888',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FF6B6B',
  },
  activeIndicator: {
    height: 3,
    backgroundColor: '#FF6B6B',
    position: 'absolute',
    top: 0,
    left: 0,
    borderRadius: 3,
  },
});

export default TabBar;