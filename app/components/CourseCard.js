import React from 'react';
import { Text, View, Image, ScrollView, TouchableOpacity } from 'react-native';

import { colors } from '../globalStyles/globalStyles';
import Ionicons from '@expo/vector-icons/Ionicons';


const ProgressIndicator = ({ totalQuestions, numsDone, height, width }) => {
    const squareSize = Math.min(height * 0.18, width / totalQuestions);
    const gap = 2; // Gap between squares
  
    const renderSquares = () => {
      return Array(totalQuestions).fill().map((_, index) => (
        <View 
          key={index}
          style={{
            width: squareSize - gap,
            height: squareSize - gap,
            backgroundColor: index < numsDone ? 'green' : '#E0E0E0',
            marginRight: index < totalQuestions - 1 ? gap : 0,
          }}
        />
      ));
    };
  
    return (
      <View style={{ 
        flexDirection: 'row',
        alignItems: 'center',
        height: squareSize,
        width: width,
      }}>
        {renderSquares()}
      </View>
    );
  };

export default function Card({ index, title, id, height, width, pressHandler, item, imageSource }){
  
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
            onPress={() => pressHandler(id)}
        >
            {/* Image At the Front */}
            <Image 
                style={{
                    marginLeft: width * 0.05,
                    height: width * 0.1,
                    width: width * 0.1,
                    marginLeft: 10,
                    resizeMode: 'contain'
                }}
                source={typeof imageSource === 'string' ? { uri: imageSource } : imageSource}
            />

            {/* Bulk Info of Card */}
            <View
                style={{
                    height: height,
                    width: width * 0.65,

                    marginLeft: 20,

                    justifyContent: 'center',
                    alignItems: 'flex-start',
                }}
            >
                {/* Label Text for Topic */}
                <Text 
                    style={{ 
                        fontFamily: 'Baloo2-Regular',
                        fontSize: 20,
                    }}
                >
                    { title }
                </Text>
                
                {/* TODO  */}
                {/* Conditional rendering of ProgressIndicator */}
        {item && item.total_questions ? (
          <ProgressIndicator 
            totalQuestions={item.total_questions}
            numsDone={item.completed_questions}
            height={height}
            width={width}
          />
        ) : (
          <Text></Text>
        )}



                
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