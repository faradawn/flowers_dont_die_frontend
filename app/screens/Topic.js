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
    const [topics, setTopics] = useState({ topics: [] });
    const { state } = useUser();
    const [shadowVisible, setShadowVisible] = useState(false);
    const [bottomShadowVisible, setBottomShadowVisible] = useState(false);

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

    const handleScroll = (event) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        const contentHeight = event.nativeEvent.contentSize.height;
        const layoutHeight = event.nativeEvent.layoutMeasurement.height;

        setShadowVisible(offsetY > height*0.07);
        setBottomShadowVisible(offsetY + layoutHeight < contentHeight - height*0.07);
    }

    // set initial shadow visibility
    useEffect(() => {
        const contentHeight = topics.topics.length * height*0.09;
        const layoutHeight = height * 0.585;

        setBottomShadowVisible(layoutHeight < contentHeight - height*0.07);
    }, [topics]);

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
                    {/* Top Shadow */}
                    {shadowVisible && <View style = {styles.topShadow} />}
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
                            onScroll={handleScroll}
                            scrollEventThrottle={16}
                        />
                    {/* Bottom Shadow */}
                    {bottomShadowVisible && <View style={styles.bottomShadow} />}
                    </View>
                    </View>
                </View>
            )}  
        </View>
    )
}

const Videos = () => {
    const [videoUri, setVideoUri] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const videoRef = React.useRef(null);
    const route = useRoute();
    const { uid, course_id, topic, question_id } = route.params;

    useEffect(() => {
        const fetchVideo = async () => {
            try {
                const response = await fetch('https://backend.faradawn.site:8001/get_video', {
                    method: 'POST',
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        uid: uid,
                        course_id: course_id,
                        topic: topic,
                        question_id: question_id,
                    }),
                });
                const data = await response.json();
                setVideoUri(data.videoUrl);
            } catch (error) {
                console.error('Error fetching video:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchVideo();
    }, [uid, course_id, topic, question_id]);

    const handlePlayPause = () => {
        if (isPlaying) {
            videoRef.current.pauseAsync();
        } else {
            videoRef.current.playAsync();
        }
        setIsPlaying(!isPlaying);
    };

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    return (
        <View style={styles.container}>
            {videoUri && (
                <Video
                    ref={videoRef}
                    source={{ uri: videoUri }}
                    style={styles.video}
                    useNativeControls={false}
                    resizeMode="contain"
                    isLooping
                />
            )}
            <Button title={isPlaying ? "Pause" : "Play"} onPress={handlePlayPause} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    video: {
        width: '100%',
        height: '50%',
    },
    topShadow: {
        position: 'absolute',
        top: 0,
        left: width*0.09,
        right: width*0.09,
        height: 13,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        zIndex: 10,
        borderRadius: 10
    },
    bottomShadow: {
        position: 'absolute',
        bottom: 0,
        left: width*0.09,
        right: width*0.09,
        height: 13,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        zIndex: 10,
        borderRadius: 10
    }
});
