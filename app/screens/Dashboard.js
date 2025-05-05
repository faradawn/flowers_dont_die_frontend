import React, { useState, useEffect, useRef } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    Dimensions, 
    ScrollView, 
    TouchableOpacity,
    SafeAreaView,
    Image,
    Modal,
    TouchableWithoutFeedback,
    Platform
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
    ],
    monthlyStats: {
        problemsFinished: 112,
        correctnessRate: 82
    },
    monthlyProgress: {
        thisMonth: [15, 22, 30, 25],
        lastMonth: [12, 18, 26, 20]
    },
    monthlyDifficultyBreakdown: [
        { type: 'Easy', completed: 42, total: 60, color: '#4b7c7b' },
        { type: 'Medium', completed: 30, total: 60, color: '#6BAEAE' },
        { type: 'Hard', completed: 15, total: 60, color: '#E0E9E9' }
    ],
    monthlyQuestionTypeBreakdown: [
        { type: 'BFS/DFS', percentage: 45, correctness: 55, color: '#4b7c7b' },
        { type: 'Sorting', percentage: 25, correctness: 35, color: '#6BAEAE' },
        { type: 'Backtracking', percentage: 20, correctness: 25, color: '#E0E9E9' },
        { type: 'Other', percentage: 10, correctness: 18, color: '#F0F5F5' }
    ]
};

export default function Dashboard({ navigation }) {
    const { state } = useUser();
    const [timeFrame, setTimeFrame] = useState('Monthly');
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [dropdownLayout, setDropdownLayout] = useState({
        x: 0, y: 0, width: 0, height: 0, pageX: 0, pageY: 0
    });
    const dropdownRef = useRef(null);
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    
    // Get the current data based on timeFrame
    const getStatsData = () => {
        return timeFrame === 'Monthly' ? mockData.monthlyStats : mockData.weeklyStats;
    };
    
    const getProgressData = () => {
        if (timeFrame === 'Weekly') {
            return {
                labels: days,
                current: mockData.weeklyProgress.thisWeek,
                previous: mockData.weeklyProgress.lastWeek,
                currentLabel: 'This week',
                previousLabel: 'Last week'
            };
        } else {
            return {
                labels: weeks,
                current: mockData.monthlyProgress.thisMonth,
                previous: mockData.monthlyProgress.lastMonth,
                currentLabel: 'This month',
                previousLabel: 'Last month'
            };
        }
    };
    
    const getDifficultyData = () => {
        return timeFrame === 'Weekly' ? mockData.difficultyBreakdown : mockData.monthlyDifficultyBreakdown;
    };
    
    const getQuestionTypeData = () => {
        return timeFrame === 'Weekly' ? mockData.questionTypeBreakdown : mockData.monthlyQuestionTypeBreakdown;
    };
    
    // Calculate the maximum value for the chart
    const progressData = getProgressData();
    const maxValue = Math.max(
        ...progressData.current,
        ...progressData.previous
    );
    
    const handleSelectTimeFrame = (selected) => {
        console.log('Changing timeFrame to:', selected);
        setTimeFrame(selected);
        setDropdownVisible(false);
    };
    
    const measureDropdown = () => {
        if (dropdownRef.current) {
            dropdownRef.current.measure((x, y, width, height, pageX, pageY) => {
                setDropdownLayout({x, y, width, height, pageX, pageY});
                setDropdownVisible(true);
            });
        }
    };
    
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Dashboard Header */}
                <View style={styles.headerContainer}>
                    <Text style={styles.dashboardTitle}>Dashboard</Text>
                    <TouchableOpacity 
                        ref={dropdownRef}
                        style={styles.selectorButton} 
                        onPress={measureDropdown}
                    >
                        <Text style={styles.selectorText}>{timeFrame}</Text>
                        <Ionicons name={dropdownVisible ? "chevron-up-outline" : "chevron-down-outline"} size={16} color="#004643" />
                    </TouchableOpacity>
                </View>
                
                {/* Summary Section */}
                <View style={styles.summaryContainer}>
                    <Text style={styles.weeklySummaryTitle}>{timeFrame} Summary</Text>
                    
                    <View style={styles.statsContainer}>
                        <View style={styles.statCard}>
                            <View style={styles.iconTextGroup}>
                                <Ionicons name="document-text-outline" size={24} color="#FF6B6B" />
                                <Text style={styles.statNumber}>{getStatsData().problemsFinished}</Text>
                            </View>
                            <Text style={styles.statLabel}>problems finished</Text>
                        </View>
                        
                        <View style={styles.statCard}>
                            <View style={styles.iconTextGroup}>
                                <Ionicons name="checkmark-circle-outline" size={24} color="#4b7c7b" />
                                <Text style={styles.statNumber}>{getStatsData().correctnessRate}%</Text>
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
                                <Text style={styles.legendText}>{progressData.currentLabel}</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendLine, {backgroundColor: '#ccc', borderStyle: 'dashed'}]} />
                                <Text style={styles.legendText}>{progressData.previousLabel}</Text>
                            </View>
                        </View>
                        
                        <View style={styles.chartWrapper}>
                            <LineChart
                                data={{
                                    labels: progressData.labels,
                                    datasets: [
                                        {
                                            data: progressData.current,
                                            color: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
                                            strokeWidth: 2
                                        },
                                        {
                                            data: progressData.previous,
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
                        {getDifficultyData().map((item, index) => (
                            <View 
                                key={index} 
                                style={[
                                    styles.progressBarSegment, 
                                    { 
                                        flex: item.completed / item.total, 
                                        backgroundColor: item.color 
                                    }
                                ]} 
                            />
                        ))}
                    </View>
                    
                    <View style={styles.breakdownTable}>
                        <View style={styles.tableHeaderRow}>
                            <Text style={styles.tableHeaderLeft}>Type</Text>
                            <Text style={styles.tableCompletedHeader}>Completed Number</Text>
                        </View>
                        
                        {getDifficultyData().map((item, index) => (
                            <View key={index} style={styles.tableRow}>
                                <View style={styles.typeLabelContainer}>
                                    <View style={[styles.colorDot, { backgroundColor: item.color }]} />
                                    <Text style={styles.typeLabel}>{item.type}</Text>
                                </View>
                                <Text style={styles.completedValue}>{item.completed}/{item.total}</Text>
                            </View>
                        ))}
                    </View>
                </View>
                
                {/* Question Type Breakdown */}
                <View style={styles.breakdownContainer}>
                    <Text style={styles.sectionTitle}>Question Type Breakdown</Text>
                    
                    <View style={styles.progressBarContainer}>
                        {getQuestionTypeData().map((item, index) => (
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
                            <Text style={styles.tablePercentageHeader}>Percentage</Text>
                            <Text style={styles.tableCorrectnessHeader}>Correctness</Text>
                        </View>
                        
                        {getQuestionTypeData().map((item, index) => (
                            <View key={index} style={styles.tableRow}>
                                <View style={styles.typeLabelContainer}>
                                    <View style={[styles.colorDot, { backgroundColor: item.color }]} />
                                    <Text style={styles.typeLabel}>{item.type}</Text>
                                </View>
                                <Text style={styles.percentageValue}>{item.percentage}%</Text>
                                <Text style={styles.correctnessValue}>{item.correctness}%</Text>
                            </View>
                        ))}
                    </View>
                </View>
                
                {/* Spacer to ensure all content is visible above the tab bar */}
                <View style={{ height: 80 }} />
            </ScrollView>
            
            {/* Dropdown Menu Modal */}
            <Modal
                visible={dropdownVisible}
                transparent={true}
                animationType="none"
                onRequestClose={() => setDropdownVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setDropdownVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <View 
                                style={[
                                    styles.dropdownMenu,
                                    {
                                        position: 'absolute',
                                        top: dropdownLayout.pageY + dropdownLayout.height,
                                        left: Platform.OS === 'ios' ? dropdownLayout.pageX : dropdownLayout.x,
                                        width: dropdownLayout.width,
                                    }
                                ]}
                            >
                                <TouchableOpacity 
                                    style={[styles.dropdownItem, timeFrame === 'Weekly' && styles.dropdownItemActive]}
                                    onPress={() => handleSelectTimeFrame('Weekly')}
                                >
                                    <Text style={[styles.dropdownItemText, timeFrame === 'Weekly' && styles.dropdownItemTextActive]}>Weekly</Text>
                                </TouchableOpacity>
                                <View style={styles.dropdownDivider} />
                                <TouchableOpacity 
                                    style={[styles.dropdownItem, timeFrame === 'Monthly' && styles.dropdownItemActive]}
                                    onPress={() => handleSelectTimeFrame('Monthly')}
                                >
                                    <Text style={[styles.dropdownItemText, timeFrame === 'Monthly' && styles.dropdownItemTextActive]}>Monthly</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
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
        fontSize: 26,
        color: '#333',
    },
    selectorButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        paddingHorizontal: 12,
        paddingVertical: height * 0.01,
        zIndex: 1,
        backgroundColor: '#fff',
    },
    selectorText: {
        fontFamily: 'Nunito-Regular',
        fontSize: 14,
        color: '#333',
        marginRight: 5,
    },
    summaryContainer: {
        marginBottom: height * 0.02,
    },
    weeklySummaryTitle: {
        paddingTop: height * 0.01,
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
    tablePercentageHeader: {
        fontFamily: 'Baloo2-Bold',
        fontSize: 14,
        color: '#333',
        width: '30%',
        textAlign: 'left',
        paddingLeft: width * 0.05,
    },
    tableCorrectnessHeader: {
        fontFamily: 'Baloo2-Bold',
        fontSize: 14,
        color: '#333',
        width: '30%',
        textAlign: 'right',
    },
    tableCompletedHeader: {
        fontFamily: 'Baloo2-Bold',
        fontSize: 14,
        color: '#333',
        width: '60%',
        textAlign: 'right',
        paddingRight: width * 0.01,
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
    percentageValue: {
        fontFamily: 'Baloo2-Regular',
        fontSize: 15,
        color: '#333',
        width: '30%',
        textAlign: 'left',
        paddingLeft: width * 0.09,
    },
    correctnessValue: {
        fontFamily: 'Baloo2-Regular',
        fontSize: 15,
        color: '#333',
        width: '30%',
        textAlign: 'right',
    },
    completedValue: {
        fontFamily: 'Baloo2-Regular',
        fontSize: 15,
        color: '#333',
        width: '60%',
        textAlign: 'right',
        paddingRight: width * 0.03,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    dropdownMenu: {
        backgroundColor: '#fff',
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#ccc',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
        overflow: 'hidden',
    },
    dropdownItem: {
        paddingVertical: height * 0.01,
        paddingHorizontal: 12,
        width: '100%',
    },
    dropdownDivider: {
        height: 1,
        backgroundColor: '#E0E0E0',
        width: '100%',
    },
    dropdownItemActive: {
        backgroundColor: '#f9f9f9',
    },
    dropdownItemText: {
        fontFamily: 'Baloo2-Regular',
        fontSize: 14,
        color: '#333',
    },
    dropdownItemTextActive: {
        color: '#004643',
        fontFamily: 'Baloo2-Bold',
    },
}); 