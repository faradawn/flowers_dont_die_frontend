import React from 'react';
import { Text, View, Image, ScrollView, TouchableOpacity } from 'react-native';

import { images, colors } from '../globalStyles/globalStyles';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function Card({ index, title, id, height, width, pressHandler, isDone = false }){
  
    return (
        <TouchableOpacity
            style={{
                height: height,
                width: width,
                marginVertical: height * 0.1,

                backgroundColor: isDone ? '#26D250': 'white',
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
                    height: height * 0.8,
                    width: width * 0.1,
                }}
                source={images.id[index+1]}
            />

            {/* Bulk Info of Card */}
            <View
                style={{
                    height: height,
                    width: width * 0.65,

                    marginLeft: width * 0.1,

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