const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const formRoutes = require("./routes/formRoutes");

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use("/api", formRoutes);

module.exports = app;
