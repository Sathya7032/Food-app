import { Tabs, useRootNavigationState } from 'expo-router';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { useColorScheme, View, StyleSheet, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';

const Colors = {
  light: {
    background: '#ffffff',
    tint: '#ff6b6b', // Swiggy's orange color
    tabIconDefault: '#9E9E9E',
    text: '#000000',
  },
  dark: {
    background: '#121212',
    tint: '#FC8019',
    tabIconDefault: '#757575',
    text: '#ffffff',
  },
};

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const navigationState = useRootNavigationState((state) => state);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        // Prevent back navigation on root tab screens
        return navigationState?.index === 0;
      }
    );

    return () => backHandler.remove();
  }, [navigationState]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: theme.tint,
          tabBarInactiveTintColor: theme.tabIconDefault,
          tabBarBackground: () => (
            <LinearGradient
              colors={['#FFFFFF', '#F8F8F8']}
              style={styles.tabBarBackground}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            />
          ),
          tabBarStyle: {
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            elevation: 0,
            height: 60,
            paddingBottom: 5,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
            marginBottom: 4,
          },
          tabBarItemStyle: {
            paddingVertical: 4,
          },
          headerShown: false,
          tabBarHideOnKeyboard: true,
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <View style={focused ? styles.activeIcon : null}>
                <Ionicons 
                  name={focused ? 'home' : 'home-outline'} 
                  size={24} 
                  color={color} 
                  style={focused ? styles.boldIcon : null}
                />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: 'Search',
            tabBarIcon: ({ color, focused }) => (
              <View style={focused ? styles.activeIcon : null}>
                <Ionicons 
                  name={focused ? 'search' : 'search-outline'} 
                  size={24} 
                  color={color} 
                  style={focused ? styles.boldIcon : null}
                />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="orders"
          options={{
            title: 'Orders',
            tabBarIcon: ({ color, focused }) => (
              <View style={focused ? styles.activeIcon : null}>
                <MaterialIcons 
                  name="list-alt" 
                  size={24} 
                  color={color} 
                  style={focused ? styles.boldIcon : null}
                />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="cart"
          options={{
            title: 'Cart',
            tabBarIcon: ({ color, focused }) => (
              <View style={focused ? styles.activeIcon : null}>
                <Ionicons 
                  name={focused ? 'cart' : 'cart-outline'} 
                  size={24} 
                  color={color} 
                  style={focused ? styles.boldIcon : null}
                />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, focused }) => (
              <View style={focused ? styles.activeIcon : null}>
                <FontAwesome 
                  name={focused ? 'user' : 'user-o'} 
                  size={22} 
                  color={color} 
                  style={focused ? styles.boldIcon : null}
                />
              </View>
            ),
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  tabBarBackground: {
    flex: 1,
  },
  boldIcon: {
    fontWeight: 'bold',
  },
});