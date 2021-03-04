import * as firebaseFunctionTest from "firebase-functions-test";
import * as admin from "firebase-admin";
import * as request from "supertest";

firebaseFunctionTest({ projectId: "quantum-c5194" });

import { app } from "./index";
import { Class } from "../src/model/types";

const database = admin.firestore();

describe("Test /classes endpoint.", () => {
  const testData: Class[] = [
    {
      name: "Class 1",
      subject: "Subject 1",
      professor: "Professor 1",
    },
    {
      name: "Class 2",
      subject: "Subject 2",
      professor: "Professor 2",
    },
    {
      name: "Class 2",
      subject: "Subject 3",
      professor: "Professor 1",
    },
  ];

  beforeAll(async (done) => {
    for (const doc of testData) {
      await database.collection("classes").add(doc);
    }
    done();
  });

  test("Get all registered classes", async () => {
    const res = await request(app).get("/classes").expect(200);
    expect(res.body).toHaveLength(testData.length);
    expect(res.body).toEqual(
      expect.arrayContaining(
        testData.map((data) => expect.objectContaining(data))
      )
    );
  });

  afterAll(async (done) => {
    const documents = await database.collection("classes").get();
    for (const doc of documents.docs) {
      await database.collection("classes").doc(doc.id).delete();
    }
    done();
  });
});
