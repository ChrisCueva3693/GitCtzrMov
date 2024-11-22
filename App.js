import React from "react";
import { Text, View, StyleSheet, Image, Button } from "react-native";
import 'react-native-gesture-handler';

import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";

import Login from "./screens/Login";
import Home from "./screens/Home";
import CameraScr from "./screens/CameraScr";

export default function App() {
  const Stack = createStackNavigator();
  const Drawer = createDrawerNavigator();

  function MyStack() {
    return (
      <Stack.Navigator>
        <Stack.Screen 
          name="Login" 
          component={Login}
          options={{
            title: "Cotizer Movil",
            headerTintColor: "white",
            headerTitleAlign: "center",
            headerStyle: { backgroundColor: "darkorange" },
          }}
        />
        <Stack.Screen 
          name="Home" 
          component={HomeWithDrawer} // HomeWithDrawer solo aquí
          options={{ headerShown: false }} // Ocultar encabezado de Stack
        /> 
      </Stack.Navigator>
    );
  }

  function HomeWithDrawer() {
    return (
      <Drawer.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: "darkorange" },
          headerTintColor: "white",
          headerTitleAlign: "center",
          drawerPosition: "right",
        }}
      >
        <Drawer.Screen 
          name="Home" 
          component={Home} 
          options={{ 
            title: "Inicio",
            drawerLabel: "Inicio" 
          }} 
        />
        <Drawer.Screen 
          name="CameraScr" 
          component={CameraScr} 
          options={{ 
            title: "Escanear QR",
            drawerLabel: "Escanear QR" 
          }}
        />
      </Drawer.Navigator>
    );
  }

  return (
    <NavigationContainer>
      <MyStack/>      
    </NavigationContainer>
  );
}

const style = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "lavenderblush" },
  title: { fontSize: 30 },
  image: { height: 200, width: 200 },
});