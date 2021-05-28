// @refreshe state
import { StatusBar } from 'expo-status-bar';
import React, {useState, useEffect, useCallback} from 'react';
import { StyleSheet, Text, View, LogBox, TextInput, Button } from 'react-native';
import * as firebase from 'firebase'
import {GiftedChat} from 'react-native-gifted-chat';
import 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage'
//firebase config

const firebaseConfig = {
  apiKey: "AIzaSyCvQY9RfWJw408fS80PVZ5GvHzOwuc0N4Y",
  authDomain: "chatapp-fee75.firebaseapp.com",
  projectId: "chatapp-fee75",
  storageBucket: "chatapp-fee75.appspot.com",
  messagingSenderId: "747022571903",
  appId: "1:747022571903:web:01a9a25ed94d769791224a"
};
// Initialize Firebase


if(firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
}


LogBox.ignoreLogs(['setting a timer for a long period of time'])

const db = firebase.firestore()
const chatsRef = db.collection('chats')

export default function App() {



const [user, setUser] = useState(null);
const [name, setName] = useState('');
const [messages, setMessages] = useState([])

useEffect(() => {
  readUser()
  const unsubscribe = chatsRef.onSnapshot((querySnapshot) => {
      const messagesFirestore = querySnapshot
          .docChanges()
          .filter(({ type }) => type === 'added')
          .map(({ doc }) => {
              const message = doc.data()
              //createdAt is firebase.firestore.Timestamp instance
              //https://firebase.google.com/docs/reference/js/firebase.firestore.Timestamp
              return { ...message, createdAt: message.createdAt.toDate() }
          })
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      appendMessages(messagesFirestore)
  })
  return () => unsubscribe()
}, [])

const appendMessages = useCallback(
  (messages) => {
      setMessages((previousMessages) => GiftedChat.append(previousMessages, messages))
  },
  [messages]
)

const readUser = async() => {
  const user = await AsyncStorage.getItem('user');
  if(user) {
    setUser(JSON.parse(user))
  }
  
}

const handlePress = async() => {
  const _id = Math.random().toString(36).substring(7)
  const user = { _id, name }
  await AsyncStorage.setItem('user', JSON.stringify(user))
  setUser(user)
}

const handleSend = async(messages) => {
  const writes = messages.map((m) => chatsRef.add(m))
  await Promise.all(writes)
}

if(!user) {
  return <View style={styles.container}>
  <TextInput onChangeText={setName} value={name} style={styles.input} placeholder="Please enter your name" />
  <Button onPress={handlePress} title='Enter the chat' />
  </View>
}

  return <GiftedChat messages={messages} user={user} onSend={handleSend} />
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding:30,
  },
  input :{
    height:50,
    width:'100%',
    borderWidth:1,
    padding:15,
    borderColor:'gray',
    marginBottom:20,
  }
});
