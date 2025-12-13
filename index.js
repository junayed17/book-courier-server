const express = require("express");
const app = express();
require("dotenv").config();
var cors = require("cors");
const port = process.env.PORT;

// middlewares

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("database is running");
});

app.listen(port, () => {
  console.log(`i am running in ${port}`);
});
