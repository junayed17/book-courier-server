const express = require("express");
const app = express();
require("dotenv").config();
var cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const port = process.env.PORT;
const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.PASS_WORD}@cluster0.vdcsgkx.mongodb.net/?appName=Cluster0`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// middlewares

app.use(cors());
app.use(express.json());

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
    const database = client.db("BookCourier");
    const Books = database.collection("books");

 

    app.get("/", (req, res) => {
      res.send("database is running");
    });
    app.listen(port, () => {
      console.log(`i am running in ${port}`);
    });
  } finally {
  }
}
run().catch(console.dir);
