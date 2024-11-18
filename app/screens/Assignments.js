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

import TopBar from '../components/TopBar';

const height = Dimensions.get('screen').height;
const width = Dimensions.get('screen').width;

export default function Topics({ navigation, route }){
    const [isLoading, setIsLoading] = useState(true);
    const [assignments, setAssignments] = useState([]);
    const { state } = useUser();

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

    const progress = assignments.num_total_questions > 0 
        ? (assignments.num_completed_questions / assignments.num_total_questions)
        : 0;

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
                        <TopBar navigateTo={'Topics'}/>
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
                                justifyContent: 'center',
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
                                    Nice progress, 
                                    <Text
                                        style={{
                                            color: '#26C250'
                                        }}
                                    > {state.username}!
                                    </Text>
                                </Text>
                            </View>
                            
                            {/* progress bar */}
                            <View
                                style={{
                                    height: 12,
                                    width: 0.7 * width,
                                    backgroundColor: 'white',
                                    borderColor: '#004643',
                                    borderWidth: 1,
                                    borderRadius: 5,
                                }}
                            >
                                <View
                                    style={{
                                        height: 10,
                                        width: Math.max(0, Math.min(0.7 * width * progress, 0.7 * width)),
                                        borderRadius: 5,
                                        backgroundColor: '#26C250',
                                    }}
                                > 
                                </View>
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
                                style={{ flex: 1 }}
                                data={assignments.question_arr}
                                keyExtractor={(item) => item.question_id}
                                showsVerticalScrollIndicator={false}
                                renderItem={({ item, index }) => (
                                    <Card 
                                        index={index}
                                        id={item.question_id}
                                        num_stars={item.score}
                                        title={item.question_title} 
                                        pressHandler={questionPress}
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
