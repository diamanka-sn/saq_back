const express = require("express");
const app = express();
const bodyParse = require("body-parser");
const path = require("path");
const cors = require("cors");
const auth = require('./middlewares/auth')
const routesUtilisateur = require("./routes/routeUser");
const routesProduct = require("./routes/routeProduct");
const routesCategories = require("./routes/routeCategorie");
const routesOrder = require("./routes/routeOrder");
const routesNote = require("./routes/routeNote");
const authAdmin = require("./middlewares/authAdmin");


app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization,multipart/form-data"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});
app.use(bodyParse.json());
app.use(express.urlencoded({ extended: true }));

app.use("/images", express.static(path.join(__dirname, "images")));


app.use("/user", routesUtilisateur);
app.use("/product", routesProduct);
app.use("/categorie", authAdmin, routesCategories);
app.use("/note", auth, routesNote)
app.use("/order", auth, routesOrder)

module.exports = app;
