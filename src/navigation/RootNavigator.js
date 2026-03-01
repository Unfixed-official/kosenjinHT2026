import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainShellScreen from '../screens/MainShellScreen';
import ProjectDetailScreen from '../screens/ProjectDetailScreen';
import WorkspaceScreen from '../screens/WorkspaceScreen';
import LoginScreen from '../screens/LoginScreen';
import { useAuth } from '../state/AuthContext';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { user, initializing } = useAuth();

  if (initializing) {
    return null; // Or a splash screen
  }

  return (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#181b22' } }}>
      {!user ? (
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      ) : (
        <>
          <Stack.Screen name="Main" component={MainShellScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} options={{ title: 'Project' }} />
          <Stack.Screen name="Workspace" component={WorkspaceScreen} options={{ title: 'Workspace' }} />
        </>
      )}
    </Stack.Navigator>
  );
}
