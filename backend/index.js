const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const app = express();

// DB connection
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("Mongo Db is connected"))
  .catch((e) => console.log(e));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is listening on ${PORT} !`);
});
