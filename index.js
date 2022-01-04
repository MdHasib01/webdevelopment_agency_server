const express = require("express");
const app = express();
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const { MongoClient, Admin } = require("mongodb");
const port = process.env.PORT || 5000;

const fileUpload = require("express-fileupload");

// Middlewear
app.use(cors());
app.use(express.json());
app.use(fileUpload());
app.use(express.json({ limit: "50mb" }));

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tdvhb.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
// console.log(uri)
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("Web_development_agency");
    const userCollection = database.collection("users");
    const jobsCollection = database.collection("jobs");
    const sellerProfileCollection = database.collection("sellerProfile");
    const buyerProfileCollection = database.collection("buyerProfile");
    // const reviewsCollection = database.collection('reviews');
    // const ordersCollection = database.collection('orders');

    // Post Jobs
    app.post("/jobs", async (req, res) => {
      const jobs = req.body;
      const result = await jobsCollection.insertOne(jobs);
      res.json(result);
    });

    // Get Jobs
    app.get("/jobs", async (req, res) => {
      const search = req.query.type;
      const cursor = jobsCollection.find({});
      const jobs = await cursor.toArray();
      if (search) {
        const searchResult = jobs.filter((job) =>
          job.type.toLocaleLowerCase().includes(search)
        );
        res.send(searchResult);
      } else {
        res.send(jobs);
      }
    });

    app.get("/jobs", async (req, res) => {
      const cursor = jobsCollection.find({});
      const jobs = await cursor.toArray();
      res.json(jobs);
    });

    app.get("/jobs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await jobsCollection.findOne(query);
      res.json(result);
    });

    // Post seller
    app.post("/sellerProfile", async (req, res) => {
      const name = req.body.name;
      const email = req.body.email;
      const country = req.body.country;
      const speciality = req.body.speciality;
      const about = req.body.about;
      const demosite = req.body.demosite;
      const picOne = req.files.profilepic;
      const picDataOne = picOne.data;
      const encodedPicOne = picDataOne.toString("base64");
      const imageBufferOne = Buffer.from(encodedPicOne, "base64");
      const picTwo = req.files.gigone;
      const picDataTwo = picTwo.data;
      const encodedPicTwo = picDataTwo.toString("base64");
      const imageBufferTwo = Buffer.from(encodedPicTwo, "base64");

      const seller = {
        name,
        email,
        country,
        speciality,
        about,
        demosite,
        profilePic: imageBufferOne,
        gigone: imageBufferTwo,
      };
      const result = await sellerProfileCollection.insertOne(seller);
      res.json(result);
    });

    // Get seller

    app.get("/sellerProfile", async (req, res) => {
      const search = req.query.speciality;
      const cursor = sellerProfileCollection.find({});
      const sellers = await cursor.toArray();
      if (search) {
        const searchResult = sellers.filter((seller) =>
          seller.speciality.toLocaleLowerCase().includes(search)
        );
        res.send(searchResult);
      } else {
        res.send(sellers);
      }
    });

    app.get("/sellerProfile", async (req, res) => {
      const cursor = sellerProfileCollection.find({});
      const seller = await cursor.toArray();
      res.json(seller);
    });

    // get seller using id
    app.get("/sellerProfile/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await sellerProfileCollection.findOne(query);
      res.json(result);
    });

    app.put("/sellerProfile/:id", async (req, res) => {
      const id = req.params.id;
      const updateSller = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          name: updateSller.name,
          country: updateSller.country,
          speciality: updateSller.speciality,
          about: updateSller.about,
          demosite: updateSller.demosite,
        },
      };
      const result = await sellerProfileCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      // console.log('updating', id)
      res.json(result);
    });

    // Post Buyer Profile

    app.post("/buyerProfile", async (req, res) => {
      const name = req.body.name;
      const email = req.body.email;
      const country = req.body.country;
      const about = req.body.about;
      const picOne = req.files.profilepic;
      const picDataOne = picOne.data;
      const encodedPicOne = picDataOne.toString("base64");
      const imageBufferOne = Buffer.from(encodedPicOne, "base64");

      const buyer = {
        name,
        email,
        country,
        about,
        profilePic: imageBufferOne,
      };
      const result = await buyerProfileCollection.insertOne(buyer);
      res.json(result);
    });

    // Get Buyer Profile
    app.get("/buyerProfile", async (req, res) => {
      const cursor = buyerProfileCollection.find({});
      const buyer = await cursor.toArray();
      res.json(buyer);
    });

    // Users

    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.json(result);
      console.log(result);
    });

    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      res.json(result);
    });

    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);

      res.json(user);
    });

    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.json(result);
    });

    app.put("/users/block", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "block" } };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Welcome to Web development agency");
});

app.listen(port, () => {
  console.log(` listening ${port}`);
});
