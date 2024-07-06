import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';

export default function Card({ handlePress, currentPressed, option, text, width, height }) {
  return (
    <View style={[styles.card, { width, height, marginRight: 0.1 * width }]}>
      <TouchableOpacity 
        onPress={() => handlePress(option)} 
        style={styles.touchable}
      >
        <Text style={[
          styles.title,
          { color: currentPressed == option ? '#004643' : 'white' }
        ]}>
          {option}
        </Text>
      </TouchableOpacity>
      <ScrollView style={styles.scrollView}>
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