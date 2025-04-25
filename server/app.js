const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const formRoutes = require("./routes/formRoutes");

const app = express();

app.use(cors({
    origin: ['http://localhost:3000'], // Add your frontend origin here
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  }));
  
app.use(bodyParser.json());

app.use("/api", formRoutes);

module.exports = app;
