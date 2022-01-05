const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = mongoose.model("User");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken')

// middlewares
const requireLogin = require("../middleware/requireLogin")

// keys
const { JWT_SECRET } = require("../keys")

// sign-up route
router.post("/signup", (req, res) => {
  const { name, email, password, pic } = req.body;

  // validation
  if (!email || !password || !name) {
    return res.status(422).json({ error: "Please add all the fields!" });
  }

  // user already exists
  User.findOne({ email: email })
    .then((savedUser) => {
      if (savedUser) {
        return res.status(422).json({ error: "User already exists!" });
      }
      bcrypt.hash(password, 12).then((hashedpassword) => {
        const user = new User({
          email,
          password: hashedpassword,
          name,
          pic
        });

        user
          .save()
          .then((user) => {
            res.json({ message: "Sign up successfull" });
          })
          .catch((error) => {
            console.log(err)
          });
      });
    })
    .catch((error) => {
      console.log(err)
    });
});

// sign in route
router.post('/signin', (req, res) => {
  const { email, password } = req.body

  // validation
  if (!email || !password) {
    res.status(422).json({ error: "Please add all fields!" })
  }

  User.findOne({ email: email }).then(savedUser => {
    if (!savedUser) {
      return res.status(422).json({ error: "Invalid Credentials!" })
    }

    bcrypt.compare(password, savedUser.password)
      .then(doMatch => {
        if (doMatch) {
          // res.json({ message: "signed in successfully" })
          const token = jwt.sign({ _id: savedUser._id }, JWT_SECRET)
          const { _id, name, email, followers, following, pic } = savedUser
          res.json({ token, user: { _id, name, email, followers, following, pic }, message: "Signed in successfully! " })
        } else {
          return res.status(422).json({ error: "Invalid Credentials!" })
        }
      })
      .catch(err => {
        console.log(err)
      })
  })
})

module.exports = router;
