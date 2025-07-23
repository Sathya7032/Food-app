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
  Alert,
  TouchableWithoutFeedback,
  PanResponder
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../auth/useAuthStore'; // ✅ Make sure this path is correct

const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD = 50;

const otp = () => {
  const router = useRouter();
  const { mobileNumber } = useLocalSearchParams();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [activeInput, setActiveInput] = useState(0);
  const [countdown, setCountdown] = useState(30);

  const inputsRef = useRef([]);
  const buttonScale = useRef(new Animated.Value(1)).current;
  const animationRef = useRef(null);

  const { setOtp: setStoreOtp, verifyOtp } = useAuthStore.getState();

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx > SWIPE_THRESHOLD) {
          router.back();
        }
      },
    })
  ).current;

  const handleOtpChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 5) {
      inputsRef.current[index + 1].focus();
      setActiveInput(index + 1);
    }

    if (index === 5 && text) {
      handleSubmit();
    }
  };

  const handleKeyPress = (index, e) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus();
      setActiveInput(index - 1);
    }
  };

  const handleSubmit = async () => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length !== 6) {
      Alert.alert('Error', 'Please enter the 6-digit OTP');
      return;
    }

  
    useAuthStore.getState().setOtp(enteredOtp);
    const result = await verifyOtp();

    const latestError = useAuthStore.getState().error;
    if (latestError) {
      Alert.alert('Verification Failed', latestError);
      return;
    }

    Alert.alert('Success', 'OTP verified successfully');
    router.replace('/(tabs)/home');
  };

  const handleResend = () => {
    setCountdown(30);
    Alert.alert('OTP Resent', 'A new OTP has been sent to your mobile number');
    // Optionally call sendOtp() again here from useAuthStore
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

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

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <SafeAreaView style={styles.safeArea} {...panResponder.panHandlers}>
        <LinearGradient colors={['#FFFFFF', '#F8F8F8']} style={styles.container}>
          <View style={styles.animationContainer}>
            <LottieView
              ref={animationRef}
              source={require('../../assets/anime/login.json')}
              autoPlay
              loop={false}
              style={styles.animation}
            />
          </View>

          <View style={styles.header}>
            <Text style={styles.title}>Enter Verification Code</Text>
            <Text style={styles.subtitle}>
              Sent to +91 {mobileNumber?.slice(0, 3)}-{mobileNumber?.slice(3, 6)}-{mobileNumber?.slice(6)}
            </Text>
          </View>

          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputsRef.current[index] = ref)}
                style={[
                  styles.otpInput,
                  activeInput === index && styles.activeOtpInput,
                ]}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={(text) => handleOtpChange(text, index)}
                onKeyPress={(e) => handleKeyPress(index, e)}
                onFocus={() => setActiveInput(index)}
                selectionColor="#FF6B6B"
              />
            ))}
          </View>

          <View style={styles.buttonContainer}>
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity
                style={styles.continueButton}
                activeOpacity={0.9}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={handleSubmit}
              >
                <Text style={styles.buttonText}>VERIFY</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>
              Didn't receive the code?{' '}
              {countdown > 0 ? (
                <Text style={styles.countdownText}>
                  Resend in {countdown}s
                </Text>
              ) : (
                <TouchableOpacity onPress={handleResend}>
                  <Text style={styles.resendLink}>Resend now</Text>
                </TouchableOpacity>
              )}
            </Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

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
    marginTop: height * 0.05,
    height: height * 0.2,
  },
  animation: {
    width: width * 0.4,
    height: '100%',
  },
  header: {
    marginTop: height * 0.02,
    marginBottom: height * 0.06,
    alignItems: 'center',
  },
  title: {
    fontSize: scale(24),
    fontWeight: '700',
    color: '#333333',
    marginBottom: scale(8),
  },
  subtitle: {
    fontSize: scale(16),
    color: '#666666',
    textAlign: 'center',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: height * 0.05,
  },
  otpInput: {
    width: scale(48),
    height: scale(60),
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: scale(8),
    textAlign: 'center',
    fontSize: scale(24),
    fontWeight: '600',
    color: '#333333',
    backgroundColor: '#FFFFFF',
  },
  activeOtpInput: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FFF5F5',
  },
  buttonContainer: {
    marginTop: height * 0.02,
  },
  continueButton: {
    width: '100%',
    paddingVertical: scale(16),
    borderRadius: scale(8),
    alignItems: 'center',
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
  resendContainer: {
    marginTop: height * 0.04,
    alignItems: 'center',
  },
  resendText: {
    fontSize: scale(14),
    color: '#666666',
  },
  resendLink: {
    color: '#FF6B6B',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  countdownText: {
    color: '#999999',
  },
});

export default otp;
