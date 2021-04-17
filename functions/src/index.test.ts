import * as firebaseFunctionTest from "firebase-functions-test";
import * as admin from "firebase-admin";
import * as request from "supertest";
import firebase from "firebase";

firebaseFunctionTest({ projectId: "quantum-c5194" });

import { app } from "./index";
import { Class, Professor, SignIn, SignUp } from "../src/model/types";

const database = admin.firestore();
firebase.auth().useEmulator("http://localhost:9099");

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

  afterEach(async (done) => {
    const documents = await database.collection("classes").get();
    for (const doc of documents.docs) {
      await database.collection("classes").doc(doc.id).delete();
    }
    done();
  });

  test("Given classes are registered, when Get the endpoint, expect all classes.", async (done) => {
    const res = await request(app).get("/classes").expect(200);

    expect(res.body).toHaveLength(testData.length);
    expect(res.body).toEqual(
      expect.arrayContaining(
        testData.map((data) => expect.objectContaining(data))
      )
    );
    done();
  });

  test("Given no classes are registered, when Get the endpoint, expect empty array.", async (done) => {
    const res = await request(app).get("/classes").expect(200);

    expect(res.body).toHaveLength(0);
    expect(res.body).toEqual([]);
    done();
  });

  test("When Post the endpoint, expect code 404", async (done) => {
    await request(app).post("/classes").expect(404);
    done();
  });
});

describe("Test /class endpoint.", () => {
  const classData: Class = {
    name: "Class 1",
    subject: "Subject 1",
    professor: "Professor 1",
  };
  const malformedData = {
    not_name: "Not Class 1",
    subject: "Subject 1",
  };

  test("When Post Class data, expect registration id.", async (done) => {
    const res = await request(app)
      .post("/class")
      .send(classData)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200);

    const id = RegExp("Class (?<id>\\w+) created successfully").exec(
      res.body.message
    )?.groups?.id;
    const dbData = await database.collection("classes").doc(id!).get();

    expect(classData).toEqual(expect.objectContaining(dbData.data()));
    done();
  });

  test("When Post malformed Class data, expect code 500.", async (done) => {
    await request(app)
      .post("/class")
      .send(malformedData)
      .expect(500)
      .expect({ error: "Something went wrong." });
    done();
  });

  test("When Post empty data, expect code 500.", async (done) => {
    await request(app)
      .post("/class")
      .send({})
      .expect(500)
      .expect({ error: "Something went wrong." });
    done();
  });

  test("When Get the endpoint, expect code 404.", async (done) => {
    await request(app).get("/class").expect(404);
    done();
  });
});

describe("Test /professors endpoint.", () => {
  const testData: Professor[] = [
    {
      name: "Professor 1",
      bio: "Bio 1",
    },
    {
      name: "Professor 2",
      bio: "Bio 2",
    },
    {
      name: "Professor 3",
      bio: "Bio 3",
    },
  ];

  beforeAll(async (done) => {
    for (const doc of testData) {
      await database.collection("professors").add(doc);
    }
    done();
  });

  afterEach(async (done) => {
    const documents = await database.collection("professors").get();
    for (const doc of documents.docs) {
      await database.collection("professors").doc(doc.id).delete();
    }
    done();
  });

  test("Given professors are registered, when Get the endpoint, expect all professors.", async (done) => {
    const res = await request(app).get("/professors").expect(200);

    expect(res.body).toHaveLength(testData.length);
    expect(res.body).toEqual(
      expect.arrayContaining(
        testData.map((data) => expect.objectContaining(data))
      )
    );
    done();
  });

  test("Given no professors are registered, when Get the endpoint, expect empty array.", async (done) => {
    const res = await request(app).get("/professors").expect(200);

    expect(res.body).toHaveLength(0);
    expect(res.body).toEqual([]);
    done();
  });

  test("When Post the endpoint, expect code 404", async (done) => {
    await request(app).post("/professors").expect(404);
    done();
  });
});

describe("Test /professor endpoint.", () => {
  const professorData: Professor = {
    name: "Professor 1",
    bio: "Bio 1",
  };
  const malformedData = {
    not_name: "Not Professor 1",
    bio: "Bio 1",
  };

  test("When Post Professor data, expect registration id.", async (done) => {
    const res = await request(app)
      .post("/professor")
      .send(professorData)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200);

    const id = RegExp("Professor (?<id>\\w+) created successfully").exec(
      res.body.message
    )?.groups?.id;
    const dbData = await database.collection("professors").doc(id!).get();

    expect(professorData).toEqual(expect.objectContaining(dbData.data()));
    done();
  });

  test("When Post malformed Professor data, expect code 500.", async (done) => {
    await request(app)
      .post("/professor")
      .send(malformedData)
      .expect(500)
      .expect({ error: "Something went wrong." });
    done();
  });

  test("When Post empty data, expect code 500.", async (done) => {
    await request(app)
      .post("/professor")
      .send({})
      .expect(500)
      .expect({ error: "Something went wrong." });
    done();
  });

  test("When Get the endpoint, expect code 404.", async (done) => {
    await request(app).get("/professor").expect(404);
    done();
  });
});

describe("Test /signup endpoint.", () => {
  const newAccountData: SignUp = {
    email: "new_account@test.com",
    password: "password",
    name: "name",
  };
  const existingAccountData: SignUp = {
    email: "existing_account@test.com",
    password: "password",
    name: "name",
  };

  beforeAll(async (done) => {
    await firebase
      .auth()
      .createUserWithEmailAndPassword(
        existingAccountData.email,
        existingAccountData.password
      );
    done();
  });

  test("When Post SignUp data, expect authToken returned.", async (done) => {
    const res = await request(app)
      .post("/signup")
      .send(newAccountData)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(201);

    expect(res.body).toHaveProperty("authToken");
    done();
  });

  test("Given an email account is already registered, when Post same email data, expect code 400.", async (done) => {
    await request(app)
      .post("/signup")
      .send(existingAccountData)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(400)
      .expect({ error: "auth/email-already-in-use" });
    done();
  });

  test("When Get the endpoint, expect code 404.", async (done) => {
    await request(app).get("/class").expect(404);
    done();
  });

  afterAll(async (done) => {
    const users = [
      await admin.auth().getUserByEmail(newAccountData.email),
      await admin.auth().getUserByEmail(existingAccountData.email),
    ];
    await admin.auth().deleteUsers(users.map((user) => user.uid));
    done();
  });
});

describe("Test /signup endpoint.", () => {
  const existingAccountData: SignIn = {
    email: "existing_account@test.com",
    password: "password",
  };

  beforeAll(async (done) => {
    await firebase
      .auth()
      .createUserWithEmailAndPassword(
        existingAccountData.email,
        existingAccountData.password
      );
    done();
  });

  test("Given an existing account, when Post correct SignIn data, expect authToken.", async (done) => {
    const res = await request(app)
      .post("/signin")
      .send(existingAccountData)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(201);

    expect(res.body).toHaveProperty("authToken");
    done();
  });

  test("Given an existing account, when Post incorrect password, expect error 400.", async (done) => {
    const incorrectPasswordData: SignIn = {
      ...existingAccountData,
      password: "Incorrect Password",
    };

    await request(app)
      .post("/signin")
      .send(incorrectPasswordData)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(400)
      .expect({ error: "auth/wrong-password" });
    done();
  });

  test("When Get the endpoint, expect code 404.", async (done) => {
    await request(app).get("/class").expect(404);
    done();
  });

  afterAll(async (done) => {
    const users = [
      await admin.auth().getUserByEmail(existingAccountData.email),
    ];
    await admin.auth().deleteUsers(users.map((user) => user.uid));
    done();
  });
});
