import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

export default function Card({ isSelected, option, text, width, height, isCardSubmitted, isCardCorrectAnswer }) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={{
        borderRadius: 20,
        padding: 5,
        overflow: 'hidden',
        backgroundColor: isCardSubmitted
          ? isCardCorrectAnswer
            ? '#65c465'
            : '#004643'
          : isSelected
          ? '#004643'
          : '#3c716f',
        width: width,
        height: height,
        marginRight: 0.1 * width,
        alignItems: 'center',
      }}
    >
      <Text
        style={{
          fontFamily: 'Baloo2-Bold',
          fontSize: 40,
          color: 'white',
        }}
      >
        {option}
      </Text>
      <Text
        style={{
          flex: 1,
          fontFamily: 'Baloo2-Regular',
          fontSize: 16,
          paddingHorizontal: 10,
          color: 'white',
          marginTop: 10,
        }}
      >
        {text}
      </Text>
    </TouchableOpacity>
  );
}
