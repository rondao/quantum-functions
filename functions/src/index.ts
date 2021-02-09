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

app.post("/signup", async (request, response) => {
  const newUser = request.body as Signup;

  try {
    const authData = await firebase
      .auth()
      .createUserWithEmailAndPassword(newUser.email, newUser.password);
    const authToken = await authData.user?.getIdToken();

    return response.status(201).json({ authToken });
  } catch (err) {
    console.error(err);

    response.status(err.code === "auth/email-already-in-use" ? 400 : 500);
    return response.json({ error: err.code });
  }
});

app.get("/classes", async (request, response) => {
  try {
    const queryData = await database.collection("classes").get();

    let classes = <Class[]>[];
    queryData.forEach((doc) => {
      classes.push({
        id: doc.id,
        ...(doc.data() as Class),
      });
    });

    return response.json(classes);
  } catch (err) {
    console.error(err);
    return response.status(500).json({ error: err });
  }
});

app.post("/class", async (request, response) => {
  const newClass: Class = {
    name: request.body.name,
    subject: request.body.subject,
    professor: request.body.professor,
  };

  try {
    const document = await database.collection("classes").add(newClass);
    return response.json({
      message: `Class ${document.id} created successfully`,
    });
  } catch (err) {
    console.error(err);
    return response.status(500).json({ error: "Something went wrong." });
  }
});

export const api = functions.region("southamerica-east1").https.onRequest(app);
