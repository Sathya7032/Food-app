import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  Dimensions, 
  TouchableOpacity, 
  Animated, 
  FlatList, 
  Platform,
  PixelRatio
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 0 : StatusBar.currentHeight;
// Responsive font size function
const normalizeFontSize = (size) => {
  const { width: SCREEN_WIDTH } = Dimensions.get('window');
  const scale = SCREEN_WIDTH / 375; // Based on iPhone 6/7/8 width
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

const { width, height } = Dimensions.get('window');

const onboardingData = [
  {
    id: '1',
    title: 'Discover Restaurants',
    description: 'Find the best restaurants in your area with just a few taps',
    image: require('../assets/images/onboard.jpg'),
  },
  {
    id: '2',
    title: 'Fast Delivery',
    description: 'Get your food delivered quickly to your doorstep',
    image: require('../assets/images/onboard.jpg'),
  },
  {
    id: '3',
    title: 'Easy Ordering',
    description: 'Customize your orders and pay securely with multiple options',
    image: require('../assets/images/onboard.jpg'),
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = new Animated.Value(0);
  const slidesRef = React.useRef(null);

  const viewableItemsChanged = React.useRef(({ viewableItems }) => {
    setCurrentIndex(viewableItems[0].index);
  }).current;

  const viewConfig = React.useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollTo = () => {
    if (currentIndex < onboardingData.length - 1) {
      slidesRef.current.scrollToIndex({ index: currentIndex + 1 });
    } else {
      router.push('/(login)')
    }
  };

  const renderItem = ({ item }) => {
    return (
      <View style={styles.slide}>
        <Image source={item.image} style={styles.image} resizeMode="contain" />
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#ffffff', '#f8f8f8']}
        style={styles.container}
      >
        <View style={[
          styles.skipContainer,
          { top: STATUSBAR_HEIGHT + height * 0.02 } // Adjust for Android status bar
        ]}>
          <TouchableOpacity onPress={() => router.push('/(login)')}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={onboardingData}
          renderItem={renderItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          bounces={false}
          keyExtractor={(item) => item.id}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
            useNativeDriver: false,
          })}
          scrollEventThrottle={32}
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={viewConfig}
          ref={slidesRef}
        />

        <View style={styles.bottomContainer}>
          <View style={styles.dotContainer}>
            {onboardingData.map((_, i) => {
              const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
              const dotWidth = scrollX.interpolate({
                inputRange,
                outputRange: [width * 0.02, width * 0.04, width * 0.02], // Responsive dot size
                extrapolate: 'clamp',
              });
              const opacity = scrollX.interpolate({
                inputRange,
                outputRange: [0.3, 1, 0.3],
                extrapolate: 'clamp',
              });
              return (
                <Animated.View
                  style={[styles.dot, { width: dotWidth, opacity }]}
                  key={i.toString()}
                />
              );
            })}
          </View>

          <TouchableOpacity style={styles.button} onPress={scrollTo}>
            <LinearGradient
              colors={['#FF7A7A', '#FF4848']}
              style={styles.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buttonText}>
                {currentIndex === onboardingData.length - 1 ? 'Get Started' : 'Next'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? STATUSBAR_HEIGHT : 0, 
  },
  skipContainer: {
    position: 'absolute',
    paddingTop: height * 0.05,
    right: width * 0.05,
    zIndex: 1,
  },
  skipText: {
    color: '#888',
    fontSize: normalizeFontSize(16),
    fontWeight: Platform.select({
      ios: '600', // Semi-bold for iOS
      android: '600', // Medium for Android
    }),
  },
  slide: {
    width,
    alignItems: 'center',
    paddingHorizontal: width * 0.05,
    paddingTop: height * 0.1,
  },
  image: {
    width: width * 0.8,
    height: height * 0.4,
    maxHeight: 300, // Prevent images from being too large on tablets
  },
  textContainer: {
    marginTop: height * 0.05,
    alignItems: 'center',
  },
  title: {
    fontSize: normalizeFontSize(28),
    fontWeight: Platform.select({
      ios: '700', // Bold for iOS
      android: '600', // Semi-bold for Android
    }),
    color: '#333',
    marginBottom: height * 0.02,
    textAlign: 'center',
    maxWidth: width * 0.9,
  },
  description: {
    fontSize: normalizeFontSize(16),
    fontWeight: Platform.select({
      ios: '400', // Regular for iOS
      android: 'normal', // Normal for Android
    }),
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: width * 0.08,
    lineHeight: normalizeFontSize(24),
    maxWidth: width * 0.9,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: Platform.select({
      ios: height * 0.07,
      android: height * 0.07,
    }),
    width: '100%',
    alignItems: 'center',
  },
  dotContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: height * 0.04,
  },
  dot: {
    height: width * 0.02,
    borderRadius: width * 0.01,
    backgroundColor: '#FF4848',
    marginHorizontal: width * 0.01,
  },
  button: {
    width: width * 0.8,
    borderRadius: width * 0.075,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  gradient: {
    paddingVertical: height * 0.02,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: normalizeFontSize(18),
    fontWeight: Platform.select({
      ios: '600',
      android: '500',
    }),
    letterSpacing: 0.5,
  },
});