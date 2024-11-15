import React from "react";
import { Text, View, StyleSheet ,Image,Button} from "react-native";
import 'react-native-gesture-handler';

import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import Login from "./screens/Login";
import Home from "./screens/Home";

export default function App(){

  const Stack = createStackNavigator();
  function MyStack(){
    return(
      <Stack.Navigator>
        <Stack.Screen name="Login" component={Login}
        options={
          {
            title:"LOGIN",
            headerTintColor:"white",
            headerTitleAlign:"center",
            headerStyle:{backgroundColor:"darkorange"},
          }}/>
        <Stack.Screen name="Home" component={Home}
        options={
          {
            title:"Bienvenido",
            headerTintColor:"white",
            headerTitleAlign:"center",
            headerStyle:{backgroundColor:"darkorange"},
          }} />       
      </Stack.Navigator>
    );
  }

  return(
    <NavigationContainer>
      <MyStack/>
    </NavigationContainer>
  );
}

const style = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "lavenderblush" },
  title: { fontSize: 30 },
  image:{height:200,width:200},
});

