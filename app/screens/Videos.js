import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Text, Dimensions, TouchableOpacity } from 'react-native';
import { Video } from 'expo-av';
import { useUser } from '../components/UserContext';
import { useRoute, useNavigation } from '@react-navigation/native'; // Add useNavigation
import { globalStyles } from '../globalStyles/globalStyles';
import TopBar from '../components/TopBar';
import { getQuestionSet, storeSubmission } from '../components/localDb';

const { width, height } = Dimensions.get('window');

const Videos = () => {
    const navigation = useNavigation(); // Add this line
    const [videoData, setVideoData] = useState({
        title: '',
        videoUrl: '',
        descriptionTitle: '',
        descriptionText: ''
    });
    const [loading, setLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [error, setError] = useState(null);
    const videoRef = React.useRef(null);
    const { state } = useUser();
    const route = useRoute();
    const { uid, course_id, topic, question_id } = route.params;

    // Add state for question set
    const [allQuestions, setAllQuestions] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Fetch both video and questions in parallel
                const [videoResponse, questionsResponse] = await Promise.all([
                    fetch('https://backend.codingflora.com:8001/get_video', {
                        method: 'POST',
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            uid: uid,
                            course_id: course_id,
                            topic: topic,
                            question_id: question_id
                        }),
                    }),
                    getQuestionSet(state.uid, state.course_id, topic)
                ]);

                const videoData = await videoResponse.json();
                console.log('[Video] Got Video data:', videoData);
                
                setVideoData({
                    title: videoData.title,
                    videoUrl: videoData.video_url,
                    descriptionTitle: videoData.description_title,
                    descriptionText: videoData.description_text
                });

                if (questionsResponse.status === 'success') {
                    setAllQuestions(questionsResponse.questions);
                    console.log('[Video] Question Set Received:', questionsResponse);
                } else {
                    console.log('Error fetching question set:', questionsResponse.message);
                }

            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Failed to load data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [uid, course_id, topic, question_id, state.uid, state.course_id]);

    // Add navigation handler
    const handleNextPress = async () => {
        try {
            if (allQuestions && allQuestions.length > 0) {
                navigation.navigate('Question_MC', {
                    question_id: allQuestions[0].question_id,
                    topic: topic,
                    index: 0,
                    fromScreen: 'Videos',
                    question_arr: allQuestions
                });
            }
        } catch (error) {
            console.log('Error navigating to first question:', error);
        }
    };

    return (
        <View style={styles.container}>
            <TopBar 
                navigateTo="Topics" 
                backText="Back" 
                params={{ topic: topic }}
            />
            
            <View style={styles.contentContainer}>
                <View style={styles.videoSection}>
                    <Text style={styles.title}>{videoData.title}</Text>
                    <View style={styles.videoWindow}>
                        {loading ? (
                            <ActivityIndicator size="large" color="#004643" />
                        ) : error ? (
                            <Text style={styles.errorText}>{error}</Text>
                        ) : (
                            videoData.videoUrl && (
                                <Video
                                    ref={videoRef}
                                    source={{ uri: videoData.videoUrl }}
                                    style={styles.video}
                                    useNativeControls={true}
                                    resizeMode="contain"
                                    isLooping
                                    onPlaybackStatusUpdate={status => setIsPlaying(status.isPlaying)}
                                />
                            )
                        )}
                    </View>
                </View>

                <View style={styles.descriptionSection}>
                    <Text style={styles.descriptionTitle}>{videoData.descriptionTitle}</Text>
                    <Text style={styles.descriptionText}>{videoData.descriptionText}</Text>
                </View>

                <View style={styles.bottomSection}>
                    <TouchableOpacity
                        style={styles.nextButton}
                        onPress={handleNextPress}
                    >
                        <Text style={styles.nextButtonText}>Next</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },

   
    contentContainer: {
        flex: 1,
        paddingTop: 70, 
        paddingHorizontal: 20,
    },

    videoSection: {
        marginTop: height * 0.02,
        alignItems: 'center',
    },

    title: {
        fontSize: 24,
        fontFamily: 'Baloo2-Bold',
        color: '#004643',
        marginBottom: height * 0.02,
    },

    videoWindow: {
        width: width * 0.9,
        height: height * 0.3,
        backgroundColor: '#f5f5f5',
        borderRadius: 15,
        borderWidth: 2,
        borderColor: '#004643',
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },

    video: {
        width: '100%',
        height: '100%',
        borderRadius: 13,
    },

    descriptionSection: {
        marginTop: height * 0.03,
        width: width * 0.8, 
        alignSelf: 'center', 
    },

    descriptionTitle: {
        fontSize: 22,
        fontFamily: 'Baloo2-Bold',
        color: '#004643',
        marginBottom: width * 0.02,
    },

    descriptionText: {
        fontSize: 18,
        fontFamily: 'Baloo2-Regular',
        color: '#333',
        lineHeight: 24,
    },

    bottomSection: {
        flex: 1,
        justifyContent: 'flex-end',
        marginBottom: height * 0.2,
    },

    nextButton: {
        backgroundColor: '#004643',
        padding: 15,
        borderRadius: 15,
        width: width * 0.8,
        alignItems: 'center',
        alignSelf: 'center',
    },

    nextButtonText: {
        color: 'white',
        fontSize: 20,
        fontFamily: 'Baloo2-Bold',

    }
});

export default Videos;