import React from 'react';
import { Text, View, Image, ScrollView, TouchableOpacity } from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';
import { AntDesign } from '@expo/vector-icons';

const ProgressIndicator = ({ totalQuestions, numsDone }) => {
  const stars = [];
  for (let i = 0; i < totalQuestions; i++) {
    if (i < numsDone) {
      stars.push(<AntDesign key={i} name={'star'} size={16} color={'#54A09F'} style={{paddingRight: 3}}/>);
    }
    else {
      stars.push(<AntDesign key={i} name={'staro'} size={16} color={'#8C9391'} style={{paddingRight: 3}}/>)
    }
  }
  
  return (
    <View style={{ flexDirection: 'row' }}>
      {stars}
    </View>
  );
};

export default function Card({ index, title, id, height, width, borderWidth, pressHandler, item, imageSource, logoUrl, }){
    return (
        <TouchableOpacity
            style={{
                height: height,
                width: width,
                marginVertical: height * 0.1,

                backgroundColor: "white",
                borderColor: '#4B7C7B',
                borderWidth: borderWidth,
                borderRadius: 10,
                shadowColor: '#4B7C7B',
                shadowOffset: { height: 1, width: 1 },
                shadowOpacity: 0.8 * borderWidth,
                shadowRadius: 5,
                elevation: 2, // for Android shadow

                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
            }}
            onPress={() => pressHandler(id)}
        >
            {/* Image At the Front */}
            <View
              style={{
                  width: width * 0.11,
                  height: width * 0.11,
                  borderRadius: width * 0.11,
                  backgroundColor: '#54A09F1A',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginLeft: 20
              }}
            >
              <Image
                  style={{
                      height: '150%', // Image fills the circle
                      resizeMode: 'contain',
                      position: 'absolute',
                  }}
                  source={logoUrl ? { uri: logoUrl } : typeof imageSource === 'string' ? { uri: imageSource } : imageSource}
                  defaultSource={typeof imageSource === 'string' ? { uri: imageSource } : imageSource}
              />
            </View>

            {/* Bulk Info of Card */}
            <View
                style={{
                    height: height,
                    width: width * 0.45,

                    marginLeft: 14,

                    justifyContent: 'center',
                    alignItems: 'flex-start',
                }}
            >
                {/* Label Text for Topic */}
                <Text 
                    style={{ 
                        fontFamily: 'Nunito-Regular',
                        fontSize: 18,
                        lineHeight: 20,
                    }}
                    numberOfLines={2} 
                    adjustsFontSizeToFit
                >
                    { title }
                </Text>                
                <ProgressIndicator totalQuestions={item.total_questions} numsDone={item.completed_questions}/>
            </View>

            {/* End Icon */}
            <View style = {{ 
              height: height,
              borderRadius: 10,
              right: 3,
              overflow: 'hidden', 
              alignItems: 'flex-end',
            }}>
              <View
                  style={{
                      height: height * 1.5,
                      width: height * 1.5,
                      borderRadius: height * 1.5,
                      backgroundColor: '#4B7C7B',
                      justifyContent: 'center',
                      position: 'relative',
                      right: -38,
                      top: -19,
                      flexDirection: 'row',
                  }}
              >
                <Text
                  style={{
                    position: 'absolute',
                    right: item.completed_questions !== item.total_questions ? (item.completed_questions > 0 ? 54 : 67) : 63,
                    top: 45,
                    color: '#FAFFFD',
                    fontFamily: 'Nunito-Regular',
                    fontSize: 14,
                  }}>
                  { item.completed_questions !== item.total_questions ? (item.completed_questions > 0 ? 'Continue' : 'Start') : 'Done!' }
                </Text>
                <Ionicons 
                  size={22}
                  name={ item.completed_questions !== item.total_questions ? 'arrow-forward-outline' : 'checkmark-outline' }
                  style={{
                    position: 'absolute',
                    right: 70,
                    top: 65,
                    color: '#FAFFFD',
                  }}
                />
              </View>
            </View>
        </TouchableOpacity>
    );
}
