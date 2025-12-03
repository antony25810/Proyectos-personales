import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/Auth/LoginScreen';
import SismosScreen from '../screens/Auth/SismosScreen';
import DebugScreen from '../screens/DebugScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import SismosMapScreen from '../screens/Auth/SismosMapScreen';
import SismoPropagationScreen from '../screens/Auth/SismoPropagationScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ title: 'Iniciar Sesión' }}
        />
        <Stack.Screen 
          name="Home" 
          component={SismosScreen} 
          options={{ title: 'Sismos Detectados' }}
        />
        <Stack.Screen
          name="Debug"
          component={DebugScreen}
          options={{ title: 'Debug' }}
        />
        <Stack.Screen 
          name="Register"
          component={RegisterScreen}
          options={{ title: 'Register' }}
        />
        <Stack.Screen
        name="SismosMap"
        component={SismosMapScreen}
        options={{ title: 'Mapa de Sismos' }}
      />
      <Stack.Screen
        name="SismoPropagation"
        component={SismoPropagationScreen}
        options={{ title: 'Propagación de Ondas' }}
      />
      </Stack.Navigator>
    </NavigationContainer>
  );
}