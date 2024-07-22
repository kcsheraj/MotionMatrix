const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const UserModel = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

require("dotenv").config({ path: "api/.env" }); // Load environment variables

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "*", // replace with your actual frontend URL
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true, // if you need to handle cookies
  })
);

app.use(cookieParser());

const verifyUser = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json("The token was not available");
  } else {
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.json("The token is invalid");
      }
      req.user = user; // Attach the user to the request object
      next();
    });
  }
};

app.get("/", (req, res) => {
  res.json("Welcome to the Motion Matrix API");
});

app.get("/home", verifyUser, (req, res) => {
  return res.json({ message: "Success", email: req.user.email });
});

app.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json("Logged out successfully");
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  UserModel.findOne({ email: email }).then((user) => {
    if (user) {
      bcrypt.compare(password, user.password, (err, response) => {
        if (response) {
          const token = jwt.sign(
            { email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
          );
          res.cookie("token", token);
          res.json("Success");
        } else {
          return res.json("The password is incorrect");
        }
      });
    } else {
      res.json("User not found");
    }
  });
});

app.post("/register", (req, res) => {
  const { name, email, password } = req.body;
  bcrypt
    .hash(password, 10)
    .then((hash) => {
      UserModel.create({ name, email, password: hash })
        .then((user) => res.json(user))
        .catch((err) => res.json(err));
    })
    .catch((err) => console.log(err.message));
});

app.post("/save-text", verifyUser, (req, res) => {
  const { text } = req.body;

  UserModel.findOneAndUpdate(
    { email: req.user.email },
    { $push: { texts: text } },
    { new: true }
  )
    .then((user) => {
      if (user) {
        res.json(user.texts);
      } else {
        res.json("User not found");
      }
    })
    .catch((err) => res.json(err));
});

app.get("/get-texts", verifyUser, (req, res) => {
  UserModel.findOne({ email: req.user.email })
    .then((user) => {
      if (user) {
        res.json(user.texts);
      } else {
        res.json("User not found");
      }
    })
    .catch((err) => res.json(err));
});

mongoose
  .connect(process.env.MongoDB_URI)
  .then(() => {
    console.log("App connected to MongoDB database");
    app.listen(process.env.PORT, () => {
      console.log(`App is listening to port: ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });

module.exports = app; // Export the Express app
