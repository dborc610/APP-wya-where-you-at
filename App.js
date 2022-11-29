import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomePage from './WYA-app/HomePage';
import Signin from './WYA-app/Signin';
import SignUpPage from './WYA-app/SignUpPage';
import { StyleSheet, Text, View, Platform } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import {Provider as AuthProvider} from './context/AuthContext.js';
import {Context as AuthContext} from './context/AuthContext';

import Friendlist from './WYA-app/FriendlistPage';
import ClassesPage from './WYA-app/ClassesPage';
import StartPage from './WYA-app/StartPage';
import AddClassesPage from './WYA-app/AddClassesPage';

import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const AuthStack = createNativeStackNavigator();
function authFlow() {
  return (
    <AuthStack.Navigator>
      <AuthStack.Screen
        options={{headerShown: false}}
        name="Signin"
        component={Signin}
      />
      <AuthStack.Screen
        options={{headerShown: false}}
        name="Signup"
        component={SignUpPage}
      />
    </AuthStack.Navigator>
  );
}


const Stack = createNativeStackNavigator();
function App() {

  const {state} = React.useContext(AuthContext);
  console.log(state); 
  
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

    // This listener is fired whenever a notification is received while the app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    // This listener is fired whenever a user taps on or interacts with a notification (works when app is foregrounded, backgrounded, or killed)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {state.token === null ? (
          <>
            <Stack.Screen
              name="Auth"
              component={authFlow}
            />
          </>
        ) : (
          <Stack.Screen
            name="Home"
            component={HomePage}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default () => {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
};



const styles = StyleSheet.create({

  containter: {
    flex: 1,
    height: 400,
    width: 370,
    borderRadius: 10,
    alignContent: 'center',

    alignItems: 'center',
    justifyContent: 'center',
  },
  ScrollContainer: {
    borderRadius: 10,
    backgroundColor: '#FFCF99',
  },
  titleText: {
    fontSize: 50,
    color: "black",
  },
  buttons: {

    backgroundColor: '#6d91d9',

    borderRadius: 30,
    height: 50,
    width: 200,
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    fontSize: 20,
    color: "white",
    setButtonText: "white",
    fontWeight: "bold",
  },
  inputField: {

    fontSize: 20,
    fontWeight: "bold",
    backgroundColor: "white",

    borderRadius: 10,
    height: 50,
    width: 350,
    marginBottom: 30,
    paddingLeft: 20,
    alignContent: 'center',
  },
  text: {
    fontSize: 15,
  },
  text2: {
    fontSize: 15,
    color: "#6d91d9",
  },
  textGroup: {
    flexDirection: 'row',
    marginBottom: 40,
  },
  titleGroup: {
    paddingBottom: 40,
    alignItems: 'center',
  }
}
)
async function sendPushNotification(expoPushToken) {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: 'Boop',
    body: 'Hehe Boop',
    data: { someData: 'Dummy Data' },
  };

  await fetch('http://localhost/boop/ExponentPushToken[cCxGVTMrNm3e7TB8qa3OBa]', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
}

async function registerForPushNotificationsAsync() {
  let token;
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log(token);
  } else {
    alert('Must use physical device for Push Notifications');
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}