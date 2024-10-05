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

const height = Dimensions.get('screen').height;
const width = Dimensions.get('screen').width;

export default function Courses({ navigation }){
    const [isLoading, setIsLoading] = useState(true);
    const [courses, setCourses] = useState([]);
    const { state } = useUser();

    // fetching the topics from the backend api
    const fetchTopics = async() => {
        try {
            const response = await fetch(
                'https://backend.faradawn.site:8001/get_garden', {
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
            console.log("Got garden", data);
            setCourses(data);

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
        navigation.navigate('Question_MC', { topic: topic })
    }

    // navigation through random question selection
    const randomSelect = () => {
        navigation.navigate('Question_MC', { topic: '' })
    }

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
                    {/* Message At The Top */}
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
                            Let's grow your garden, 
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
                            data={courses.garden_rows}
                            keyExtractor={(item) => item.row_num}
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item, index }) => (
                                <Card 
                                index={index}
                                item={item} 
                                height={height * 0.09} 
                                width={width * 0.8} 
                                pressHandler={topicPress}
                                />
                            )}
                            />
                    </View>

                    {/* Random Button */}
                    <View
                        style={{
                            height: height * 0.1,
                            width: width,
                            marginBottom: height * 0.10,

                            alignItems: 'center',
                            justifyContent: 'flex-start',
                        }}
                    >
                        <TouchableOpacity
                            style={{
                                height: height * 0.06,
                                width: width * 0.8,

                                backgroundColor: '#004643',
                                ...globalStyles.button
                            }}
                            onPress={() => randomSelect()}
                        >
                            <Text
                                style={globalStyles.buttonText}
                            > Random Question </Text>
                        </TouchableOpacity>
                    </View>

                </View>
            )}  
        </View>
    )
}