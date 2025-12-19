const express = require("express");
const app = express();
require("dotenv").config();
var cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT;
const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.PASS_WORD}@cluster0.vdcsgkx.mongodb.net/?appName=Cluster0`;
const stripe = require("stripe")(process.env.STRIPE_KEY);
const FRONTEND_DOMAIN = process.env.FRONTEND_DOMAIN;

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
app.use(express.static("public"));

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
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
      userData.reviews = [];
      try {
        const result = await Books.insertOne(userData);
        res.status(201).send(result);
      } catch (error) {
        res.status(500).send({ message: "Failed to add book" });
      }
    });

    // latest book api
    app.get("/books/latest", async (req, res) => {
      console.log("etai hit korlam");

      const query = Books.find({
        bookStatus: "Published",
      })
        .project({
          title: 1,
          author: 1,
          category: 1,
          price: 1,
          image1: 1,
          image2: 1,
          bookStatus: 1,
          isApprove: 1,
          createdAt: 1,
        })
        .sort({
          createdAt: -1,
        })
        .limit(6);

      const result = await query.toArray();
      res.status(200).send(result);
    });

    // all book api
    app.get("/allBook", async (req, res) => {
      let { sort } = req.query;
      const sortProperty = {};
      if (sort) {
        sortProperty.price = parseInt(sort);
      }
      const query = Books.find({
        bookStatus: "Published",
      })
        .sort(sortProperty)
        .project({
          title: 1,
          author: 1,
          category: 1,
          price: 1,
          image1: 1,
          image2: 1,
          bookStatus: 1,
          isApprove: 1,
        });
      const result = await query.toArray();
      res.status(200).send(result);
    });

    //  personal book findOut api
    app.get("/books", async (req, res) => {
      let { sort, email } = req.query;
      console.log(email, sort);
      const searchEmail = {};
      if (email) {
        searchEmail.ownerEmail = email;
      }

      const sortProperty = sort ? { price: parseInt(sort) } : { createdAt: -1 };
      const query = Books.find(searchEmail).sort(sortProperty).project({
        title: 1,
        author: 1,
        category: 1,
        price: 1,
        image1: 1,
        image2: 1,
        bookStatus: 1,
        isApprove: 1,
      });
      const result = await query.toArray();
      res.status(200).send(result);
    });

    // book delete api

    app.delete("/books/:id", async (req, res) => {
      const { id } = req.params;
      const result = await Books.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    // post details api
    app.get("/book/:bookId", async (req, res) => {
      const { bookId } = req.params;
      const result = await Books.findOne({ _id: new ObjectId(bookId) });
      res.send(result);
    });

    // wishList api
    app.post("/wishListBook", async (req, res) => {
      const wishBook = req.body;
      const result = await wishList.insertOne(wishBook);
      res.send(result);
    });

    // orders api
    app.post("/orders", async (req, res) => {
      const orderData = req.body;
      console.log(orderData);

      const result = await orders.insertOne(orderData);
      res.send(result);
    });

    // my order api and order on my books api
    app.get("/myOrders", async (req, res) => {
      const userEamil = req.query;
      const findQuery = {
        email: userEamil.uEmail,
      };

      const result = await orders
        .find(findQuery)
        .sort({ orderAt: -1 })
        .toArray();
      res.send(result);
    });
    //order on my books api
    app.get("/ordersOnMine", async (req, res) => {
      const userEamil = req.query;
      const findQuery = {
        sellerEmail: userEamil.lEmail,
      };

      const result = await orders
        .find(findQuery)
        .sort({ orderAt: -1 })
        .toArray();
      res.send(result);
    });

    // book unpublish api

    app.patch("/book/unpublish/:id", async (req, res) => {
      const { id } = req.params;

      const result = await Books.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            bookStatus: "Unpublished",
          },
        }
      );

      res.send(result);
    });

    // admin publish or unPublish book api
    app.patch("/book/pubUnpub/:id", async (req, res) => {
      const { id } = req.params;
      const { status } = req.body;

      const result = await Books.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            bookStatus: status,
          },
        }
      );

      res.send(result);
    });

    // wish list findOut api

    app.get("/wishList", async (req, res) => {
  
      
      const { email } = req.query;
      
      const result = await wishList.find({ user:email }).toArray()
      res.send(result);
    });

    // user and librarian delete order api
    app.delete("/order/delete/:id", async (req, res) => {
      const { id } = req.params;
      const result = await orders.deleteOne({ bookId: id });

      res.send(result);
    });

    // api for payment
    app.get("/payment/:id", async (req, res) => {
      const { id } = req.params;
      const result = await orders.findOne({ bookId: id });
      res.send(result);
    });

    // all post api
    app.get("/allPost", async (req, res) => {
      const result = await Books.find().sort({ createdAt: -1 }).toArray();
      res.send(result);
    });

    // book post approve api
    app.patch("/post/:id", async (req, res) => {
      const bookId = req.params.id;
      const { isApprove, updateData } = req.body;

      const updatedObj = {};
      if (isApprove) {
        updatedObj.isApprove = isApprove;
      } else {
        updatedObj.author = updateData.author;
        updatedObj.bookStatus = updateData.bookStatus;
        updatedObj.category = updateData.category;
        updatedObj.contact = updateData.contact;
        (updatedObj.edition = updateData.edition),
          (updatedObj.district = updateData.district);
        updatedObj.instruction = updateData.instruction;
        updatedObj.price = updateData.price;
        updatedObj.publication = updateData.publication;
        updatedObj.region = updateData.region;
        updatedObj.title = updateData.title;
      }
      const updatedQuery = {
        $set: updatedObj,
      };
      const findQuery = {
        _id: new ObjectId(bookId),
      };

      const result = await Books.updateOne(findQuery, updatedQuery);
      res.send(result);
    });

    // delete book by admin
    app.delete("/book/:id", async (req, res) => {
      const { id } = req.params;
      const result = await Books.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    // delivery status updated api
    app.patch("/order/updateStatus", async (req, res) => {
      const { id } = req.query;
      const { updatedStatus } = req.body;
      console.log(id, updatedStatus);
      const result = await orders.updateOne(
        { bookId: id },
        { $set: { status: updatedStatus } }
      );
      console.log(id, updatedStatus, result);
      res.send(result);
    });

    // find all user api
    app.get("/users", async (req, res) => {
      const result = await Users.find().toArray();

      res.send(result);
    });

    // user role update api
    app.patch("/users/:id", async (req, res) => {
      const { id } = req.params;
      const { role } = req.body;
      const findQuery = {
        _id: new ObjectId(id),
      };
      const updateQuery = {
        $set: { role: role },
      };
      const result = await Users.updateOne(findQuery, updateQuery);
      res.send(result);
    });

    // findSpecifiqUser api
    app.get("/user", async (req, res) => {
      const { email } = req.query;
      const result = await Users.findOne(
        { email },
        { projection: { role: 1, _id: 0 } }
      );
      console.log(email);

      res.send(result);
    });

    // search book api
    app.get("/book", async (req, res) => {
      const { bookName } = req.query;
      const result = await Books.find({
        title: { $regex: bookName, $options: "i" },
      }).toArray();
      res.send(result);
    });

    // payment Api
    app.post("/payment-checkout-session", async (req, res) => {
      const paymentData = req.body;

      const amount = parseInt(paymentData.cost) * 100;
      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price_data: {
              currency: "usd",
              unit_amount: amount,
              product_data: {
                name: `pay for: ${paymentData.bookName}`,
              },
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        metadata: {
          parcelId: paymentData.bookId,
        },
        customer_email: paymentData.senderEmail,
        success_url: `${process.env.FRONTEND_DOMAIN}/dashboard/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_DOMAIN}/dashboard/payment-cancelled`,
      });
      res.send({ url: session.url });
    });

    // payment status update api
    app.patch("/payment", async (req, res) => {
      const { sessionId } = req.query;

      const session = await stripe.checkout.sessions.retrieve(sessionId);
      const sendAndUpdateObj = {
        payment: session.payment_status,
        transectionId: session.payment_intent,
        method: session.payment_method_types[0],
        paid_amount_total: session.amount_total,
      };
      const updatedQuery = {
        $set: sendAndUpdateObj,
      };
      const searchQuery = {
        email: session.customer_email,
        bookId: session.metadata.parcelId,
      };

      const result = await orders.updateOne(searchQuery, updatedQuery);

      res.send({
        updateResult: result,
        pamentData: sendAndUpdateObj,
      });
    });

    //  roleFindOut api
    app.get("/role", async (req, res) => {
      const { email } = req.query;
      const result = await Users.findOne({
        email,
      });
      res.send(result);
    });

    // book review api
    app.patch("/books/:id/review", async (req, res) => {
      const id = req.params.id;

      const review = req.body;

      const result = await Books.updateOne(
        { _id: new ObjectId(id) },
        { $push: { reviews: review } }
      );
      res.send(result);
    });

    app.get("/order/:id", async (req, res) => {
      const { id } = req.params;
      const { email } = req.query;
      const result = await orders.findOne({
        bookId: id,
        email,
      });
      res.send(result);
    });

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
