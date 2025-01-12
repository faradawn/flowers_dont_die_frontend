import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Dimensions, SafeAreaView, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import TopBar from '../components/TopBar';

const height = Dimensions.get('screen').height;
const width = Dimensions.get('screen').width;

export default function TeacherDashboard() {
    const [submissionsData, setSubmissionsData] = useState([]);

    useEffect(() => {
        fetchCourseStat();
    }, []);

    const fetchCourseStat = async () => {
        const courseId = "College Prep";
        try {
            const response = await fetch(`https://backend.faradawn.site:8001/get_course_statistics?course_id=${encodeURIComponent(courseId)}`, {
                method: 'GET',
                headers: { "Content-Type": "application/json" },
            });
            const responseData = await response.json();
            const totalSubmissions = responseData.map(item => item.total_submissions);
            setSubmissionsData(totalSubmissions);
        } catch (error) {
            console.log(error);
        }
    }

    const chartWidth = Math.max(width * 0.85, submissionsData.length * width * 0.2);

    return (
        <SafeAreaView style={styles.container}>   
            <TopBar navigateTo={'HomeTab'}/>
            <View style={styles.header}>
                <Text style={styles.headerText}>Teacher Dashboard</Text>
            </View>
            <View style={styles.chartContainer}>
                {submissionsData.length > 0 && (
                    <View style={styles.chartWrapper}>
                        <View style={styles.chartContent}>
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
                                    datasets: [
                                        {
                                            data: submissionsData,
                                        },
                                    ],
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
                                    style: {
                                        borderRadius: 16,
                                    },
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
                                    marginTop: height * 0.05,
                                }}
                                withVerticalLines={true}
                                withHorizontalLines={true}
                                withDots={true}
                                withShadow={false}
                                yAxisLabel=""
                                yAxisInterval={1}
                            />
                            </ScrollView>
                            <Text style={styles.yAxisLabel}>
                                Submissions
                            </Text>
                        </View>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    header: {
        height: 0.03 * height,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 0.075 * height,
    },
    headerText: {
        fontSize: 30,
        fontWeight: 'bold',
        color: 'black',
        zIndex: 100,
    },
    chartContainer: {
        alignItems: 'center',
        marginTop: height * 0.04,
    },
    chartWrapper: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: width * 0.04,
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
        position: 'absolute',
        marginTop: height * 0.02,
        left: width * 0.01,
        top: -height * 0.02,
        fontSize: 20,
        color: '#000',
        fontWeight: 'bold',
        zIndex: 1,
    },
    yAxisLabel: {
        position: 'absolute',
        left: -width * 0.07,
        top: height * 0.14,
        transform: [{ rotate: '-90deg' }],
        fontSize: 15,
        color: '#000',
    }
});

