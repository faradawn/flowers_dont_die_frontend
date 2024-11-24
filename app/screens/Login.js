import React, { useState, useEffect } from 'react';
import { View, Image, ImageBackground, Dimensions, TextInput,
    Text, TouchableOpacity, Keyboard, TouchableWithoutFeedback, Platform, KeyboardAvoidingView, Alert
} from 'react-native';

import { globalStyles } from '../globalStyles/globalStyles';
import { useUser } from '../components/UserContext'
import { saveLoginInfo, getLoginInfo } from '../components/SecureStoreUtils';
import { mergeProgress } from '../components/localDb';

import TopBar from '../components/TopBar';

const height = Dimensions.get('screen').height;
const width = Dimensions.get('screen').width;

export default function Login({ navigation }){
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [infoCorrect, setInfoCorrect] = useState(true);
    const [showProgressPopup, setShowProgressPopup] = useState(false);
    const [loginData, setLoginData] = useState(null);

    const { updateState } = useUser();

    useEffect(() => {
        console.log('Login screen mounted');
        return () => {
            console.log('Login screen unmounted');
        };
    }, []);

    const loginAttempt = async () => {
        console.log('Attempting login with:', { username, password });
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
                setShowProgressPopup(true);
            } else {
                setInfoCorrect(false)
            }

        } catch(error) {
            console.log('Error fetching data: ', error);
            Alert.alert("Error", "Failed to connect to server. Please try again.");
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
            <TopBar navigateTo={'Profile'} backgroundColor={'transparent'} textColor={'white'}/>

            {/* Progress Popup */}
            {showProgressPopup && (
                <View style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    zIndex: 1000,
                }}>
                    <View style={{
                        backgroundColor: 'white',
                        padding: 20,
                        borderRadius: 10,
                        width: width * 0.8,
                    }}>
                        <Text style={{
                            fontSize: 18,
                            fontFamily: 'Baloo2-Bold',
                            textAlign: 'center',
                            marginBottom: 20,
                        }}>
                            Do you want to upload local progress?
                        </Text>
                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'space-around',
                        }}>
                            <TouchableOpacity
                                style={{
                                    backgroundColor: '#004642',
                                    padding: 10,
                                    borderRadius: 8,
                                    width: width * 0.25,
                                }}
                                onPress={() => handleProgressDecision(true)}
                            >
                                <Text style={{
                                    color: 'white',
                                    textAlign: 'center',
                                    fontFamily: 'Baloo2-Bold',
                                }}>Upload</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity
                                style={{
                                    backgroundColor: '#e5e5e5',
                                    padding: 10,
                                    borderRadius: 8,
                                    width: width * 0.25,
                                }}
                                onPress={() => handleProgressDecision(false)}
                            >
                                <Text style={{
                                    color: '#4a4a4a',
                                    textAlign: 'center',
                                    fontFamily: 'Baloo2-Bold',
                                }}>Discard</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={{
                                    backgroundColor: '#e5e5e5',
                                    padding: 10,
                                    borderRadius: 8,
                                    width: width * 0.25,
                                }}
                                onPress={() => setShowProgressPopup(false)}
                            >
                                <Text style={{
                                    color: '#4a4a4a',
                                    textAlign: 'center',
                                    fontFamily: 'Baloo2-Bold',
                                }}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}

            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <KeyboardAvoidingView 
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
                    style={{flex: 1, alignItems: "center", justifyContent: "center"}}
                >
                    {/* 1. Flower icon */}
                    <View
                        style={{
                            height: height * 0.4,
                            width: width,
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                        }}
                    >
                        <Image
                            source={require('../../assets/images/FlowerIcon.jpg')}
                            style={{ 
                                marginBottom: 0.05 * height,
                                height: 150,
                                width: 150,
                            }}
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
                        {infoCorrect ? (
                            <View style={{ height: 23 }} />
                        ) : (
                            <Text
                                style={{
                                    fontFamily: 'Baloo2-Bold',
                                    color: '#FFD912',
                                    alignSelf: 'center',
                                }}
                            >
                                Invalid username or wrong password.
                            </Text>
                        )}
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
                                    backgroundColor: '#004642',
                                    height: 0.06 * height,
                                    width: 0.8 * width,
                                    borderRadius: 9999,
                                }, 
                                globalStyles.button
                            ]}
                            onPress={() => loginAttempt()}
                        >
                            <Text style={globalStyles.buttonText}>Login</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Sign Up Message */}
                    <View 
                        style={{ 
                            height: 0.2 * height, 
                            flexDirection: 'row' 
                        }}
                    >
                        <Text
                            style={{ 
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
                                style={{
                                    fontFamily: 'Baloo2-Bold',
                                    fontSize: 16,
                                    color: '#FFD912',
                                }}
                            > Sign up.</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>            
            </TouchableWithoutFeedback>
        </ImageBackground>
    );
}