import React from 'react';
import { View, Dimensions, Image, Text, TouchableOpacity } from 'react-native';

import { globalStyles } from '../globalStyles/globalStyles';
import { useUser } from '../components/UserContext';

const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;

export default function Profile({ navigation }){
    const { state } = useUser();

    // handling deletion of the account
    const handleDelete = async() => {
        try {
            const response = await fetch(
                'http://129.114.24.200:8001/delete_account', {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                    uid: state.uid,
                    }),
                }
            );

            const data = response.json();
            console.log(data);

        } catch(error) {
            console.log('Error deleting account: ', error);
        } finally {
            navigation.navigate('Login');
        }
    }

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
                    source={require('../../assets/images/notion_avatars/notion_01.png')}
                />
            </View>

            {/* Profile Text */}
            <View
                style={{
                    width: width,
                    height: height * 0.05,

                    marginVertical: height * 0.02,

                    alignItems: 'center',
                }}
            >
                <Text
                    style={{
                        fontFamily: 'Baloo2-Bold',
                        fontWeight: 'bold',
                        fontSize: 30,
                    }}
                > { state.username }'s Account </Text>
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
                    source={require('../../assets/images/notion_avatars/trendline_graph.png')}
                />
            </View>

            {/* Buttons */}
            <View
                style={{
                    height: 0.3 * height,
                    width: width,

                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                {/* Logout Button */}
                <TouchableOpacity
                    style={ [
                        { 
                            backgroundColor: '#004643',
                            height: 0.06 * height,
                            width: 0.8 * width,

                            marginBottom: 0.02 * height,
                        }, 
                        globalStyles.button
                    ] }
                    onPress={() => navigation.navigate('Login')}
                >
                    <Text style={globalStyles.buttonText}>Log Out</Text>
                </TouchableOpacity>

                {/* Delete Account Button */}
                <TouchableOpacity
                    style={ [
                        { 
                            backgroundColor: '#004643',
                            height: 0.06 * height,
                            width: 0.8 * width,
                        }, 
                        globalStyles.button
                    ] }
                    onPress={() => handleDelete()}
                >
                    <Text style={globalStyles.buttonText}>Delete Account</Text>
                </TouchableOpacity>
                
            </View>
        </View>
    )
}