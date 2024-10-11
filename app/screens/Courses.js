import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import {
    View, Dimensions, Text, FlatList, ActivityIndicator,
    TouchableOpacity, Image
} from 'react-native';

import { globalStyles } from '../globalStyles/globalStyles';
import SwitchButton from '../components/SwitchButton';
import Card from '../components/CourseCard';
import { useUser } from '../components/UserContext';

import { myImages } from '../globalStyles/globalStyles';

const height = Dimensions.get('screen').height;
const width = Dimensions.get('screen').width;

export default function Courses({ navigation }) {
    const [isLoading, setIsLoading] = useState(true);
    const [courses, setCourses] = useState([]);
    const [dailyQuestionId, setDailyQuestionId] = useState(null); // daily random question
    const { state, updateState } = useUser();

    // fetching the topics from the backend api
    const fetchCourses = async () => {
        try {
            const response = await fetch(
                'https://backend.faradawn.site:8001/get_courses', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    uid: state.uid,
                }),
            }
            )
            try{
                const data = await response.json();
                console.log("Courses Received: ", data)
                setCourses(data.courses);
                setDailyQuestionId(data.daily_question_id);
            }catch(jsonError){
                console.error('[Courses] JSON parsing error:', jsonError);
            }

        } catch (error) {
            console.log('Error fetching data: ', error)
        } finally {
            setIsLoading(false);
        }
    }

    useFocusEffect(
        useCallback(() => {
            fetchCourses();
        }, [])
    );

    // navigation through clicking a specific topic
    const coursePress = (course_id) => {
        updateState('course_id', course_id)
        navigation.navigate('Topics')
    }

    // Navigation when selecting the random question
    const randomQuestionPress = () => {
        if (dailyQuestionId) {
            console.log('Daily question: ', dailyQuestionId);
            updateState('course_id', 'Algo Group')
            navigation.navigate('Question_Daily', { 
                question_id: dailyQuestionId,
                fromScreen: 'HomeTab',
            });
        } else {
            console.log("[HomeTab] No daily question ID available");
        }
    };


    return (
        <View
            style={{
                height: height,
                width: width,
                ...globalStyles.container
            }}
        >
            {isLoading ? (<ActivityIndicator />) :
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
                                Select your Course,
                                <Text
                                    style={{
                                        color: '#26C250'
                                    }}
                                > {state.username}!
                                </Text>
                            </Text>
                        </View>

                        <View
                            style={{
                                height: height * 0.2,
                                width: width,
                                
                                marginBottom: height * 0.03,

                                alignItems: 'center',
                                justifyContent: 'center',
                            }}

                        >
                            {/* Random Question */}
                            <TouchableOpacity
                                style={{
                                    marginTop: 20,
                                    backgroundColor: '#26C250',
                                    padding: 10,
                                    borderRadius: 20, 
                                    
                                }}
                                onPress={randomQuestionPress}
                            >
                                <Image
                                    source={require('../../assets/images/app_icon_v2_fat.png')}  
                                    style={{
                                        width: 160,       
                                        height: 160,      
                                        resizeMode: 'contain',  
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: 20, 
                                        
                                    }}
                                />
                                <Text style={{
                                    color: '#fff', fontSize: 18,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginTop: height * 0.008,
                                }}> Random Question</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={{ height: 20 }}></View>
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
                                data={courses}
                                keyExtractor={(item) => item.course_id}
                                showsVerticalScrollIndicator={false}
                                renderItem={({ item, index }) => (
                                    <Card
                                        index={index}
                                        title={item.course_title}
                                        id={item.course_id}
                                        height={height * 0.09}
                                        width={width * 0.8}
                                        pressHandler={coursePress}
                                        imageSource={myImages.courseIcons[item.course_title]}
                                    />
                                )}
                            />
                        </View>

                    </View>
                )}
        </View>
    )
}