import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './HomeScreen';
import DayScreen from './DayScreen';
import ScheduleScreen from './ScheduleScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Emplois du temps' }}
        />
        <Stack.Screen
          name="DayScreen"
          component={DayScreen}
          options={{ title: 'Jours' }}
        />
        <Stack.Screen
          name="ScheduleScreen"
          component={ScheduleScreen}
          options={{ title: 'Événements' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
