import React, { useState, useEffect } from 'react';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { useCallback } from 'react';
import { View, Dimensions, Text, FlatList, ActivityIndicator,
    TouchableOpacity, Button, StyleSheet
} from 'react-native';
import { Video } from 'expo-av';

import { globalStyles, myImages } from '../globalStyles/globalStyles';
import SwitchButton from '../components/SwitchButton';
import Card from '../components/TopicsCard';
import { useUser } from '../components/UserContext';
import { getTopics } from '../components/localDb'; // Import the local getTopics function

import TopBar from '../components/TopBar';

const height = Dimensions.get('screen').height;
const width = Dimensions.get('screen').width;

export default function Topics({ navigation }){
    const [isLoading, setIsLoading] = useState(true);
    const [topics, setTopics] = useState(null);
    const { state } = useUser();

    // fetching the topics from the local database
    const fetchTopics = async() => {
        try {
            const result = await getTopics(state.uid, state.course_id);
            console.log("Got topics", result);
            if (result.status === "success") {
                setTopics(result);
            } else {
                console.log('Error fetching topics:', result.message);
            }
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

   /*  // navigation to Videos screen
    const navigateToVideos = (topic) => {
        navigation.navigate('Videos', {
            uid: state.uid,
            course_id: state.course_id,
            topic: topic,
            question_id: null,
        });
    } */


    // navigation through clicking a specific topic
    const topicPress = (topic) => {
        /* if(state.course_id === 'College Prep') {
            navigateToVideos(topic);
            return;
        } */
        navigation.navigate('Assignments', { topic: topic })

    }

    return (
        <View
            style={{ 
                height: height,
                width: width,
                ...globalStyles.container,
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
                        <TopBar navigateTo={'HomeTab'}/>
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
                                    imageSource={myImages.flowerIcons[index+1]}
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
