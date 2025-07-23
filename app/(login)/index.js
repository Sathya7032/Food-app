import React, { useState, useRef, useEffect } from 'react';
import {
 
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Keyboard,
  Animated,
  Platform,
  TouchableWithoutFeedback
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../auth/useAuthStore';

const { width, height } = Dimensions.get('window');

const index = () => {
  const router = useRouter();
  const [mobileNumber, setMobileNumber] = useState('');
  const [isValid, setIsValid] = useState(false);
  const inputRef = useRef(null);
  const buttonScale = new Animated.Value(1);
  const animationRef = useRef(null);


  const validateNumber = (number) => {
    const valid = /^\d{10}$/.test(number);
    setMobileNumber(number);
    setIsValid(valid);
  };

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 3,
    }).start();
  };

 const handleSubmit = async () => {

  const { sendOtp, setMobileNumber, error } = useAuthStore.getState();

  setMobileNumber(mobileNumber); // ✅ Store in Zustand

  const result = await sendOtp(); // call API

  const latestError = useAuthStore.getState().error;
  if (latestError) {
    alert(latestError); // ✅ Show error if exists
    return;
  }

  if (result && result.message?.includes('OTP')) {
    router.push({ pathname: '/otp', params: { mobileNumber } });
  } else {
    alert('Unexpected response from server.');
  }
};

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient
          colors={['#FFFFFF', '#F8F8F8']}
          style={styles.container}
        >
          {/* Lottie Animation */}
          <View style={styles.animationContainer}>
            <LottieView
              ref={animationRef}
              source={require('../../assets/anime/login.json')}
              autoPlay
              loop
              style={styles.animation}
            />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.appName}>FoodApp</Text>
            <Text style={styles.welcomeText}>Welcome back!</Text>
          </View>

          {/* Input Section */}
          <View style={styles.inputSection}>
            <Text style={styles.instructionText}>Enter your mobile number</Text>
            
            <View style={styles.inputContainer}>
              <View style={styles.countryCodeContainer}>
                <Text style={styles.countryCode}>+91</Text>
              </View>
              <TextInput
                ref={inputRef}
                style={styles.input}
                placeholder="9876543210"
                placeholderTextColor="#999999"
                keyboardType="phone-pad"
                maxLength={10}
                value={mobileNumber}
                onChangeText={validateNumber}
                autoFocus={true}
                selectionColor="#FF6B6B"
                onSubmitEditing={handleSubmit}
                returnKeyType="done"
              />
            </View>
          </View>

          {/* Continue Button */}
          <View style={styles.buttonContainer}>
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity
                style={[styles.continueButton, isValid && styles.activeButton]}
                activeOpacity={0.9}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={handleSubmit}
                disabled={!isValid}
              >
                <Text style={styles.buttonText}>CONTINUE</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.termsText}>
              By continuing, you agree to our {' '}
              <Text style={styles.highlightText}>Terms of Service</Text> and {' '}
              <Text style={styles.highlightText}>Privacy Policy</Text>
            </Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

// Responsive scaling function
const scale = (size) => (width / 375) * size;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    paddingHorizontal: scale(24),
  },
  animationContainer: {
    alignItems: 'center',
    marginTop: height * 0.02,
    height: height * 0.3,
  },
  animation: {
    width: width * 1,
    height: '100%',
  },
  header: {
    marginTop: height * 0.02,
    marginBottom: height * 0.06,
  },
  appName: {
    fontSize: scale(28),
    fontWeight: '700',
    color: '#FF6B6B',
    marginBottom: scale(4),
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: scale(16),
    color: '#666666',
    textAlign: 'center',
  },
  inputSection: {
    marginBottom: height * 0.05,
  },
  instructionText: {
    fontSize: scale(14),
    color: '#888888',
    marginBottom: scale(12),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingBottom: scale(8),
  },
  countryCodeContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: scale(6),
    paddingVertical: scale(8),
    paddingHorizontal: scale(12),
    marginRight: scale(10),
  },
  countryCode: {
    fontSize: scale(16),
    fontWeight: '500',
    color: '#333333',
  },
  input: {
    flex: 1,
    fontSize: scale(18),
    fontWeight: '500',
    color: '#333333',
    paddingVertical: scale(8),
    includeFontPadding: false,
  },
  buttonContainer: {
    marginTop: height * 0.02,
  },
  continueButton: {
    width: '100%',
    paddingVertical: scale(16),
    borderRadius: scale(8),
    alignItems: 'center',
    backgroundColor: '#CCCCCC',
  },
  activeButton: {
    backgroundColor: '#FF6B6B',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: scale(4) },
    shadowOpacity: 0.2,
    shadowRadius: scale(8),
    elevation: 3,
  },
  buttonText: {
    fontSize: scale(16),
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: scale(0.5),
  },
  footer: {
    position: 'absolute',
    bottom: Platform.select({
      ios: height * 0.06,
      android: height * 0.04,
    }),
    alignSelf: 'center',
  },
  termsText: {
    fontSize: scale(12),
    color: '#999999',
    textAlign: 'center',
    paddingHorizontal: scale(20),
  },
  highlightText: {
    color: '#FF6B6B',
    textDecorationLine: 'underline',
  },
});

export default index;