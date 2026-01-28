import { vexo } from 'vexo-analytics'; 
vexo('c8f54aa1-f820-46e7-a6ab-37344c4d8b83');
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <>
      <StatusBar style="auto" />
      <AppNavigator />
    </>
  );
}
