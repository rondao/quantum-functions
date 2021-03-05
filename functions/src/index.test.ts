import * as firebaseFunctionTest from "firebase-functions-test";
import * as admin from "firebase-admin";
import * as request from "supertest";

firebaseFunctionTest({ projectId: "quantum-c5194" });

import { app } from "./index";
import { Class } from "../src/model/types";

const database = admin.firestore();

describe("Test /classes endpoint.", () => {
  test("Get all classes when empty.", async (done) => {
    const res = await request(app).get("/classes").expect(200);

    expect(res.body).toHaveLength(0);
    expect(res.body).toEqual([]);
    done();
  });

  describe("Test with pre-registered classes.", () => {
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

    test("Get all classes.", async (done) => {
      const res = await request(app).get("/classes").expect(200);

      expect(res.body).toHaveLength(testData.length);
      expect(res.body).toEqual(
        expect.arrayContaining(
          testData.map((data) => expect.objectContaining(data))
        )
      );
      done();
    });
  });
});

describe("Test /class endpoint.", () => {
  const testData: Class = {
    name: "Class 1",
    subject: "Subject 1",
    professor: "Professor 1",
  };
  const malformedTestData = {
    not_name: "Not Class 1",
    subject: "Subject 1",
  };

  test("Post a class.", async (done) => {
    const res = await request(app)
      .post("/class")
      .send(testData)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200);

    const id = RegExp("Class (?<id>\\w+) created successfully").exec(
      res.body.message
    )?.groups?.id;
    const dbData = await database.collection("classes").doc(id!).get();

    expect(testData).toEqual(expect.objectContaining(dbData.data()));
    done();
  });

  test("Post a malformed class.", async (done) => {
    await request(app)
      .post("/class")
      .send(malformedTestData)
      .expect(500)
      .expect({ error: "Something went wrong." });
    done();
  });
});

afterEach(async (done) => {
  const documents = await database.collection("classes").get();
  for (const doc of documents.docs) {
    await database.collection("classes").doc(doc.id).delete();
  }
  done();
});
