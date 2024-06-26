import React, { useState } from 'react';
import { StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';

export default function Card(
    { handlePress, currentPressed, option, text, width, height } 
){
    return (
        <TouchableWithoutFeedback
            onPressIn={ () => handlePress(option) }
        >
            <View 
                style = { [ 
                    { 
                        width: width, 
                        height: height,
                        marginRight: 0.1 * width,
                        backgroundColor: currentPressed == option ? '#004643' : '#3c716f',
                    }, 
                    styles.card 
                ] }
            >
                <Text style = { styles.title }> { option } </Text>
                <Text style = { styles.text }>{text}</Text>
            </View>
        </TouchableWithoutFeedback>
    )
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 20,
        padding: 5,
    },
    title: {
        alignSelf: 'center',
        fontFamily: 'Baloo2-Bold',
        fontSize: 40,
        color: 'white',
    },
    text: {
        fontFamily: 'Baloo2-Regular',
        fontSize: 16,
        paddingHorizontal: 10,
        color: 'white',
    }
})

