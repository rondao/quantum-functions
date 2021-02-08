import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

import { Class } from "../src/model/types";

admin.initializeApp();

export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", { structuredData: true });
  response.send("Hello from Firebase!");
});

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
