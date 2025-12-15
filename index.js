const express = require("express");
const app = express();
require("dotenv").config();
var cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
    const Users = database.collection("users");
    const wishList = database.collection("wishList");

    // user api
    app.post("/user", async (req, res) => {
      const userData = req.body;
      userData.role = "user";

      const isExist = await Users.findOne({ email: userData.email });
      if (!isExist) {
        try {
          const result = await Users.insertOne(userData);
          res.status(201).send({
            resu: result,
            exist: isExist,
          });
        } catch {
          res.status(500).send({ message: "Failed to add User" });
        }
      } else {
        res.status(500).send({ message: "User Already Exist" });
      }
    });

    // book add api
    app.post("/addBook", async (req, res) => {
      const userData = req.body;
      userData.createdAt = new Date();
      try {
        const result = await Books.insertOne(userData);
        res.status(201).send(result);
      } catch (error) {
        res.status(500).send({ message: "Failed to add book" });
      }
    });



    // latest book and all book api basend on query 
    app.get("/books", async (req, res) => {
      let { limit } = req.query;

      limit = limit ? parseInt(limit) : 0; 

      const query = Books.find().sort({ createdAt: -1 }).project({
        title: 1,
        author: 1,
        category: 1,
        price: 1,
        image1: 1,
        image2: 1,
      });

      if (limit > 0) {
        query.limit(limit);
      }

      const result = await query.toArray();
      res.status(200).send(result);
    });


    // post details api 
    app.get("/books/:bookId",async(req,res)=>{
      const {bookId}=req.params;
      const result =await Books.findOne({ _id:new ObjectId(bookId) });
      res.send(result)
    })


    // wishList api 
    app.post("/wishListBook",async(req,res)=>{
      const wishBook=req.body;
      const result = await wishList.insertOne(wishBook);
      res.send(result)
    })



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
