import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';
import PlantsScreen from '../screens/PlantsScreen';
import PlantDetailsScreen from '../screens/PlantDetailsScreen';
import CalendarScreen from '../screens/CalendarScreen';
import TasksScreen from '../screens/TasksScreen';
import PlantScannerScreen from '../screens/PlantScannerScreen';
import VoiceAssistantScreen from '../screens/VoiceAssistantScreen';
import HardwareScreen from '../screens/HardwareScreen';

import { useAuth } from '../hooks/useAuth';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function PlantStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="PlantsScreen" component={PlantsScreen} options={{ title: 'My Plants' }} />
      <Stack.Screen name="PlantDetails" component={PlantDetailsScreen} options={{ title: 'Plant Details' }} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Plants" component={PlantStack} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Tasks" component={TasksScreen} />
      <Tab.Screen name="Scanner" component={PlantScannerScreen} />
      <Tab.Screen name="Voice" component={VoiceAssistantScreen} />
      <Tab.Screen name="Hardware" component={HardwareScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <Stack.Screen name="Main" component={MainTabs} />
      ) : (
        <Stack.Screen name="Auth" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
}
