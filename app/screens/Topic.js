import React, { useState, useEffect} from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { View, Dimensions, Text, FlatList, ActivityIndicator,
    TouchableOpacity,
} from 'react-native';

import { globalStyles } from '../globalStyles/globalStyles';
import SwitchButton from '../components/SwitchButton';
import Card from '../components/CourseCard';
import { useUser } from '../components/UserContext';

import { Ionicons } from '@expo/vector-icons';

const height = Dimensions.get('screen').height;
const width = Dimensions.get('screen').width;

export default function Topics({ navigation }){
    const [isLoading, setIsLoading] = useState(true);
    const [topics, setTopics] = useState(null);
    const { state } = useUser();

    // fetching the topics from the backend api
    const fetchTopics = async() => {
        try {
            const response = await fetch(
                'https://backend.faradawn.site:8001/get_topics', {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        uid: state.uid,
                        course_id: state.course_id,
                    }),
                }
            )

            const data = await response.json();
            console.log("Got topics", data);
            setTopics(data);

        } catch(error) {
            console.log('Error fetching data: ', error)
        } finally {
            setIsLoading(false);
        }
    }

    useFocusEffect(
        useCallback(() => {
          fetchTopics();
        }, [])
      );

    // navigation through clicking a specific topic
    const topicPress = (topic) => {
        navigation.navigate('Assignments', { topic: topic })
    }

    const TopBar = () => (
        <View 
            style={{
                width: width,
                height: height * 0.0625,
                justifyContent: 'flex-end',
            }}
        >
            <TouchableOpacity
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                }}
                onPress={() => navigation.navigate('HomeTab')}
            >
                <Ionicons
                    name='chevron-back'
                    size={16}
                    color='#004643'
                    style={{ 
                        marginLeft: width / 12,
                    }}
                />
                <Text 
                    style={{ 
                        color: '#004643', 
                        marginLeft: 3, 
                        fontSize: 16,
                        fontFamily: 'Baloo2-Bold',
                    }}
                > 
                    Back
                </Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View
            style={{ 
                height: height,
                width: width,
                ...globalStyles.container
            }}
        >  
            { isLoading ? (<ActivityIndicator />) : 
            (
                <View>
                    <View
                        style={{ 
                            flex: 1,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <TopBar />
                    </View>

                    {/* Message At The Top */}
                    <View
                        style={{ 
                            flex: 5,
                            alignItems: 'center',
                        }}
                    >
                    <View
                        style={{
                            height: height * 0.06,
                            width: width,

                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Text
                            style={{
                                
                                fontFamily: 'Baloo2-Bold',
                                fontSize: 22,
                            }}
                        >
                            Select your Topic, 
                            <Text
                                style={{
                                    color: '#26C250'
                                }}
                            > {state.username}!
                            </Text>
                        </Text>
                    </View>

                    <View style={{height: 20}}></View>
                    {/* FlatList Containing Topic Information */}
                    <View
                        style={{
                            height: height * 0.585,
                            width: width,

                            marginBottom: height * 0.03,

                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <FlatList
                            style={{ flex: 1 }}
                            data={topics.topics}
                            keyExtractor={(item) => item.topic}
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item, index }) => (
                                <Card 
                                    index={index}
                                    title={item.topic}
                                    id={item.topic}
                                    height={height * 0.09} 
                                    width={width * 0.8} 
                                    pressHandler={topicPress}
                                    item={item}
                                />
                            )}
                            />
                    </View>
                    </View>
                </View>
            )}  
        </View>
    )
}