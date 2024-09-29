import React, { useState, useEffect} from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { View, Dimensions, Text, FlatList, ActivityIndicator,
    TouchableOpacity,
} from 'react-native';

import { globalStyles } from '../globalStyles/globalStyles';
import Card from '../components/AssignmentCard';
import { useUser } from '../components/UserContext';

import { Ionicons } from '@expo/vector-icons';

import TopBar from '../components/TopBar';

const height = Dimensions.get('screen').height;
const width = Dimensions.get('screen').width;

export default function Topics({ navigation, route }){
    const [isLoading, setIsLoading] = useState(true);
    const [assignments, setAssignments] = useState([]);
    const { state } = useUser();

    const topic = route.params?.topic;

    // fetching the assignments from the backend api
    const fetchAssignments = async() => {
        try {
            const response = await fetch(
                'https://backend.faradawn.site:8001/get_assignments', {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        uid: state.uid,
                        course_id: state.course_id,
                        topic: topic,
                    }),
                }
            )

            const data = await response.json();
            console.log("Assignments: ", data)
            setAssignments(data);

        } catch(error) {
            console.log('Error fetching data: ', error)
        } finally {
            setIsLoading(false);
        }
    }

    const progress = assignments.num_total_questions == 0 ? 0 : (assignments.num_completed_questions / assignments.num_total_questions);

    useFocusEffect(
        useCallback(() => {
          fetchAssignments();
        }, [])
    );

    // const TopBar = () => (
    //     <View 
    //         style={{
    //             width: width,
    //             height: height * 0.0625,
    //             justifyContent: 'flex-end',
    //         }}
    //     >
    //         <TouchableOpacity
    //             style={{
    //                 flexDirection: 'row',
    //                 alignItems: 'center',
    //             }}
    //             onPress={() => navigation.navigate('Topics')}
    //         >
    //             <Ionicons
    //                 name='chevron-back'
    //                 size={16}
    //                 color='#004643'
    //                 style={{ 
    //                     marginLeft: width / 12,
    //                 }}
    //             />
    //             <Text 
    //                 style={{ 
    //                     color: '#004643', 
    //                     marginLeft: 3, 
    //                     fontSize: 16,
    //                     fontFamily: 'Baloo2-Bold',
    //                 }}
    //             > 
    //                 Back
    //             </Text>
    //         </TouchableOpacity>
    //     </View>
    // );

    const questionPress = (question_id) => (
        navigation.navigate('Question_MC', { question_id: question_id })
    )

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
                                    height: 0.03 * height,
                                    width: 0.7 * width,

                                    backgroundColor: 'white',
                                    borderColor: '#004643',
                                    borderWidth: 1,
                                }}
                            >
                                <View
                                    style={{
                                        height: 0.03 * height - 2,
                                        width: 0.7 * width * (progress),
    
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
                                        num_stars={item.num_stars}
                                        title={item.question_title} 
                                        pressHandler={questionPress}
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