import React from 'react';
import { Text, View, Image, ScrollView, TouchableOpacity } from 'react-native';

import { colors } from '../globalStyles/globalStyles';
import Ionicons from '@expo/vector-icons/Ionicons';


const ProgressIndicator = ({ totalQuestions, numsDone, height, width }) => {
  const progress = totalQuestions > 0 ? (numsDone / totalQuestions) * 100 : 0;
  const barWidth = width * 0.5; // Adjust this value to change the progress bar width

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', width: width * 0.6 }}>
      <View style={{
        width: barWidth,
        height: 8,
        backgroundColor: '#E0E0E0',
        borderRadius: 4,
        overflow: 'hidden',
      }}>
        <View style={{
          width: `${progress}%`,
          height: '100%',
          backgroundColor: 'black',
          borderRadius: 4,
        }} />
      </View>
      <Text style={{
        marginLeft: 10,
        fontFamily: 'Baloo2-Regular',
        fontSize: 14,
        color: colors.textSecondary,
      }}>
        {`${Math.round(progress)}%`}
      </Text>
    </View>
  );
};

export default function Card({ index, title, id, height, width, pressHandler, item, imageSource, logoUrl }){
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
                    height: height * 0.7,
                    width: height * 0.7,
                    marginLeft: 10,
                    resizeMode: 'contain'
                }}
                source={
                    logoUrl 
                        ? { uri: logoUrl }
                        : (typeof imageSource === 'string' ? { uri: imageSource } : imageSource)
                }
                defaultSource={typeof imageSource === 'string' ? { uri: imageSource } : imageSource}
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
        {item && item.num_total_questions ? (
          <ProgressIndicator 
            totalQuestions={item.num_total_questions}
            numsDone={item.num_completed_questions}
            height={height}
            width={width}
          />
        ) : null}
        



                
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
