import React from "react";
import { AppRegistry, Text } from "react-native";
import { createStackNavigator, createAppContainer } from "react-navigation";
import App from "./App";
import { Platform } from "react-native";

const Router = createStackNavigator(
  {
    Home: { screen: App }
  },
  {
    initialRouteName: "Home"
  }
);

const prefix = Platform.OS == "android" ? "myapp://" : "myapp://";
const AppRoutes = createAppContainer(Router);
const MainApp = () => <AppRoutes uriPrefix={prefix} />;
export default MainApp;
