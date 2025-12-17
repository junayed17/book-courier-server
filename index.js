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
    const orders = database.collection("orders");

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


    // orders api 
    app.post("/orders",async(req,res)=>{
      const orderData=req.body;
      console.log(orderData);
      
      const result=await orders.insertOne(orderData)
      res.send(result)
    })



    // my order api and order on my books api
    app.get("/myOrders",async(req,res)=>{
      const userEamil = req.query;
      console.log(userEamil);
      const findQuery = {};

      if (userEamil.lEmail) {
        findQuery.sellerEmail=userEamil.lEmail;
      }
      else{
        findQuery.email = userEamil.uEmail;
      }
      
      const result = await orders
        .find(findQuery)
        .sort({ orderAt :-1})
        .toArray();
       res.send(result)
    })


    // all post api 
    app.get("/allPost",async(req,res)=>{
      const result = await Books.find().sort({ createdAt: -1 }).toArray();
      res.send(result)
    })


    // book post approve api 
      app.patch("/post/:id", async (req, res) => {
        const bookId = req.params.id;
        const {isApprove}=req.body
        console.log(bookId, isApprove);
        const updatedQuery = {
          $set: {
            isApprove,
          },
        };
        const findQuery = {
          _id:new ObjectId(bookId)
        };

        const result = await Books.updateOne(findQuery,updatedQuery)
        res.send(result);
      });



      // delete book by admin 
      app.delete("/book/:id",async(req,res)=>{
        const {id}=req.params;      
        const result=await Books.deleteOne({_id:new ObjectId(id)})
        res.send(result)
      })


    // delivery status updated api 
    app.patch("/order/updateStatus",async(req,res)=>{
      const {id}=req.query;
      const { updatedStatus } = req.body;
      console.log(id,updatedStatus);
      const result = await orders.updateOne(
        { bookId: id },
        { $set: { status: updatedStatus } }
      );
      console.log(id, updatedStatus,result);
      res.send(result)
    });




    // find all user api 
    app.get("/users",async(req,res)=>{
      const result = await Users.find().toArray();
      res.send(result)
    })


    // user role update api
    app.patch("/users/:id",async(req,res)=>{
      const {id}=req.params;
      const {role}=req.body;
      const findQuery={
        _id:new ObjectId(id)
      }
      const updateQuery={
       $set: {role:role}
      }
      const result=await Users.updateOne(findQuery,updateQuery)
      res.send(result)
    })

    // findSpecifiqUser api 
    app.get("/user",async(req,res)=>{
      const {email}=req.query;
      const result = await Users.findOne(
        { email },
        { projection: { role: 1, _id: 0 } }
      )
      console.log(email);
      
      res.send(result)
    })


    // search book api 
    app.get("/book",async(req,res)=>{
      const {bookName}=req.query;
      const result = await Books.find({
        title: { $regex: bookName, $options: "i" },
      }).toArray()
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
