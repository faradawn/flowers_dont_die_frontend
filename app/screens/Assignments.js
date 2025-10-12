import React, { useState, useEffect} from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { View, Dimensions, Text, FlatList, ActivityIndicator,StyleSheet,
    TouchableOpacity,
} from 'react-native';

import { globalStyles } from '../globalStyles/globalStyles';
import Card from '../components/AssignmentCard';
import { useUser } from '../components/UserContext';
import { getAssignments } from '../components/localDb'; // Import the local getAssignments function

import { Ionicons } from '@expo/vector-icons';
import { myImages } from '../globalStyles/globalStyles';

import TopBar from '../components/TopBar';

const height = Dimensions.get('screen').height;
const width = Dimensions.get('screen').width;

export default function Topics({ navigation, route }){
    const [isLoading, setIsLoading] = useState(true);
    const [assignments, setAssignments] = useState([]);
    const { state } = useUser();
    const [currentQuestion, setCurrentQuestion] = useState(-1);

    const topic = route.params?.topic;

    // fetching the assignments from the local database
    const fetchAssignments = async() => {
        try {
            const result = await getAssignments(state.uid, state.course_id, topic);
            console.log("Got assignments: ", result);
            if (result.status === "success") {
                setAssignments(result);
            } else {
                console.log('Error fetching assignments:', result.message);
            }
        } catch(error) {
            console.log('Error fetching data: ', error)
        } finally {
            setIsLoading(false);
        }
    }

    useFocusEffect(
        useCallback(() => {
          fetchAssignments();
        }, [])
    );

    const questionPress = (question_id, index) => {
        console.log("[Assignments] Navigate to Question_MC", question_id, assignments.question_arr)
        navigation.navigate('Question_MC', { 
            question_id: question_id,
            topic: topic,
            index: index,
            fromScreen: 'Assignments',
            question_arr: assignments.question_arr,
        })
    }

    // navigation to Videos screen
    const navigateToVideos = () => {
        navigation.navigate('Videos', {
            uid: state.uid,
            course_id: state.course_id,
            topic: topic,
            question_id: null,
        });
    }

    // update current question
    useEffect(() => {
        if (assignments?.question_arr?.length > 0) {
            for (let i = 0; i < assignments.question_arr.length; i++) {
                if (assignments.question_arr[i].score < 3) {
                    setCurrentQuestion(i);
                    return;
                }
            }
            setCurrentQuestion(-1);
        }
    }, [assignments]);

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
                        <TopBar navigateTo={'Courses'} params={{ course_id: state.course_id }}/>
                    </View>

                    <View
                        style={{ 
                            flex: 10,
                            alignItems: 'center',
                        }}
                    >
                        <View
                            style={{
                                flex: 1,
                                alignItems: 'center',
                                justifyContent: 'start',
                            }}
                        >
                            <View
                                style={{
                                    height: height * 0.06,
                                    width: width,
                                    alignItems: 'flex-start',
                                    justifyContent: 'center',
                                    paddingHorizontal: 30,
                                }}
                            >
                                <Text
                                    style={{
                                        fontFamily: 'Nunito-Regular',
                                        fontSize: 20,
                                        lineHeight: 22,
                                    }}
                                >
                                    Choose a problem
                                </Text>
                            </View>
                        </View>

                        {/* Flat list of cards */}
                        <View
                            style={{
                                flex: 5,
                                alignItems: 'center',
                                justifyContent: 'center',

                                paddingBottom: 60 ,
                            }}
                        >
                            <FlatList
                                style={{ 
                                    flex: 1,
                                    position: 'relative',
                                    top: -70,
                                }}
                                data={assignments.question_arr}
                                keyExtractor={(item) => item.question_id}
                                showsVerticalScrollIndicator={false}
                                renderItem={({ item, index }) => (
                                    <Card
                                        index={index}
                                        title={item.question_title} 
                                        id={item.question_id}
                                        height={height * 0.1} 
                                        width={width * 0.9} 
                                        num_stars={item.score}
                                        borderWidth={index === currentQuestion ? 0.7 : 0}
                                        pressHandler={questionPress}
                                        item={item}
                                        imageSource={myImages.flowerIcons[(index % 9) + 1]}
                                    />
                                )}
                            />
                    {/* New button to navigate to Videos screen  */}
                    {state.course_id === "College Prep" && (
                    <TouchableOpacity
                        style={{
                            width: width * 0.5,
                            backgroundColor: '#004643',
                            padding: 10,
                            borderRadius: 10,
                            marginTop: 10,
                            marginBottom: height * 0.15, // Add this to lift button up
                            alignSelf: 'center',
                        }}
                        onPress={navigateToVideos}
                    >
                        <Text style={{ color: 'white', fontSize: 16, alignSelf: 'center', }}>Go to Videos</Text>
                    </TouchableOpacity>
                    )}
                    </View>      
                        
                    </View>
                </View>
            )}  
        </View>
    )
}
