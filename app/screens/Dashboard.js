import React, { useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    Dimensions, 
    ScrollView, 
    TouchableOpacity,
    SafeAreaView,
    Image 
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useUser } from '../components/UserContext';
import { LineChart } from 'react-native-chart-kit';

const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;

// Mock data for the dashboard
const mockData = {
    weeklyStats: {
        problemsFinished: 28,
        correctnessRate: 78
    },
    weeklyProgress: {
        thisWeek: [3, 6, 2, 10, 11, 8, 6],
        lastWeek: [4, 4, 3, 12, 11, 5, 7]
    },
    difficultyBreakdown: [
        { type: 'Easy', completed: 8, total: 15, color: '#4b7c7b' },
        { type: 'Medium', completed: 5, total: 15, color: '#6BAEAE' },
        { type: 'Hard', completed: 2, total: 15, color: '#E0E9E9' }
    ],
    questionTypeBreakdown: [
        { type: 'BFS/DFS', percentage: 50, correctness: 50, color: '#4b7c7b' },
        { type: 'Sorting', percentage: 30, correctness: 30, color: '#6BAEAE' },
        { type: 'Backtracking', percentage: 15, correctness: 15, color: '#E0E9E9' },
        { type: 'Other', percentage: 5, correctness: 5, color: '#F0F5F5' }
    ]
};

export default function Dashboard({ navigation }) {
    const { state } = useUser();
    const [timeFrame, setTimeFrame] = useState('Weekly');
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    
    // Calculate the maximum value for the chart
    const maxValue = Math.max(
        ...mockData.weeklyProgress.thisWeek,
        ...mockData.weeklyProgress.lastWeek
    );
    
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Dashboard Header */}
                <View style={styles.headerContainer}>
                    <Text style={styles.dashboardTitle}>Dashboard</Text>
                    <TouchableOpacity style={styles.selectorButton}>
                        <Text style={styles.selectorText}>{timeFrame}</Text>
                        <Ionicons name="chevron-down-outline" size={16} color="#333" />
                    </TouchableOpacity>
                </View>
                
                {/* Weekly Summary Section */}
                <View style={styles.summaryContainer}>
                    <Text style={styles.weeklySummaryTitle}>Weekly Summary</Text>
                    
                    <View style={styles.statsContainer}>
                        <View style={styles.statCard}>
                            <View style={styles.iconTextGroup}>
                                <Ionicons name="document-text-outline" size={24} color="#FF6B6B" />
                                <Text style={styles.statNumber}>{mockData.weeklyStats.problemsFinished}</Text>
                            </View>
                            <Text style={styles.statLabel}>problems finished</Text>
                        </View>
                        
                        <View style={styles.statCard}>
                            <View style={styles.iconTextGroup}>
                                <Ionicons name="checkmark-circle-outline" size={24} color="#4b7c7b" />
                                <Text style={styles.statNumber}>{mockData.weeklyStats.correctnessRate}%</Text>
                            </View>
                            <Text style={styles.statLabel}>correctness rate</Text>
                        </View>
                    </View>
                    
                    {/* Progress Chart */}
                    <View style={styles.chartContainer}>
                        <View style={styles.chartLabels}>
                            <Text style={styles.questionCompletedChartTitle}>Questions completed</Text>
                            <Text style={styles.correctnessChartTitle}>% of correctness</Text>
                        </View>
                        
                        <View style={styles.chartLegend}>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendLine, {backgroundColor: '#333'}]} />
                                <Text style={styles.legendText}>This week</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendLine, {backgroundColor: '#ccc', borderStyle: 'dashed'}]} />
                                <Text style={styles.legendText}>Last week</Text>
                            </View>
                        </View>
                        
                        <View style={styles.chartWrapper}>
                            <LineChart
                                data={{
                                    labels: days,
                                    datasets: [
                                        {
                                            data: mockData.weeklyProgress.thisWeek,
                                            color: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
                                            strokeWidth: 2
                                        },
                                        {
                                            data: mockData.weeklyProgress.lastWeek,
                                            color: (opacity = 1) => `rgba(204, 204, 204, ${opacity})`,
                                            strokeWidth: 2,
                                            strokeDashArray: [5, 5]
                                        }
                                    ],
                                }}
                                width={width - 40}
                                height={220}
                                yAxisSuffix=""
                                withShadow={false}
                                withDots={true}
                                withInnerLines={true}
                                withOuterLines={false}
                                withVerticalLines={false}
                                withHorizontalLines={true}
                                chartConfig={{
                                    backgroundColor: '#fff',
                                    backgroundGradientFrom: '#fff',
                                    backgroundGradientTo: '#fff',
                                    decimalPlaces: 0,
                                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                    style: {
                                        borderRadius: 16
                                    },
                                    propsForBackgroundLines: {
                                        strokeDasharray: '', 
                                        strokeWidth: 1,
                                        stroke: '#E0E0E0',
                                    },
                                    propsForDots: {
                                        r: '4',
                                    }
                                }}
                                bezier
                                style={{
                                    marginVertical: 8,
                                    borderRadius: 16,
                                }}
                                fromZero={true}
                                segments={4}
                            />
                        </View>
                    </View>
                </View>
                
                {/* Difficulty Breakdown */}
                <View style={styles.breakdownContainer}>
                    <Text style={styles.sectionTitle}>Difficulty Breakdown</Text>
                    
                    <View style={styles.progressBarContainer}>
                        {mockData.difficultyBreakdown.map((item, index) => (
                            <View 
                                key={index} 
                                style={[
                                    styles.progressBarSegment, 
                                    { 
                                        flex: item.completed / 15, 
                                        backgroundColor: item.color 
                                    }
                                ]} 
                            />
                        ))}
                    </View>
                    
                    <View style={styles.breakdownTable}>
                        <View style={styles.tableHeaderRow}>
                            <Text style={styles.tableHeaderLeft}>Type</Text>
                            <Text style={styles.difficultyBreakdownTableHeaderRight}>Completed Number</Text>
                        </View>
                        
                        {mockData.difficultyBreakdown.map((item, index) => (
                            <View key={index} style={styles.tableRow}>
                                <View style={styles.typeLabelContainer}>
                                    <View style={[styles.colorDot, { backgroundColor: item.color }]} />
                                    <Text style={styles.typeLabel}>{item.type}</Text>
                                </View>
                                <Text style={styles.typeValueRight}>{item.completed}/{item.total}</Text>
                            </View>
                        ))}
                    </View>
                </View>
                
                {/* Question Type Breakdown */}
                <View style={styles.breakdownContainer}>
                    <Text style={styles.sectionTitle}>Question Type Breakdown</Text>
                    
                    <View style={styles.progressBarContainer}>
                        {mockData.questionTypeBreakdown.map((item, index) => (
                            <View 
                                key={index} 
                                style={[
                                    styles.progressBarSegment, 
                                    { 
                                        flex: item.percentage / 100, 
                                        backgroundColor: item.color 
                                    }
                                ]} 
                            />
                        ))}
                    </View>
                    
                    <View style={styles.breakdownTable}>
                        <View style={styles.tableHeaderRow}>
                            <Text style={styles.tableHeaderLeft}>Type</Text>
                            <Text style={styles.tableHeaderCenter}>Percentage</Text>
                            <Text style={styles.tableHeaderRight}>Correctness</Text>
                        </View>
                        
                        {mockData.questionTypeBreakdown.map((item, index) => (
                            <View key={index} style={styles.tableRow}>
                                <View style={styles.typeLabelContainer}>
                                    <View style={[styles.colorDot, { backgroundColor: item.color }]} />
                                    <Text style={styles.typeLabel}>{item.type}</Text>
                                </View>
                                <Text style={styles.typeValueCenter}>{item.percentage}%</Text>
                                <Text style={styles.typeValueRight}>{item.correctness}%</Text>
                            </View>
                        ))}
                    </View>
                </View>
                
                {/* Spacer to ensure all content is visible above the tab bar */}
                <View style={{ height: 80 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: height * 0.06,
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 20,
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
    },
    dashboardTitle: {
        fontFamily: 'Baloo2-Bold',
        fontSize: 28,
        color: '#333',
    },
    selectorButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    selectorText: {
        fontFamily: 'Nunito-Regular',
        fontSize: 14,
        color: '#333',
        marginRight: 5,
    },
    summaryContainer: {
        marginBottom: 25,
    },
    weeklySummaryTitle: {
        fontFamily: 'Montserrat',
        fontSize: 22,
        color: 'black',
        marginBottom: 15,
    },
    sectionTitle: {
        fontFamily: 'Montserrat-Medium',
        fontSize: 20,
        color: '#333',
        marginBottom: height * 0.03,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    statCard: {
        width: '48%',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 10,
        padding: 15,
    },
    iconTextGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    statNumber: {
        fontFamily: 'Baloo2-Bold',
        fontSize: 24,
        color: '#333',
        marginLeft: 8,
    },
    statLabel: {
        fontFamily: 'Baloo2-Regular',
        fontSize: 14,
        color: '#666',
    },
    chartContainer: {
        marginTop: 15,
    },
    chartLabels: {
        flexDirection: 'row',
        justifyContent:'flex-start' ,
        gap: width * 0.03,
    },
    questionCompletedChartTitle: {
        color: '#000000',
        fontFamily: 'Nunito',
        fontSize: 14,
        fontStyle: 'normal',
        fontWeight: '700',
        lineHeight: 20,
        letterSpacing: 0.21,
    },
    correctnessChartTitle: {
        fontFamily: 'Nunito',
        fontSize: 14,
        fontStyle: 'normal',
        fontWeight: '400',
        lineHeight: 20,
        letterSpacing: 0.21,
        color: '#000000',
    },
    chartLegend: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: 5,
        marginBottom: 10,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 15,
    },
    legendLine: {
        width: 20,
        height: 2,
        marginRight: 5,
    },
    legendText: {
        fontFamily: 'Baloo2-Regular',
        fontSize: 12,
        color: '#666',
    },
    chartWrapper: {
        marginVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    breakdownContainer: {
        marginBottom: 25,
    },
    progressBarContainer: {
        flexDirection: 'row',
        height: height * 0.045,
        overflow: 'hidden',
        marginBottom: 15,

    },
    progressBarSegment: {
        height: '100%',
    },
    breakdownTable: {
        flexDirection: 'column',
        width: '100%',
    },
    tableHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 10,
    },
    tableHeaderLeft: {
        fontFamily: 'Baloo2-Bold',
        fontSize: 14,
        color: '#333',
        width: '40%',
        textAlign: 'left',
    },
    tableHeaderCenter: {
        fontFamily: 'Baloo2-Bold',
        fontSize: 14,
        color: '#333',
        width: '30%',
        textAlign: 'left',
    },
    difficultyBreakdownTableHeaderRight: {
        fontFamily: 'Baloo2-Bold',
        fontSize: 14,
        color: '#333',
        width: '40%',
        textAlign: 'right',
    },
    tableRow: {
        flexDirection: 'row',
        width: '100%',
        marginBottom: 8,
        alignItems: 'center',
    },
    typeLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '40%',
    },
    colorDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 10,
    },
    typeLabel: {
        fontFamily: 'Baloo2-Regular',
        fontSize: 15,
        color: '#333',
    },
    typeValueCenter: {
        fontFamily: 'Baloo2-Regular',
        fontSize: 15,
        color: '#333',
        width: '30%',
        textAlign: 'left',
    },
    typeValueRight: {
        fontFamily: 'Baloo2-Regular',
        fontSize: 15,
        color: '#333',
        width: '30%',
        textAlign: 'right',
    },
}); 