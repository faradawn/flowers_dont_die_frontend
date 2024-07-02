import React, { useState, useEffect } from 'react';
import { Text, View, ActivityIndicator, Dimensions, TouchableOpacity,
    Modal
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

import { globalStyles } from '../globalStyles/globalStyles';
import { useUser } from '../components/UserContext';

const height = Dimensions.get('window').height * 0.95;
const width = Dimensions.get('window').width;

export default function Question_A({ navigation, route }){
    const [data, setData] = useState([])
    const [isLoading, setIsLoading] = useState(true);
    const { state } = useUser();
    const topic = route.params?.topic;

    // function for fetching data
    const fetchQuestions = async () => {
        try {
            const response = await fetch(
              'http://129.114.24.200:8001/get_question', {
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
            );
      
            const response_data = await response.json();
            setData(response_data);
        } catch(error) {
            console.log('Error fetching data: ', error);
        } finally {
            setIsLoading(false);
        }
    };

    // runs fetchQuestions upon loading screen
    useEffect(() => {
        setTimeout(fetchQuestions, 10);
    }, []);

    const [recording, setRecording] = useState();
    const [outputURI, setOutputURI] = useState();
    const [permissionResponse, requestPermission] = Audio.usePermissions();
    const [allowSubmit, setAllowSubmit] = useState(false);

    // function run when the user starts recording
    async function startRecording() {
        try {
          if (permissionResponse.status !== 'granted') {
            await requestPermission();
          }
          await Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            playsInSilentModeIOS: true,
          });
    
          const { recording } = await Audio.Recording.createAsync( Audio.RecordingOptionsPresets.HIGH_QUALITY
          );
          setRecording(recording);
        } catch (err) {
          console.error('Failed to start recording', err);
        }
    }

    // function run when the user stops recording 
    async function stopRecording() {
        setRecording(undefined);
        await recording.stopAndUnloadAsync();
        await Audio.setAudioModeAsync(
            {
                allowsRecordingIOS: false,
            }
        );

        const uri = recording.getURI();
        setOutputURI(uri);
        setAllowSubmit(true);

    }

    // function to determine when user starts / stop recording
    const handleRecord = () => {
        if(recording) { stopRecording(); } 
        else { startRecording(); }
    }

    const [answerResponse, setAnswerResponse] = useState(
        { status: '', grade: 0, feedback_title: '', feedback_body: '' }
    );
    const [submitted, setSubmitted] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);

    // submitting the recording to backend api
    const submitRecording = async() => {
        const file = {
            uri: outputURI,
            name: 'user_recording.m4a',
            type: 'audio/m4a'
        }

        const formData = new FormData();
        formData.append('uid', state.uid);
        formData.append('question_id', data.question_id);
        formData.append('question', data.question);
        formData.append('audio_file', file);

        try {
            const response = await fetch(
                'http://129.114.24.200:8001/submit_audio_response', {
                    method: 'POST',
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                    body: formData
                }
            );

            const response_data = await response.json();

            setAnswerResponse(response_data);
            
        } catch(error) {
            console.log("Error sending data: ", error)
        }
    }

    // handling submit and next
    const handleNext_Submit = async() => {
        if(!allowSubmit) { return; }

        if(submitted){
            // this happens when the user presses the next button
            navigation.navigate('HomeTab');
            
        } else {
            // this happens when user presses submit button
            await submitRecording();

            await FileSystem.deleteAsync(outputURI, { idempotent: true });

            setSubmitted(true);
            setModalOpen(true);
        }
    }

    return (
        <View 
            style={ { 
                width: width, 
                height: height,
                alignItems: 'center',
                justifyContent: 'center', 
            } } 
        >
            { isLoading ? ( <ActivityIndicator /> ) : ( 
                <View 
                    style={ {
                        width: width,
                        height: height,
                        ...globalStyles.container,
                    } }
                >   
                    {/* Pop-up notification upon successfully submitting */}
                    <Modal
                        visible={modalOpen}
                        transparent={true}
                        animationType="slide"
                        backdropColor="black"
                        backdropOpacity={ 0.8 }
                    >
                        {/* Outer View used for darkening tbe backdrop */}
                        <View
                            style={{
                                flex: 1,    
                                justifyContent: 'center',    
                                alignItems: 'center',    
                                backgroundColor: 'rgba(0, 0, 0, 0.5)', // Darken backdrop
                            }}
                        >
                            
                            <View
                                style={{
                                    width: width * 0.8,
                                    paddingTop: height * 0.05,
                                    paddingBottom: height * 0.1,

                                    backgroundColor: 'white',

                                    justifyContent: 'center',
                                    alignItems: 'center',

                                    shadowColor: '#000000',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.25,
                                    shadowRadius: 4,
                                    elevation: 5,
                                }}    
                            >
                                {/* Top Bar for close icon */}
                                <View
                                    style={{
                                        height: height * 0.05,
                                        width: width * 0.8,
                                        alignItems: 'flex-end',
                                        justifyContent: 'flex-end',
                                    }}
                                >
                                    <Ionicons 
                                        name="close-outline"
                                        size={25}
                                        onPress={() => {setModalOpen(false)}}
                                        style={{ marginRight: 0.08 * width, }}
                                    />
                                </View>

                                {/* Title Text */}
                                <Text
                                    style={{
                                        fontFamily: 'Baloo2-Bold',
                                        fontSize: 30,
                                    }}
                                >{answerResponse.feedback_title}</Text>



                                {/* Body Text */}
                                <Text
                                    style={{
                                        fontFamily: 'Baloo2-Regular',
                                        fontSize: 16,
                                    }}
                                >{answerResponse.feedback_body}</Text>

                            </View>

                        </View>
                    </Modal>

                    {/* Top Bar */}
                    <View 
                        style = {{
                            width: width,
                            height: height * 0.0625,
                            justifyContent: 'flex-end',
                        }}
                    >
                        <TouchableOpacity
                            style = {{
                                flexDirection: 'row',
                                alignItems: 'center',
                            }}
                            onPress={() => navigation.navigate('HomeTab')}
                        >
                            <Ionicons
                                name='chevron-back'
                                size={16}
                                color='#004643'
                                style = {{ 
                                    marginLeft: width / 12,
                                }}
                            />
                            <Text 
                                style = { { 
                                    color: '#004643', 
                                    marginLeft: 3, 
                                    fontSize: 16,
                                    fontFamily: 'Baloo2-Bold',
                                } }
                            > 
                                Back
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Question Component */}
                    <View
                        style = { { 
                            width: width,
                            height: height * 0.30,

                            justifyContent: 'center',
                            alignItems: 'center',
                        } } 
                    >
                        {/* Question Card */}
                        <View
                            style = { {
                                height: height * 0.25,
                                width: width * 0.85,
                                borderRadius: 20,
                                backgroundColor: 'white',

                                // styling shadow
                                shadowColor: '#000', // black shadow color
                                shadowOffset: { width: 0, height: 20 },
                                shadowOpacity: 0.2,
                                shadowRadius: 30,
                                elevation: 10, // for Android shadow
                            } }
                        >
                            <Text 
                                style = { { 
                                    marginTop: height * 0.03,
                                    marginHorizontal: 5,
                                    padding: 20,
                                    fontFamily: 'Baloo2-Bold',
                                    fontSize: 14,
                                } }
                            > 
                                { data.question } 
                            </Text>
                        </View>
                    </View>

                    {/* Audio Input for Answer */}
                    <View
                        style={{
                            height: height * 0.45,
                            width: width,
                            
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <View
                            style={{
                                height: height * 0.35,
                                width: width * 0.85,
                                
                                borderRadius: 20,
                                backgroundColor: 'white',

                                marginTop: -0.08 * height,

                                // styling shadow
                                shadowColor: '#000', // black shadow color
                                shadowOffset: { width: 0, height: 20 },
                                shadowOpacity: 0.2,
                                shadowRadius: 30,
                                elevation: 10, // for Android shadow
                                
                            }}
                        >
                        </View>

                        <TouchableOpacity
                            style={{
                                height: 60,
                                width: 60,
                                borderRadius: 60,

                                marginTop: -80,

                                backgroundColor: recording ? 'red' : 'black',

                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                            onPress={() => handleRecord()}
                        >
                            <MaterialIcons 
                                name={ recording ? 'square' :  'keyboard-voice' }
                                color='white'
                                size={ recording ? 30:35 }
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Next Button */}
                    <View
                        style = { { 
                            width: width,
                            height: height * 0.08,
                            alignItems: 'center',
                            justifyContent: 'center',

                            marginTop: height * -0.04,
                            marginBottom: height * 0.08,
                        } }
                    >
                        <TouchableOpacity
                            activeOpacity={ allowSubmit ? 0.7 : 1 }
                            style = { {
                                backgroundColor: allowSubmit ? '#004643' : '#3c716f',

                                height: height * 0.06,
                                width: width * 0.75,

                                ...globalStyles.button
                            } }
                            onPress={() => handleNext_Submit()}
                        >
                            <Text style = {globalStyles.buttonText}> {submitted ? 'Next' : 'Submit'} </Text>
                        </TouchableOpacity>
                    </View>

                </View> 
            )}
        </View>  
    )
}
