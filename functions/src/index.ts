import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import firebase from "firebase";

import * as express from "express";

import { Class, Signup } from "../src/model/types";

admin.initializeApp();
firebase.initializeApp({
  apiKey: "AIzaSyDSkARToMknYJSbmO_E-rYbIwOCVyqef3o",
  authDomain: "quantum-c5194.firebaseapp.com",
  databaseURL: "https://quantum-c5194-default-rtdb.firebaseio.com",
  projectId: "quantum-c5194",
  storageBucket: "quantum-c5194.appspot.com",
  messagingSenderId: "506943089189",
  appId: "1:506943089189:web:d2ff41135fa7d6a5526dcc",
  measurementId: "G-5TEV0K2FSD",
});

const database = admin.firestore();
const app = express();

app.post("/signup", (request, response) => {
  const newUser = request.body as Signup;
  firebase
    .auth()
    .createUserWithEmailAndPassword(newUser.email, newUser.password)
    .then((data) => {
      return response
        .status(201)
        .json({ message: `User ${data.user?.uid} signed up successfully` });
    })
    .catch((err) => {
      console.error(err);
      return response.status(500).json({ error: err.code });
    });
});

app.get("/classes", (request, response) => {
  database
    .collection("classes")
    .get()
    .then((data) => {
      let classes = <Class[]>[];
      data.forEach((doc) => {
        classes.push({
          id: doc.id,
          ...(doc.data() as Class),
        });
      });
      return response.json(classes);
    })
    .catch((err) => console.error(err));
});

app.post("/class", (request, response) => {
  const newClass: Class = {
    name: request.body.name,
    subject: request.body.subject,
    professor: request.body.professor,
  };

  database
    .collection("classes")
    .add(newClass)
    .then((doc) => {
      return response.json({ message: `Class ${doc.id} created successfully` });
    })
    .catch((err) => {
      console.error(err);
      return response.status(500).json({ error: "Something went wrong." });
    });
});

export const api = functions.region("southamerica-east1").https.onRequest(app);
