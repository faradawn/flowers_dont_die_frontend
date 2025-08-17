import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
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
import initialWeekly from '../../assets/data/initialWeekly.json';
import initialMonthly from '../../assets/data/initialMonthly.json';

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
    const [chartMode, setChartMode] = useState('Problems');
    const [timeFrame, setTimeFrame] = useState('Monthly');
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [dropdownLayout, setDropdownLayout] = useState({
        x: 0, y: 0, width: 0, height: 0, pageX: 0, pageY: 0
    });
    const dropdownRef = useRef(null);
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    const generateMonthlyLabels = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const daysInMonth = new Date(year, month, 0).getDate();
        
        return Array.from({length: daysInMonth}, (_, i) => {
            const day = i + 1;
            return day % 10 === 0 || day === 1 ? day.toString() : '';
        });
    };
    const monthDays = generateMonthlyLabels();

    const generateWeeklyLabels = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        
        const firstDay = new Date(year, month, 1);
        const firstDayOfWeek = firstDay.getDay();
        
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        const totalDays = daysInMonth + firstDayOfWeek;
        const numberOfWeeks = Math.ceil(totalDays / 7);
        
        return Array.from({ length: numberOfWeeks }, (_, i) => `W${i + 1}`);
    };
    const weeks = generateWeeklyLabels();

    const weekly = state.weekly ?? initialWeekly;
    const monthly = state.monthly ?? initialMonthly;
    
    console.log("WEEKLY: ", weekly);
    console.log("MONTHLY: ", monthly);
    
    const getStatsData = () => {
        return timeFrame === 'Monthly' ? [monthly.monthly_summary.this_month.problems_completed, monthly.monthly_summary.this_month.average_accuracy]
         : [weekly.weekly_summary.this_week.problems_completed, weekly.weekly_summary.this_week.average_accuracy];
    };
    
    const getProgressData = () => {
        if (timeFrame === 'Weekly') {
            return {
                labels: days,
                current: (weekly.weekly_summary.this_week.daily_stats ?? []).map(
                    day => day?.problems_completed ?? 0
                ),
                previous: (weekly.weekly_summary.last_week.daily_stats ?? []).map(
                    day => day?.problems_completed ?? 0
                ),
                currentLabel: 'This week',
                previousLabel: 'Last week'
            };
        } else {
            return {
                labels: monthDays,
                current: (monthly.monthly_summary.this_month.daily_problem_counts ?? []).map(
                    day => day?.count ?? 0
                ),
                previous: (monthly.monthly_summary.last_month.daily_problem_counts ?? []).map(
                    day => day?.count ?? 0
                ),
                currentLabel: 'This month',
                previousLabel: 'Last month'
            };
        }
    };

    const getCorrectnessData = () => {
        if (timeFrame === 'Weekly') {
            return {
                labels: days,
                current: (weekly.weekly_summary.this_week.daily_stats ?? []).map(
                    day => day?.accuracy_rate * 100 ?? 0
                ),
                previous: (weekly.weekly_summary.last_week.daily_stats ?? []).map(
                    day => day?.accuracy_rate * 100 ?? 0
                ),
                currentLabel: 'This week',
                previousLabel: 'Last week'
            };
        } else {
            return {
                labels: weeks,
                current: (monthly.monthly_summary.this_month.weekly_accuracy_rates ?? []).map(
                    week => week?.accuracy_rate * 100 ?? 0
                ),
                previous: (monthly.monthly_summary.last_month.weekly_accuracy_rates ?? []).map(
                    week => week?.accuracy_rate * 100 ?? 0
                ),
                currentLabel: 'This month',
                previousLabel: 'Last month'
            };
        }
    };

    const difficultyColors = {
        Easy: '#4B7C7B',
        Medium: '#58A6A8',
        Hard: '#64C0C1',
    };
      
    const difficultyOrder = ['Easy', 'Medium', 'Hard'];

    const typeColors = {
        R: 55,
        G: 94,
        B: 93
    };

    const getDifficultyData = () => {
      const rawData = timeFrame === 'Weekly' ? weekly.difficulty_breakdown : monthly.difficulty_breakdown;
      const rawDataAccuracy = timeFrame === 'Weekly' ? weekly.difficulty_accuracy : monthly.difficulty_accuracy;
    
      if (!rawData || !rawDataAccuracy || typeof rawData !== 'object' || typeof rawDataAccuracy != 'object') return [];
    
      const total = Object.values(rawData).reduce((acc, val) => acc + val, 0);
    
      return difficultyOrder
        .filter(type => rawData.hasOwnProperty(type))
        .map(type => ({
          type,
          completed: rawData[type],
          total,
          correctness: rawDataAccuracy[type] * 100,
          color: difficultyColors[type],
        }));
    };
    
    const getQuestionTypeData = () => {
        const rawData = timeFrame === 'Weekly' ? weekly.type_breakdown : monthly.type_breakdown;
        const rawDataAccuracy = timeFrame === 'Weekly' ? weekly.type_accuracy : monthly.type_accuracy;
      
        if (!rawData || !rawDataAccuracy || typeof rawData !== 'object' || typeof rawDataAccuracy != 'object') return [];
      
        const total = Object.values(rawData).reduce((acc, val) => acc + val, 0);
      
        return Object.keys(rawData).sort((a, b) => rawData[b] - rawData[a])
        .map((type, index) => {
            let rValue = typeColors['R'];
            let gValue = typeColors['G'];
            let bValue = typeColors['B'];
            
            for (let i = 0; i <= index; i++) {
                rValue += 30 * Math.pow(2/3, i);
                gValue += 45 * Math.pow(2/3, i);
                bValue += 45 * Math.pow(2/3, i);
            }
            
            return {
                type,
                count: rawData[type],
                percentage: total ? (rawData[type] / total) * 100 : 0,
                correctness: rawDataAccuracy[type] * 100, 
                color: `rgba(${Math.round(rValue)}, ${Math.round(gValue)}, ${Math.round(bValue)}, 1)`,
            };
        });
    };
    
    // Calculate the maximum value for the chart
    const progressData = chartMode === 'Problems' ? getProgressData() : getCorrectnessData();
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
                                <Text style={styles.statNumber}>{getStatsData()[0]}</Text>
                            </View>
                            <Text style={styles.statLabel}>problems finished</Text>
                        </View>
                        
                        <View style={styles.statCard}>
                            <View style={styles.iconTextGroup}>
                                <Ionicons name="checkmark-circle-outline" size={24} color="#4b7c7b" />
                                <Text style={styles.statNumber}>{(getStatsData()[1] * 100).toFixed(1)}%</Text>
                            </View>
                            <Text style={styles.statLabel}>correctness rate</Text>
                        </View>
                    </View>
                    
                    {/* Progress Chart */}
                    <View style={styles.chartContainer}>
                        <View style={styles.chartLabels}>
                            <TouchableOpacity onPress={() => setChartMode('Problems')}>
                                <Text style={[
                                    styles.questionCompletedChartTitle,
                                    chartMode === 'Problems' ? styles.activeChartLabel : styles.inactiveChartLabel
                                ]}>
                                    Questions completed
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setChartMode('Correctness')}>
                                <Text style={[
                                    styles.correctnessChartTitle,
                                    chartMode === 'Correctness' ? styles.activeChartLabel : styles.inactiveChartLabel
                                ]}>
                                    % of correctness
                                </Text>
                            </TouchableOpacity>
                        </View>
                        
                        <View style={styles.chartLegend}>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendLine, {backgroundColor: '#333'}]} />
                                <Text style={styles.legendText}>{progressData.currentLabel}</Text>
                            </View>
                            <View style={styles.legendItem}>
                            <View style={[styles.legendLine, {backgroundColor: '#ccc'}]} />
                            <Text style={styles.legendText}>{progressData.previousLabel}</Text>
                            </View>
                        </View>
                        
                        <View style={styles.chartWrapper}>
                            <LineChart
                                data={{
                                    labels: progressData.labels,
                                    datasets: [
                                        // transparent line to update scale when correctness is selected
                                        { data: [chartMode === 'Correctness' ? 100 : 0, 0], color: () => 'transparent', strokeWidth: 0, withDots: false, },
                                        {
                                            data: progressData.previous,
                                            color: (opacity = 1) => `rgba(204, 204, 204, ${opacity})`,
                                            strokeWidth: 2,
                                            strokeDashArray: [5, 5]
                                        },
                                        {
                                            data: progressData.current,
                                            color: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
                                            strokeWidth: 2
                                        }
                                    ],
                                }}
                                width={width - 40}
                                height={220}
                                yAxisSuffix={chartMode === 'Correctness' ? '%' : ''}
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
                                        r: timeFrame === 'Weekly' || chartMode === 'Correctness' ? '4' : '2',
                                    }
                                }}
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
                                        flex: (item.total && item.total !== 0) ? item.completed / item.total : 0, 
                                        backgroundColor: item.color 
                                    }
                                ]} 
                            />
                        ))}
                    </View>
                    
                    <View style={styles.breakdownTable}>
                        <View style={styles.tableHeaderRow}>
                            <Text style={styles.tableHeaderLeft}>Type</Text>
                            <Text style={styles.tableHeaderRight}>{(chartMode === 'Problems') ? 'Completed Number' : 'Accuracy Rate'}</Text>
                        </View>
                        
                        {getDifficultyData().map((item, index) => (
                            <View key={index} style={styles.tableRow}>
                                <View style={styles.typeLabelContainer}>
                                    <View style={[styles.colorDot, { backgroundColor: item.color }]} />
                                    <Text style={styles.typeLabel}>{item.type}</Text>
                                </View>
                                <Text style={styles.completedValue}>{chartMode === 'Problems' ? item.completed : item.correctness.toFixed(1) + '%'}</Text>
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
                            <Text style={styles.tableHeaderRight}>{(chartMode === 'Problems') ? 'Completed Number' : 'Accuracy Rate'}</Text>
                        </View>
                        
                        {getQuestionTypeData().map((item, index) => (
                            <View key={index} style={styles.tableRow}>
                                <View style={styles.typeLabelContainer}>
                                    <View style={[styles.colorDot, { backgroundColor: item.color }]} />
                                    <Text style={styles.typeLabel}>{item.type}</Text>
                                </View>
                                <Text style={styles.completedValue}>{chartMode === 'Problems' ? item.count : item.correctness.toFixed(1) + '%'}</Text>
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
        lineHeight: 20,
        letterSpacing: 0.21,
    },
    correctnessChartTitle: {
        fontFamily: 'Nunito',
        fontSize: 14,
        fontStyle: 'normal',
        lineHeight: 20,
        letterSpacing: 0.21,
        color: '#000000',
    },
    activeChartLabel: {
        fontWeight: '700',
        textDecorationLine: 'underline',
    },
    inactiveChartLabel: {
        fontWeight: '400',
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
    tableHeaderRight: {
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