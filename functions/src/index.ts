import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import firebase from "firebase";

import * as express from "express";

import { SignUp, SignIn, Class } from "../src/model/types";

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

export const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.post("/signup", async (request, response) => {
  const signUp = request.body as SignUp;

  try {
    const userCredentials = await firebase
      .auth()
      .createUserWithEmailAndPassword(signUp.email, signUp.password);
    const authToken = await userCredentials.user?.getIdToken();

    return response.status(201).json({ authToken });
  } catch (err) {
    console.error(err);

    response.status(err.code === "auth/internal-error" ? 500 : 400);
    return response.json({ error: err.code });
  }
});

app.post("/signin", async (request, response) => {
  const signIn = request.body as SignIn;

  try {
    const userCredentials = await firebase
      .auth()
      .signInWithEmailAndPassword(signIn.email, signIn.password);
    const authToken = await userCredentials.user?.getIdToken();

    return response.status(201).json({ authToken });
  } catch (err) {
    console.error(err);

    response.status(err.code === "auth/internal-error" ? 500 : 400);
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
