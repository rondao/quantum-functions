import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

import * as express from "express";

import { Class } from "../src/model/types";

admin.initializeApp();
const app = express();

app.get("/classes", (request, response) => {
  admin
    .firestore()
    .collection("classes")
    .get()
    .then((data) => {
      let classes = <Class[]>[];
      data.forEach((doc) => {
        classes.push(doc.data() as Class);
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

  admin
    .firestore()
    .collection("classes")
    .add(newClass)
    .then((doc) => {
      response.json({ message: `Class ${doc.id} created successfully` });
    })
    .catch((err) => {
      console.error(err);
      response.status(500).json({ error: "Something went wrong." });
    });
});

export const api = functions.https.onRequest(app);
