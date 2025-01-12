import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Dimensions, SafeAreaView, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import TopBar from '../components/TopBar';
import { Ionicons } from '@expo/vector-icons';

const height = Dimensions.get('screen').height;
const width = Dimensions.get('screen').width;

export default function TeacherDashboard() {
    const [submissionsData, setSubmissionsData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [weeklyQuestionStat, setWeeklyQuestionStat] = useState([]);
    const [currentWeekIndex, setCurrentWeekIndex] = useState(0);

    useEffect(() => {
        fetchCourseStat();
    }, []);

    const fetchCourseStat = async () => {
        setIsLoading(true);
        const courseId = "College Prep";
        try {
            const response = await fetch(`https://backend.faradawn.site:8001/get_course_statistics?course_id=${encodeURIComponent(courseId)}`, {
                method: 'GET',
                headers: { "Content-Type": "application/json" },
            });
            const responseData = await response.json();
            console.log("Response Data:", responseData);
            const totalSubmissions = responseData.map(item => item.total_submissions);
            const weeklyData = responseData.map(item => item.questions);
            setSubmissionsData(totalSubmissions);
            setWeeklyQuestionStat(weeklyData);
        } catch (error) {
            console.log(error);
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
            <TopBar navigateTo={'HomeTab'}/>
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
                            </ScrollView>
                            <Text style={styles.yAxisLabel}>Submissions</Text>
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
                                        <Text style={styles.weekIndicator}>Week {currentWeekIndex + 1}</Text>
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
        left: -width * 0.03,
        top: height * 0.16,
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
});

