const { Router } = require("express")
const bcryptjs = require("bcryptjs")
const User = require("../models/user")
const router = Router()

router.get("/login", async (req, res) => {
  res.render("auth/login", {
    title: "Авторизация",
    isLogin: true,
    loginError: req.flash("loginError"),
    registerError: req.flash("registerError"),
  })
})

router.get("/logout", async (req, res) => {
  // req.session.isAuthenticated = false
  req.session.destroy(() => {
    res.redirect("/auth/login")
  })
})

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body
    const candidate = await User.findOne({ email })
    if (candidate) {
      const areSame = await bcryptjs.compare(password, candidate.password)
      if (areSame) {
        req.session.user = candidate
        req.session.isAuthenticated = true
        req.session.save((error) => {
          if (error) throw error
          res.redirect("/")
        })
      } else {
        req.flash("loginError", "Неверный пароль или email")
        res.redirect("/auth/login#login")
      }
    } else {
      req.flash("loginError", "Такого пользователя не существует")
      res.redirect("/auth/login#login")
    }
  } catch (error) {
    console.log(error)
  }
})

router.post("/register", async (req, res) => {
  try {
    const { email, password, repeat, name } = req.body
    const candidate = await User.findOne({ email })

    if (candidate) {
      req.flash("registerError", "Пользователь с таким email уже существует")
      res.redirect("/auth/login#register")
    } else {
      const hashPassword = await bcryptjs.hash(password, 12)
      const user = new User({
        email: email,
        name: name,
        password: hashPassword,
        cart: {
          items: [],
        },
      })
      await user.save()
      res.redirect("/auth/login#login")
    }
  } catch (error) {
    console.log(error)
  }
})

module.exports = router
