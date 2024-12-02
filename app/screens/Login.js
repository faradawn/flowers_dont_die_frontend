import React, { useState, useEffect } from 'react';
import { View, Image, ImageBackground, Dimensions, TextInput,
    Text, TouchableOpacity, Keyboard, TouchableWithoutFeedback, Platform, KeyboardAvoidingView, Alert
} from 'react-native';

// Add these lines to define height and width
const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;

import { globalStyles } from '../globalStyles/globalStyles';
import { useUser } from '../components/UserContext'
import { saveLoginInfo, getLoginInfo } from '../components/SecureStoreUtils'; // Adjust the path as necessary
import { mergeProgress } from '../components/localDb';

export default function Login({ navigation }){
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [infoCorrect, setInfoCorrect] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [showProgressPopup, setShowProgressPopup] = useState(false);
    const [loginData, setLoginData] = useState(null);

    const { updateState } = useUser();

    const handleContinueAsGuest = async () => {
        const guestId = `guest_${Date.now()}`;
        updateState('username', `Guest_${guestId}`);
        updateState('uid', guestId);
        updateState('is_signed_in', false);
        navigation.navigate('HomeTab');
    };

    // handles login attempts from the user
    const loginAttempt = async () => {
        try {
            const response = await fetch(
                'https://backend.faradawn.site:8001/login', {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        username: username,
                        password: password,
                    }),
                }
            )

            const data = await response.json();

            console.log("Received login data: ", data);
            setLoginData(data);

            if(data.status == 'success') {
                setInfoCorrect(true);
                setShowProgressPopup(true); // Show popup instead of immediately navigating
            } else {
                setInfoCorrect(false)
            }

        } catch(error) {
            console.log('Error fetching data: ', error);
        }
    }

    const handleProgressDecision = async (uploadProgress) => {
        if (uploadProgress) {
            try {
                await mergeProgress(username);
                console.log("Local progress merged successfully");
            } catch (error) {
                console.error("Error merging progress:", error);
                Alert.alert("Error", "Failed to merge local progress. Please try again.");
            }
        }

        // Update user context and navigate regardless of the decision
        updateState('uid', loginData.uid);
        updateState('username', username);

        setUsername('');
        setPassword('');

        await saveLoginInfo(loginData.uid, username, password);
        console.log("Saved login info to async");

        setShowProgressPopup(false);
        navigation.navigate('HomeTab');
    }

    return ( 
        <ImageBackground 
            source={require('../../assets/images/LoginBackground.jpg')}
            style={{
                height: height,
                width: width,
                ...globalStyles.container
            }}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <KeyboardAvoidingView 
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
                    style={{flex: 1, alignItems: "center", justifyContent: "center"}}
                >
                    {/* 1. Flower icon */}
                    <View
                        style={ {
                            height: height * 0.4,
                            width: width,
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                        } }
                    >
                        <Image
                            source={require('../../assets/images/FlowerIcon.jpg')}
                            style={ { 
                                marginBottom: 0.05 * height,
                                height: 150,
                                width: 150,
                            } }
                        />
                    </View>

                    {/* 2. Forms */}
                    <View
                        style={{
                            height: height * 0.3,
                            width: width * 0.8,
                            alignItems: 'flex-start',
                            justifyContent: 'flex-end',
                        }}
                    >
                        {/* Username input field */}
                        <Text style={globalStyles.inputKey}> Username </Text>
                        <TextInput 
                            style={[
                                { 
                                    height: 0.06 * height, 
                                    width: 0.8 * width,
                                    paddingHorizontal: 20, 
                                }, 
                                globalStyles.textInput
                            ]}
                            placeholder='John Smith'
                            placeholderTextColor='rgba(255, 255, 255, 0.5)'
                            onChangeText={(val) => setUsername(val)}
                            value={username}
                            
                            autoCapitalize="none"
                            autoCorrect={false}
                        />

                        {/* Password input field */}
                        <Text style={globalStyles.inputKey}> Password </Text>
                        <TextInput 
                            style={[
                                { 
                                    height: 0.06 * height, 
                                    width: 0.8 * width,
                                    paddingHorizontal: 20, 
                                }, 
                                globalStyles.textInput
                            ]}
                            placeholder="John Smith's Password"
                            placeholderTextColor='rgba(255, 255, 255, 0.5)'
                            onChangeText={(val) => setPassword(val)}
                            value={password}
                            
                            textContentType="oneTimeCode"
                            autoCapitalize="none"
                            autoCorrect={false}
                            
                            secureTextEntry={true}
                        />

                        {/* Error message field */}
                        { infoCorrect ?
                            (
                                <View style={{ height: 23 }}>
                                </View>
                            ) 
                            : 
                            (
                                <Text
                                    style={{
                                        fontFamily: 'Baloo2-Bold',
                                        color: '#FFD912',
                                        alignSelf: 'center',
                                    }}
                                >
                                    Invalid username or wrong password.
                                </Text>
                            ) 
                        }
                    </View>

                    {/* 3. Login Button */}
                    <View
                        style={{ 
                            height: 0.1 * height,
                            width: 0.8 * width,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <TouchableOpacity
                            style={[
                                { 
                                    backgroundColor: '#F8C660',
                                    height: 0.06 * height,
                                    width: 0.8 * width,
                                }, 
                                globalStyles.button
                            ]}
                            onPress={() => loginAttempt()}
                        >
                            <Text style={globalStyles.buttonText}>Login</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Sign Up Message and Continue as Guest container */}
                    <View 
                        style={{ 
                            height: 0.2 * height,
                            alignItems: 'center'
                        }}
                    >
                        {/* Sign Up Message */}
                        <View 
                            style={{ 
                                flexDirection: 'row',
                                marginBottom: 15
                            }}
                        >
                            <Text
                                style= {{ 
                                    fontFamily: 'Baloo2-Bold',
                                    fontSize: 16,
                                    color: 'white',
                                }}
                            >
                                Don't have an account? 
                            </Text>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('SignUp')}
                            >
                                <Text
                                    style= {{
                                        fontFamily: 'Baloo2-Bold',
                                        fontSize: 16,
                                        color: '#FFD912',
                                    }}
                                > Sign up.</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Continue as Guest */}
                        <Text
                            style= {{ 
                                fontFamily: 'Baloo2-Bold',
                                fontSize: 16,
                                color: '#FFD912',
                                textDecorationLine: 'underline'
                            }}
                            onPress={handleContinueAsGuest}
                        >
                            Continue as Guest
                        </Text>
                    </View>
                </KeyboardAvoidingView>            
            </TouchableWithoutFeedback>
        </ImageBackground>
    );

}
