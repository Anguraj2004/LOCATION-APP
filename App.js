import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Updated imports for the pages
import FetchLocation from './src/pages/FetchLocation';
import DisplayLocation from './src/pages/DisplayLocation';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="FetchLocation">
        <Stack.Screen name="FetchLocation" component={FetchLocation} />
        <Stack.Screen name="DisplayLocation" component={DisplayLocation} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
