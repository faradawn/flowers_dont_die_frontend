import React from 'react';
import { Text, View, Image, ScrollView, TouchableOpacity } from 'react-native';

import { images, colors } from '../globalStyles/globalStyles';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function Card({ item, height, width, pressHandler }){
    const totalQuestionsDone = item.questions_done.length;
    // console.log("Card item row num", item.row_num, "num question done", totalQuestionsDone);
    const getIndex = () => {
        return ( (item.row_num - 1 % 9) + 1 );
    }

    return (
        <TouchableOpacity
            style={{
                height: height,
                width: width,
                marginVertical: height * 0.1,

                backgroundColor: 'white',
                borderRadius: 20,

                shadowColor: '#000', // black shadow color
                shadowOffset: { width: 2, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 1,
                elevation: 2, // for Android shadow

                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
            }}
            onPress={() => pressHandler(item.topic)}
        >
            {/* Image At the Front */}
            <Image 
                style={{
                    marginLeft: width * 0.05,
                    height: height * 0.8,
                    width: width * 0.1,
                }}
                source={images.id[getIndex()]}
            />

            {/* Bulk Info of Card */}
            <View
                style={{
                    height: height,
                    width: width * 0.65,

                    marginLeft: width * 0.1,

                    alignItems: 'flex-start',
                }}
            >
                {/* Label Text for Topic */}
                <Text 
                    style={{ 
                        marginTop: 0.2 * height,
                        fontFamily: 'Baloo2-Regular',
                        fontSize: 18,
                    }}
                >
                    { item.topic }
                </Text>

                {/* Square Indicators for Each Topic */}
                <ScrollView
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    style={{ height: 0.18 }}
                >
                    {(item.questions_done).map((item, index) => {
                        let squareColor;

                        if (totalQuestionsDone <= 2) {
                            squareColor = 'red';
                        } else if (totalQuestionsDone <= 4) {
                            squareColor = '#F8C660';
                        } else {
                            squareColor = 'green';
                        }

                        return (
                            <View 
                                key={index}
                                style={{ 
                                    height: 0.17 * height,
                                    width: 0.17 * height,
                                    marginRight: 0.01 * width,
                                    backgroundColor: squareColor,
                                }}
                            />
                        );
                    })}
                </ScrollView>
            </View>

            {/* End Icon */}
            <View
                style={{
                    height: height * 0.8,
                    width: width * 0.125,

                    alignitem: 'flex-end',
                    justifyContent: 'center'
                }}
            >
                <Ionicons 
                    name={'chevron-forward-outline'}
                />
            </View>
        </TouchableOpacity>
    )
}