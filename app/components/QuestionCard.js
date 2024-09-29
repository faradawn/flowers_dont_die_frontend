import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';

export default function Card({ text, width, height }) {
  const lightGreen = '#3c716f';
  const darkGreen = '#004643';
  return (
    <View style={
      [styles.card, 
      { width: width, 
        height: height, 
        backgroundColor : lightGreen,
      }
      ]
    }
    >
      <TouchableOpacity 
        activeOpacity={0.9}
        style={[styles.touchable, { padding: 0 }]}
      >
        <Text style={[
          styles.title,
          { color: 'white' }
        ]}>
          Answer
        </Text>
      </TouchableOpacity>
      <ScrollView 
        style={[styles.scrollView, {marginTop: 0}]}
        showsVerticalScrollIndicator={false}  
      >
        <Text style={styles.text}>{text}</Text>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 5,
    overflow: 'hidden',
    backgroundColor: '#3c716f',
  },
  touchable: {
    alignItems: 'center',
    padding: 3,
  },
  title: {
    fontFamily: 'Baloo2-Bold',
    fontSize: 40,
  },
  scrollView: {
    flex: 1,
    marginTop: 10,
  },
  text: {
    fontFamily: 'Baloo2-Regular',
    fontSize: 16,
    paddingHorizontal: 10,
    color: 'white',
  }
})