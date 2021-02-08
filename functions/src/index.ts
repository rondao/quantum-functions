import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

import { Class } from "../src/model/types";

admin.initializeApp();

export const getClasses = functions.https.onRequest((request, response) => {
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

export const createClasses = functions.https.onRequest((request, response) => {
  switch (request.method) {
    case "POST":
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
      break;

    default:
      response.status(400).json({ error: "Method not allowed. " });
      break;
  }
});
