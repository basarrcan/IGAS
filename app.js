const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const dotenv = require('dotenv');

const result = dotenv.config();

if (result.error) {
  throw result.error
}

console.log(result.parsed);

const transactionRoutes = require('./api/routes/transaction');
const userRoutes = require('./api/routes/user');

mongoose.connect(
  "mongodb://basarcan:" +
  process.env.MONGO_ATLAS_PW +
    "@demoapi-shard-00-00-esbxb.mongodb.net:27017,demoapi-shard-00-01-esbxb.mongodb.net:27017,demoapi-shard-00-02-esbxb.mongodb.net:27017/test?ssl=true&replicaSet=demoapi-shard-0&authSource=admin",
  {
    useMongoClient: true
  }
).once('open', () => console.log('Connected to MongoLab instance.'))
  .on('error', error => console.log('Error connecting to MongoLab:', error));


mongoose.Promise = global.Promise;

app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "OPTIONS, PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

// Routes which should handle requests
app.use("/user", userRoutes);
app.use("/transaction", transactionRoutes);

app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});

module.exports = app;
