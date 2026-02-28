import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainShellScreen from '../screens/MainShellScreen';
import ProjectDetailScreen from '../screens/ProjectDetailScreen';
import WorkspaceScreen from '../screens/WorkspaceScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#181b22' } }}>
      <Stack.Screen name="Main" component={MainShellScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} options={{ title: 'Project' }} />
      <Stack.Screen name="Workspace" component={WorkspaceScreen} options={{ title: 'Workspace' }} />
    </Stack.Navigator>
  );
}
