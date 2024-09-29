import React from 'react';
import { Text, View, TouchableOpacity, Dimensions} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const height = Dimensions.get('screen').height;
const width = Dimensions.get('screen').width;

export default function Card({ index, id, title, num_stars, pressHandler }) {
    const renderStars = () => {
        if (!num_stars || num_stars <= 0) {
          return null;
        }
        return [...Array(num_stars)].map((_, index) => (
          <FontAwesome key={index} name="star" size={18} color="#26C250" style={{ marginLeft: 2 }} />
        ));
      };

  return (
    <TouchableOpacity 
      style={{
        height: height * 0.08,
        width: width * 0.8,
        backgroundColor: 'white',
        borderRadius: 10,
        marginVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        paddingTop: 12,
        paddingHorizontal: 15,
      }} 
      onPress={() => pressHandler(id)}
    >

        {/* Top problem number */}
      <View style={{
        marginBottom: 5
        
      }}>
        <Text style={{
          fontSize: 12,
          color: '#666',
        }}>Problem {index}</Text>
      </View>

        {/* Bottom left and right view */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        
      }}>
        {/* left text */}
        <Text 
          style={{
            fontSize: 16,
            fontWeight: 'bold',
            flex: 1,
            marginRight: 8,
          }} 
          numberOfLines={1} 
          ellipsizeMode="tail"
        >
          {title}
        </Text>

        {/* right stars */}
        <View style={{ flexDirection: 'row' }}>
          {renderStars()}
        </View>
      </View>
    </TouchableOpacity>
  );
}