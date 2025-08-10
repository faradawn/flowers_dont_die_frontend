import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Dimensions, SafeAreaView, ScrollView, ActivityIndicator, TouchableOpacity, Modal, FlatList, TextInput } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import TopBar from '../components/TopBar';
import { Ionicons } from '@expo/vector-icons';
import { getCourses } from '../components/localDb';
import { useUser } from '../components/UserContext';

const height = Dimensions.get('screen').height;
const width = Dimensions.get('screen').width;

const CourseSelector = ({ selectedCourse, onSelect, onPasswordVerify, verifiedCourses, onVerifyCourse, courses }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [passwordModalVisible, setPasswordModalVisible] = useState(false);
    const [tempSelectedCourse, setTempSelectedCourse] = useState(selectedCourse);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleCourseSelect = (courseId) => {
        setModalVisible(false);
        onSelect(courseId);
    };

    const handleGetData = () => {
        if (verifiedCourses.has(selectedCourse)) {
            onPasswordVerify(true);
        } else {
            setTempSelectedCourse(selectedCourse);
            setPasswordModalVisible(true);
            setPassword('');
            setError('');
        }
    };

    const handlePasswordSubmit = () => {
        const course = courses.find(c => c.course_id === selectedCourse);
        if (course && password === course.password) {
            onVerifyCourse(selectedCourse);
            onPasswordVerify(true);
            setPasswordModalVisible(false);
        } else {
            setError('Incorrect password');
        }
    };

    return (
        <View style={styles.coursePickerContainer}>
            <View style={styles.selectorRow}>
                <TouchableOpacity 
                    style={styles.selectorButton}
                    onPress={() => setModalVisible(true)}
                >
                    <Text style={styles.selectedCourseText}>
                        {courses.find(course => course.course_id === selectedCourse)?.course_title}
                    </Text>
                    <Ionicons name="chevron-down" size={24} color="#004643" />
                </TouchableOpacity>
                <TouchableOpacity 
                    style={styles.getDataButton}
                    onPress={handleGetData}
                >
                    <Text style={styles.getDataText}>Get Data</Text>
                </TouchableOpacity>
            </View>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableOpacity 
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setModalVisible(false)}
                >
                    <View style={styles.modalContent}>
                        <FlatList
                            data={courses}
                            keyExtractor={(item) => item.course_id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.courseOption}
                                    onPress={() => handleCourseSelect(item.course_id)}
                                >
                                    <Text style={[
                                        styles.courseOptionText,
                                        selectedCourse === item.course_id && styles.selectedOption
                                    ]}>
                                        {item.course_title}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>

            <Modal
                animationType="fade"
                transparent={true}
                visible={passwordModalVisible}
                onRequestClose={() => setPasswordModalVisible(false)}
            >
                <TouchableOpacity 
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setPasswordModalVisible(false)}
                >
                    <View style={styles.passwordModalContent}>
                        <Text style={styles.passwordTitle}>Enter Course Password</Text>
                        <TextInput
                            style={styles.passwordInput}
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Enter password"
                            placeholderTextColor="#666"
                        />
                        {error ? <Text style={styles.errorText}>{error}</Text> : null}
                        <TouchableOpacity 
                            style={styles.submitButton}
                            onPress={handlePasswordSubmit}
                        >
                            <Text style={styles.submitButtonText}>Submit</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

export default function TeacherDashboard() {
    const [submissionsData, setSubmissionsData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [weeklyQuestionStat, setWeeklyQuestionStat] = useState([]);
    const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [isPasswordVerified, setIsPasswordVerified] = useState(false);
    const [verifiedCourses, setVerifiedCourses] = useState(new Set());
    const { user } = useUser();

    useEffect(() => {
        const loadCourses = async () => {
            try {
                const response = await getCourses(user?.uid || 'test');
                if (response.status === 'success' && response.courses.length > 0) {
                    setCourses(response.courses);
                    setSelectedCourse(response.courses[0].course_id);
                }
            } catch (error) {
                console.error('Error loading courses:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadCourses();
    }, []);

    useEffect(() => {
        if (isPasswordVerified) {
            fetchCourseStat();
            setIsPasswordVerified(false);
        }
    }, [isPasswordVerified]);

    const fetchCourseStat = async () => {
        setIsLoading(true);

        try {
            const response = await fetch(`https://backend.codingflora.com:8001/get_course_statistics?course_id=${encodeURIComponent(selectedCourse)}`, {
                method: 'GET',
                headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const responseData = await response.json();
            console.log("Response Data:", responseData);
            
            if (!responseData || !responseData.topics || !Array.isArray(responseData.topics)) {
                console.error('Invalid response data format:', responseData);
                setSubmissionsData([]);
                setWeeklyQuestionStat([]);
                return;
            }

            const totalSubmissions = responseData.topics.map(item => item.total_submissions);
            const weeklyData = responseData.topics.map(item => item.questions);
            setSubmissionsData(totalSubmissions);
            setWeeklyQuestionStat(weeklyData);
        } catch (error) {
            console.error('Error fetching course statistics:', error);
            setSubmissionsData([]);
            setWeeklyQuestionStat([]);
        } finally {
            setIsLoading(false);
        }
    }

    const chartWidth = Math.max(width * 0.85, submissionsData.length * width * 0.2);

    const handlePreviousWeek = () => {
        if (currentWeekIndex > 0) {
            setCurrentWeekIndex(currentWeekIndex - 1);
        }
    };

    const handleNextWeek = () => {
        if (currentWeekIndex < weeklyQuestionStat.length - 1) {
            setCurrentWeekIndex(currentWeekIndex + 1);
        }
    };

    const calculateAccuracy = (correct, total) => {
        if (total === 0) return 0;
        return ((correct / total) * 100).toFixed(1);
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#004643" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <View style={styles.container}>   
            <View style={styles.topSection}>
                <TopBar navigateTo={'HomeTab'}/>
                <CourseSelector
                    selectedCourse={selectedCourse}
                    onSelect={setSelectedCourse}
                    onPasswordVerify={setIsPasswordVerified}
                    verifiedCourses={verifiedCourses}
                    onVerifyCourse={(courseId) => {
                        setVerifiedCourses(prev => new Set([...prev, courseId]));
                    }}
                    courses={courses}
                />
            </View>
            <ScrollView 
                style={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                bounces={true}
            >
                <View style={styles.contentWrapper}>
                    <Text style={styles.mainTitle}>Teacher Dashboard</Text>
                    
                    <View style={styles.chartContainer}>
                        <View style={styles.chartWrapper}>
                            <Text style={styles.chartTitle}>
                                Student Engagement Trend
                            </Text>
                            <ScrollView 
                                horizontal={true}
                                showsHorizontalScrollIndicator={false}
                            >
                                <LineChart
                                    data={{
                                        labels: submissionsData.map((_, index) => `Week ${index + 1}`),
                                        datasets: [{ data: submissionsData }],
                                    }}
                                    width={chartWidth}
                                    height={height * 0.25}
                                    chartConfig={{
                                        backgroundColor: '#ffffff',
                                        backgroundGradientFrom: '#ffffff',
                                        backgroundGradientTo: '#ffffff',
                                        decimalPlaces: 0,
                                        color: (opacity = 1) => `rgba(0, 70, 67, ${opacity})`,
                                        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                        style: { borderRadius: 16 },
                                        propsForDots: {
                                            r: '6',
                                            strokeWidth: '2',
                                            stroke: '#004643',
                                        },
                                    }}
                                    bezier
                                    style={{
                                        marginVertical: width * 0.02,
                                        borderRadius: 16,
                                    }}
                                    withVerticalLines={true}
                                    withHorizontalLines={true}
                                    withDots={true}
                                    withShadow={false}
                                    yAxisLabel=""
                                    yAxisInterval={1}
                                    fromZero={true}
                                />
                                <Text style={styles.yAxisLabel}>Submissions</Text>
                            </ScrollView>
                            
                        </View>
                    </View>

                    {weeklyQuestionStat.length > 0 && (
                        <View style={[styles.weeklyQuestionsContainer, { marginBottom: 20 }]}>
                            <View style={styles.weeklyQuestionsWrapper}>
                                <Text style={styles.weeklyQuestionsTitle}>
                                    Weekly Questions
                                </Text>
                                <View style={styles.weeklyQuestionsContent}>
                                    <View style={styles.weekNavigator}>
                                        <TouchableOpacity 
                                            onPress={handlePreviousWeek}
                                            disabled={currentWeekIndex === 0}
                                            style={[styles.navButton, currentWeekIndex === 0 && styles.navButtonDisabled]}
                                        >
                                            <Ionicons name="chevron-back" size={24} color={currentWeekIndex === 0 ? "#ccc" : "#004643"} />
                                        </TouchableOpacity>
                                        <Text style={styles.weekIndicator}>Week {currentWeekIndex + 1} / {weeklyQuestionStat.length}</Text>
                                        <TouchableOpacity 
                                            onPress={handleNextWeek}
                                            disabled={currentWeekIndex === weeklyQuestionStat.length - 1}
                                            style={[styles.navButton, currentWeekIndex === weeklyQuestionStat.length - 1 && styles.navButtonDisabled]}
                                        >
                                            <Ionicons name="chevron-forward" size={24} color={currentWeekIndex === weeklyQuestionStat.length - 1 ? "#ccc" : "#004643"} />
                                        </TouchableOpacity>
                                    </View>
                                    <ScrollView style={styles.questionsList}>
                                        {weeklyQuestionStat[currentWeekIndex]?.map((question, index) => (
                                            <View key={index} style={styles.questionItem}>
                                                <View style={styles.accuracyContainer}>
                                                    <Text style={styles.accuracyText}>
                                                        {calculateAccuracy(question.correct_submissions, question.total_submissions)}%
                                                    </Text>
                                                </View>
                                                <Text style={styles.questionTitle} numberOfLines={2}>
                                                    {question.question_title}
                                                </Text>
                                            </View>
                                        ))}
                                    </ScrollView>
                                </View>
                            </View>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    topSection: {
        paddingTop: 50,
        backgroundColor: 'white',
        zIndex: 1,
    },
    mainTitle: {
        fontSize: 30,
        fontWeight: 'bold',
        color: 'black',
        textAlign: 'center',
        marginVertical: height * 0.02,
    },
    chartContainer: {
        alignItems: 'center',
        marginTop: height * 0.02,
    },
    chartWrapper: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: width * 0.04,
        width: '90%',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    chartContent: {
        position: 'relative',
    },
    chartTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: height * 0.02,
    },
    yAxisLabel: {
        position: 'absolute',
        left: -width * 0.06,
        top: height * 0.11,
        transform: [{ rotate: '-90deg' }],
        fontSize: 15,
        color: '#000',
    },
    weeklyQuestionsContainer: {
        alignItems: 'center',
        marginTop: height * 0.02,
        paddingHorizontal: width * 0.04,
        marginBottom: height * 0.02,
    },
    weeklyQuestionsWrapper: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: width * 0.04,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    weeklyQuestionsTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: height * 0.01,
    },
    weeklyQuestionsContent: {
        height: height * 0.3,
    },
    weekNavigator: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: width * 0.02,
        marginBottom: height * 0.02,
    },
    navButton: {
        padding: 10,
    },
    navButtonDisabled: {
        opacity: 0.5,
    },
    weekIndicator: {
        fontSize: 16,
        fontWeight: '600',
        color: '#004643',
    },
    questionsList: {
        flex: 1,
    },
    questionItem: {
        padding: width * 0.03,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        flexDirection: 'row',
        alignItems: 'center',
    },
    accuracyContainer: {
        width: width * 0.15,
        marginRight: width * 0.03,
        alignItems: 'center',
        justifyContent: 'center',
    },
    accuracyText: {
        fontSize: 17,
        color: '#004643',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    questionTitle: {
        flex: 1,
        fontSize: 16,
        color: '#000',
        paddingLeft: width * 0.02,
    },
    submissionText: {
        fontSize: 12,
        color: '#666',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: height * 0.05,
        paddingBottom: height * 0.03,
        minHeight: height * 1.08,
    },
    contentWrapper: {
        flex: 1,
        paddingHorizontal: width * 0.02,
    },
    coursePickerContainer: {
        width: '100%',
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingHorizontal: width * 0.04,
    },
    selectorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
    },
    selectorButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 10,
        backgroundColor: 'white',
    },
    selectedCourseText: {
        fontSize: 16,
        color: '#004643',
        fontWeight: '500',
    },
    getDataButton: {
        backgroundColor: '#004643',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 8,
        marginLeft: 10,
    },
    getDataText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '500',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingVertical: 20,
        maxHeight: height * 0.4,
    },
    courseOption: {
        padding: 15,
    },
    courseOptionText: {
        fontSize: 16,
        color: '#004643',
    },
    selectedOption: {
        fontWeight: 'bold',
    },
    passwordModalContent: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        width: width * 0.8,
        alignSelf: 'center',
        marginTop: height * 0.3,
    },
    passwordTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#004643',
        marginBottom: 15,
        textAlign: 'center',
    },
    passwordInput: {
        borderWidth: 1,
        borderColor: '#004643',
        borderRadius: 8,
        padding: 10,
        marginBottom: 15,
        fontSize: 16,
    },
    errorText: {
        color: 'red',
        marginBottom: 10,
        textAlign: 'center',
    },
    submitButton: {
        backgroundColor: '#004643',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    submitButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
    },
});

