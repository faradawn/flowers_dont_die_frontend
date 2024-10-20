import React, { useState } from 'react';
import { View, Dimensions, Image, Text, TouchableOpacity, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { deleteLoginInfo, saveLoginInfo } from '../components/SecureStoreUtils';
import { clearSubmissions } from '../components/localDb';
import { useUser } from '../components/UserContext';
import { globalStyles } from '../globalStyles/globalStyles';

const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;

export default function Profile({ navigation }){
    const { state, updateState } = useUser();
    const [isEditing, setIsEditing] = useState(false);
    const [newUsername, setNewUsername] = useState(state.username);

    const handleDelete = async () => {
        try {
            // Clear local submissions for this user
            const result = await clearSubmissions(state.uid);
            if (result.status !== "success") {
                throw new Error(result.message);
            }

            // Clear login info from secure storage
            await deleteLoginInfo();

            // Clear uid from state
            updateState('uid', '');
            updateState('username', '');

            Alert.alert("Account Deleted", "Your account has been successfully deleted.");
            
            // Navigate to Courses screen
            navigation.navigate('Courses');
        } catch (error) {
            console.log('Error deleting account: ', error);
            Alert.alert("Error", "Failed to delete account. Please try again.");
        }
    };

    const handleLogout = async () => {
        try {
            await deleteLoginInfo();
            updateState('username', '');
            updateState('uid', '');
            await new Promise(resolve => setTimeout(resolve, 500));

            console.log("Done logout and deleted async storage");
            navigation.navigate('Courses');
        } catch (error) {
            console.log('Error during logout:', error);
        }
    };

    const handleResetProgress = async () => {
        try {
            const result = await clearSubmissions();
            if (result.status === "success") {
                Alert.alert("Success", result.message);
                // Optionally, you can update any relevant state or trigger a refresh here
            } else {
                Alert.alert("Error", result.message);
            }
        } catch (error) {
            console.log('Error resetting progress:', error);
            Alert.alert("Error", "An unexpected error occurred while resetting progress");
        }
    };

    const handleUsernameUpdate = async () => {
        if (newUsername.trim() === '') {
            Alert.alert('Error', 'Username cannot be empty');
            return;
        }

        try {
            // Update state
            updateState('username', newUsername);

            // Update SecureStore
            await saveLoginInfo(state.uid, newUsername);

            setIsEditing(false);
            console.log("[Profile] Username updated successfully");
        } catch (error) {
            console.log('Error updating username:', error);
            Alert.alert('Error', 'Failed to update username');
        }
    };

    return (
        <View 
            style={{
                height: height,
                width: width,
                backgroundColor: 'white',
            }}
        >
            {/* Profile Picture */}
            <View
                style={{
                    height: height * 0.25,
                    width: width,
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                }}
            >
                <Image 
                    style={{
                        width: width * 0.35,
                        height: width * 0.35,
                    }}
                    source={require('../../assets/images/notion_avatars/notion_02.png')}
                />
            </View>

            {/* Profile Text */}
            <View
                style={{
                    width: width,
                    height: height * 0.05,
                    marginVertical: height * 0.02,
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'center',
                }}
            >
                {isEditing ? (
                    <TextInput
                        style={{
                            fontFamily: 'Baloo2-Bold',
                            fontWeight: 'bold',
                            fontSize: 30,
                            borderBottomWidth: 1,
                            borderBottomColor: '#004643',
                            paddingBottom: 5,
                        }}
                        value={newUsername}
                        onChangeText={setNewUsername}
                        autoFocus
                        onBlur={handleUsernameUpdate}
                    />
                ) : (
                    <Text
                        style={{
                            fontFamily: 'Baloo2-Bold',
                            fontWeight: 'bold',
                            fontSize: 30,
                        }}
                    >
                        {state.username}'s Account
                    </Text>
                )}
                <TouchableOpacity
                    onPress={() => setIsEditing(!isEditing)}
                    style={{ marginLeft: 10 }}
                >
                    <Ionicons name={isEditing ? "close" : "pencil"} size={24} color="#004643" />
                </TouchableOpacity>
            </View>

            {/* Graph Trend */}
            <View
                style={{
                    width: width,
                    height: height * 0.24,

                    alignItems: 'center',
                }}
            >
                <Image 
                    style={{
                        width: width * 0.85,
                        height: height * 0.23,
                    }}
                    source={require('../../assets/images/notion_avatars/trendline_graph_white.png')}
                />
            </View>

            {/* Buttons */}
            <View
                style={{
                    height: 0.38 * height,
                    width: width,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                {/* Login/Signup Button */}
                <TouchableOpacity
                    style={[
                        { 
                            backgroundColor: '#004643',
                            height: 0.06 * height,
                            width: 0.8 * width,
                            marginBottom: 0.02 * height,
                        }, 
                        globalStyles.button
                    ]}
                    onPress={() => navigation.navigate('Login')}
                >
                    <Text style={globalStyles.buttonText}>Login/Signup</Text>
                </TouchableOpacity>


                {/* Logout Button */}
                <TouchableOpacity
                    style={[
                        { 
                            backgroundColor: '#004643',
                            height: 0.06 * height,
                            width: 0.8 * width,
                            marginBottom: 0.02 * height,
                        }, 
                        globalStyles.button
                    ]}
                    onPress={() => handleLogout()}
                >
                    <Text style={globalStyles.buttonText}>Log Out</Text>
                </TouchableOpacity>

                {/* Reset Progress Button */}
                <TouchableOpacity
                    style={[
                        { 
                            backgroundColor: '#004643',
                            height: 0.06 * height,
                            width: 0.8 * width,
                            marginBottom: 0.02 * height,
                        }, 
                        globalStyles.button
                    ]}
                    onPress={handleResetProgress}
                >
                    <Text style={globalStyles.buttonText}>Reset Progress</Text>
                </TouchableOpacity>

                {/* Delete Account Button */}
                <TouchableOpacity
                    style={[
                        { 
                            backgroundColor: '#004643',
                            height: 0.06 * height,
                            width: 0.8 * width,
                        }, 
                        globalStyles.button
                    ]}
                    onPress={() => {
                        Alert.alert(
                            "Delete Account",
                            "Are you sure you want to delete your account? This will clear all your local progress.",
                            [
                                {
                                    text: "Cancel",
                                    style: "cancel"
                                },
                                { 
                                    text: "OK", 
                                    onPress: () => handleDelete()
                                }
                            ]
                        );
                    }}
                >
                    <Text style={globalStyles.buttonText}>Delete Account</Text>
                </TouchableOpacity>
                
            </View>
        </View>
    )
}
