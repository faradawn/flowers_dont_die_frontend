import React from 'react';
import { Text, TouchableOpacity, ScrollView, Platform } from 'react-native';

export default function Card({ isSelected, option, text, width, height, isCardSubmitted, isCardCorrectAnswer }) {
  return (
    <>
      {Platform.OS === 'web' && (
        <style>{`
          .scrollbar::-webkit-scrollbar {
            width: 8px;
          }

          .scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }

          .scrollbar::-webkit-scrollbar-thumb {
            background-color: rgba(255, 255, 255, 0.5);
            border-radius: 10px;
          }

          .scrollbar::-webkit-scrollbar-thumb:hover {
            background-color: rgba(255, 255, 255, 0.7);
          }
        `}</style>
      )}

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
      <ScrollView 
        style = {{
          maxHeight: height*0.7,
          paddingVertical: 10,
        }}
        className="scrollbar">
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
      </ScrollView>
    </TouchableOpacity>
    </>
  );
}
