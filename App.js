/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Button,
  Alert,
  TextInput,
  StatusBar,
  Linking
} from "react-native";
import InAppBrowser from "react-native-inappbrowser-reborn";
import config from "./config.js";
import qs from "qs";

type Props = {
  navigation: string
};

type State = {
  url: string
};

function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

const fetchData = async (url: string, method: string) => {
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: "Basic " + base64Encoding(),
      "Content-Type": "application/x-www-form-urlencoded"
    }
  });
  console.log(res);
  return res;
};

const base64Encoding = () => {
  return btoa(config.client_id + ":" + config.client_secret);
};

export default class App extends Component<Props, State> {
  constructor(props: any) {
    super(props);

    this.state = {
      url:
        "https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=22DMN8&redirect_uri=myfitapp://demo/home/&scope=activity%20nutrition%20heartrate%20location%20nutrition%20profile%20settings%20sleep%20social%20weight"
    };
  }

  static navigationOptions = {
    title: "Home"
  };

  componentDidMount() {
    if (Platform.OS === "android") {
      Linking.getInitialURL().then(url => {
        console.log(url);
        const code = getParameterByName("code", url);
        console.log(code);
        const fetchAccessTokenUrl =
          "https://api.fitbit.com/oauth2/token?client_id=22DMN8&redirect_uri=myfitapp://demo/home&grant_type=authorization_code&code=" +
          code;
        console.log(fetchAccessTokenUrl);
        const data = fetchData(fetchAccessTokenUrl, "POST");
        console.log(data);
      });
    } else {
      Linking.addEventListener("url", this.handleOpenURL);
    }
  }

  componentWillUnmount() {}

  handleOpenURL = (event: any) => {
    this.navigate(event.url);
  };

  navigate = (url: string) => {
    const { navigate } = this.props.navigation;
    const route = url.replace(/.*?:\/\//g, "");
    const routeName = route.split("/")[0];

    if (routeName === "home") {
      navigate("Home");
    }
  };

  sleep(timeout) {
    return new Promise(resolve => setTimeout(resolve, timeout));
  }

  async openLink() {
    const { url } = this.state;
    try {
      if (await InAppBrowser.isAvailable()) {
        StatusBar.setBarStyle("light-content");
        const result = await InAppBrowser.open(url, {
          // iOS Properties
          dismissButtonStyle: "cancel",
          preferredBarTintColor: "#453AA4",
          preferredControlTintColor: "white",
          readerMode: false,
          // Android Properties
          showTitle: true,
          toolbarColor: "#6200EE",
          secondaryToolbarColor: "black",
          enableUrlBarHiding: true,
          enableDefaultShare: true,
          forceCloseOnRedirection: false,
          // Specify full animation resource identifier(package:anim/name)
          // or only resource name(in case of animation bundled with app).
          animations: {
            startEnter: "slide_in_right",
            startExit: "slide_out_left",
            endEnter: "slide_in_left",
            endExit: "slide_out_right"
          },
          headers: {
            "my-custom-header": "my custom header value"
          }
        });
        await this.sleep(800);
        Alert.alert("Response", JSON.stringify(result));
      } else Linking.openURL(url);
    } catch (error) {
      Alert.alert(error.message);
    }
  }

  getDeepLink(path: string = "") {
    const scheme = "myfitapp";
    const prefix =
      Platform.OS === "android" ? `${scheme}://demo/` : `${scheme}://`;
    return prefix + path;
  }

  async tryDeepLinking() {
    const redirectUrl = this.getDeepLink("home");

    const rediUrl =
      "https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=22DMN8&redirect_uri=myfitapp://demo/home&scope=activity%20nutrition%20heartrate%20location%20nutrition%20profile%20settings%20sleep%20social%20weight&prompt=login%20consent";

    try {
      if (await InAppBrowser.isAvailable()) {
        console.log(redirectUrl);
        InAppBrowser.openAuth(rediUrl, redirectUrl, {
          // iOS Properties
          dismissButtonStyle: "cancel",
          // Android Properties
          showTitle: false,
          enableUrlBarHiding: true,
          enableDefaultShare: true
        }).then(response => {
          console.log(response);
          if (response.type === "success" && response.url) {
            Linking.openURL(response.url);
          }
        });
      } else {
        Alert.alert("Error!!!");
      }
    } catch (error) {
      Alert.alert("Error, could not open custom tab");
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <Text style={styles.welcome}>{"Fitbt Auth"}</Text>
        <View style={styles.openButton}>
          <Button title="Open link" onPress={() => this.openLink()} />
        </View>
        <View style={styles.openButton}>
          <Button
            title="Open deep linking"
            onPress={() => this.tryDeepLinking()}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF"
  },
  welcome: {
    fontSize: 20,
    textAlign: "center",
    margin: 10
  },
  instructions: {
    textAlign: "center",
    color: "#333333",
    marginBottom: 5
  },
  openButton: {
    paddingTop: Platform.OS === "ios" ? 0 : 20,
    paddingBottom: Platform.OS === "ios" ? 0 : 20
  }
});
