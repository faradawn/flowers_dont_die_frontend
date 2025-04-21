import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Image,
  Dimensions,
  TextInput,
  Text,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  Platform,
  StyleSheet,
  KeyboardAvoidingView,
} from 'react-native';

import { useUser } from '../components/UserContext';
import { saveLoginInfo, getLoginInfo } from '../components/SecureStoreUtils';

const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;

export default function Login({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [infoCorrect, setInfoCorrect] = useState(true);
  const { updateState } = useUser();
  
  useEffect(() => {
    (async () => {
      const saved = await getLoginInfo();          // { uid, username, password } | null
      if (saved) {
        updateState('uid', saved.uid);
        setUsername(saved.username);
        setPassword(saved.password);
      }
    })();
  }, []);

  // Keyboard visibility state for UI adjustment
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // Listen for keyboard events to adjust UI layout
  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    
    // Use timeout to ensure UI adjusts after keyboard is fully hidden
    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setTimeout(() => {
          setKeyboardVisible(false);
        }, 50); 
      }
    );
    
    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  // Handle login request
  const loginAttempt = async () => {
    try {
      const response = await fetch('https://backend.faradawn.site:8001/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      console.log('Received login data: ', data);
      if (data.status === 'success') {
        setInfoCorrect(true);
        updateState('uid', data.uid);
        updateState('username', username);
        updateState('is_signed_in', true);
        
        // Save login credentials to secure storage
        await saveLoginInfo(data.uid, username, password);
        
        // Clear form fields after successful login
        setUsername('');
        setPassword('');
        
        navigation.navigate('HomeTab');
      } else {
        setInfoCorrect(false);
      }
    } catch (error) {
      console.log('Error fetching data: ', error);
      setInfoCorrect(false);
    }
  };

  // Dismiss keyboard and update UI
  const dismissKeyboard = () => {
    Keyboard.dismiss();
    setTimeout(() => {
      setKeyboardVisible(false);
    }, 50);
  };
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}

      contentContainerStyle={{ flex: 1 }}
      enabled={true}
    >
      <View style={[
        styles.backgroundContainer,
        keyboardVisible 
          ? { justifyContent: 'flex-start', paddingTop: 0 } 
          : { justifyContent: 'space-between', paddingTop: 0 }
      ]}>

        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <View style={[
            styles.iconContainer,
            keyboardVisible && { 
              height: height * 0.15, 
              paddingTop: height * 0.05 
            }
          ]}>
            <Image
              style={styles.flowerImage}
              resizeMode="contain"
              source={require('../../assets/images/FlowerIcon.jpg')}
            />
            <Text style={styles.appTitle}>Coding Flora</Text>
          </View>
        </TouchableWithoutFeedback>
        

        <View style={styles.signInContainer}>
          <Text style={styles.signInTitle}>Sign In</Text>

          {!infoCorrect && (
            <Text style={styles.errorText}>
              Invalid username or wrong password.
            </Text>
          )}

          <View style={styles.fields}>

            <View style={styles.textInputGroup}>
              <Text style={styles.inputLabel}>Username</Text>
              <View style={styles.inputBox}>
                <TextInput
                  style={styles.input}
                  placeholder="Input"
                  placeholderTextColor="rgba(0, 0, 0, 0.5)"
                  onChangeText={setUsername}
                  value={username}
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="username"
                  autoComplete="username"
                  keyboardType="default"
                />
              </View>
            </View>


            <View style={styles.textInputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputBox}>
                <TextInput
                  style={styles.input}
                  placeholder="Input"
                  placeholderTextColor="rgba(0, 0, 0, 0.5)"
                  onChangeText={setPassword}
                  value={password}
                  secureTextEntry={true}
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="password"
                  autoComplete="password"
                />
              </View>
            </View>
          </View>

          <Text style={styles.signupText}>
            Don't have an account?{' '}
            <Text style={styles.signupLink} onPress={() => navigation.navigate('SignUp')}>
              Sign up now!
            </Text>
          </Text>

          <View style={styles.button}>

            <TouchableOpacity
              style={styles.largeButton}
              onPress={() => {

                Keyboard.dismiss();
                setTimeout(loginAttempt, 100);
              }}
            >
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
            
            {/* TODO: Add forget password feature */}
            {/* <Text style={styles.forgetPassword}>Forget Password?</Text> */}
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4b7c7b',
  },
  backgroundContainer: {
    flex: 1,
    width: width,
    justifyContent: 'space-between', 
  },

  iconContainer: {
    width: width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: height * 0.20,
    height: height * 0.3,
  },
  flowerImage: {
    height: height * 0.12,
    width: height * 0.12,
    borderRadius: height * 0.06,
    backgroundColor: 'white',
    padding: 10,
  },
  appTitle: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: Math.min(36, height * 0.043),
    color: 'white',
    letterSpacing: 0.3,
    marginTop: 15,
  },
  signInContainer: {
    width: width,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 25,
    paddingTop: 20,
    paddingBottom: height * 0.03,
  },
  signInTitle: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
    alignSelf: 'center',
    textAlign: 'center',
  },
  errorText: {
    fontFamily: 'Nunito-Regular',
    color: 'red',
    fontSize: 14,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  fields: {
    gap: 18,
    width: '100%',
    marginBottom: height * 0.02,
  },
  textInputGroup: {
    gap: 5,
  },
  inputLabel: {
    fontSize: 16,
    color: '#000',
    fontFamily: 'Nunito-Regular',
  },
  inputBox: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#8c9391',
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  input: {
    fontSize: 16,
    color: '#000',
    fontFamily: 'Baloo2-Regular',
    padding: 0,
  },
  button: {
    gap: 10,
    alignItems: 'center',
    width: '100%',
  },
  largeButton: {
    backgroundColor: '#4b7c7b',
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 11,
    width: '100%',
    marginBottom: height * 0.068, // Todo: remove this line fater implement forget password feature
  },
  buttonText: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Baloo2-SemiBold',
    fontWeight: '600',
  },
  forgetPassword: {
    fontSize: 14,
    color: '#515856',
    fontFamily: 'Baloo2-Regular', // Todo: change font family after implement forget password feature
    marginBottom: height * 0.05,
  },
  signupText: {
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
    color: '#515856',
    marginBottom: 15,
    marginTop: 5,
    letterSpacing: 0.2,
    lineHeight: 20,
    alignSelf: 'flex-start',
  },
  signupLink: {
    fontFamily: 'Nunito-Bold',
    fontSize: 14,
    color: '#f8a101',
    fontWeight: '700',
  },
});