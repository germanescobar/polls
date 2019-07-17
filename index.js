const express = require("express");
const mongoose = require("mongoose");
const User = require("./models/User");
const Poll = require("./models/Poll");
const bcrypt = require('bcrypt');
const cookieSession = require("cookie-session");

mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/polls_top", { useNewUrlParser: true });

const app = express();

app.set('view engine', 'pug');
app.set('views', 'views');
app.use(cookieSession({
  secret: process.env.COOKIE_SECRET || "una_cadena_secreta",
  maxAge: 2 * 24 * 60 * 60 * 1000
}));

app.use(express.urlencoded({ extended: true}));

// authentication middleware
app.use(async (req, res, next) => {
  const userId = req.session.userId;
  if (userId) {
    const user = await User.findOne({ _id: userId });
    if (user) {
      res.locals.user = user;
    } else {
      delete req.session.userId;
    }
  }

  next();
});

const requireUser = (req, res, next) => {
  if (!res.locals.user) {
    return res.redirect("/login");
  }
  next();
};

const requireGuest = (req, res, next) => {
  if (res.locals.user) {
    return res.redirect("/");
  }
  next();
}

app.get("/register", (req, res, next) => {
  res.render('register');
})

app.post('/register', async (req, res, next) => {
  try {
    const data = {
      email: req.body.email,
      password: req.body.password
    }
    await User.create(data);
    res.redirect("/login");
  } catch(err) {
    next(err);
  }
})

app.get('/login', requireGuest, (req, res) => {
  res.render('login');
})

app.post("/login", requireGuest, async (req, res, next) => {
  try {
    const data = {
      email: req.body.email,
      password: req.body.password
    }
    const user = await User.authenticate(data.email, data.password);
    if (user) {
      req.session.userId = user._id;
      return res.redirect('/');
    } else {
      return res.render('login', {error: 'Wrong user or password, Try Again!'});
    }
  } catch (e) {
    return next(e);
  }
});

app.get("/", async (req, res, next) => {
  try {
    const polls = await Poll.find().populate('user');
    res.render("index", { polls });
  } catch (e) {
    next(e);
  }
});

// formulario para crear una encuesta
app.get("/polls/new", requireUser, (req, res) => {
  res.render('form');
});

// crear una encuesta
app.post("/polls", requireUser, async (req, res, next) => {
  try {
    const data = {
      title: req.body.title,
      description: req.body.description,
      user: res.locals.user,
      options: [
        { text: req.body.option1 },
        { text: req.body.option2 },
        { text: req.body.option3 },
        { text: req.body.option4 }
      ]
    }
    await Poll.create(data);
    res.redirect('/');
  } catch(err) {
    next(err);
  }
});

// formulario para editar una encuesta
app.get("/polls/:id/edit", requireUser, async (req, res, next) => {
  try {
    const id = req.params.id;
    const poll = await Poll.findById(id);
    res.render('update', { poll })
  } catch(err) {
    next(err);
  }
});

// formulario para editar una encuesta
app.post('/polls/:id', requireUser, async (req, res, next) => {
  try {
    let id = req.params.id;
    const data = {
      title: req.body.title,
      description: req.body.description,
      options: [
        { text: req.body.option1 },
        { text: req.body.option2 },
        { text: req.body.option3 },
        { text: req.body.option4 }
      ]
    }
    await Poll.update({_id:id}, data);
    res.redirect('/')
  } catch(err) {
    next(err)
  }
});

// formulario para votar por una encuesta
app.get("/polls/:id", async (req, res, next) => {
  try {
    const poll = await Poll.findById(req.params.id);

    res.render("vote", { poll });
  } catch (e) {
    next(e);
  }
});

// votar por una encuesta
app.post("/polls/:id/vote", async (req, res, next) => {
  try {
    const optionId = req.body.option;
    await Poll.update(
      { '_id': req.params.id, 'options._id' : optionId },
      { $inc: { 'options.$.votes': 1 } },
    );
    res.redirect(`/polls/${req.params.id}/results`);
  } catch (e) {
    next(e);
  }
});

// ver los resultados de una encuesta
app.get("/polls/:id/results", async (req, res, next) => {
  try{
    const poll = await Poll.findById(req.params.id).populate('user');;
    res.render("results", { poll })
  }catch (e) {
    next(e);
  }
});

//logout
app.get("/logout", requireUser, (req, res) => {
  req.session.userId = null;
  res.redirect('/login');
})

const PORT = process.env.PORT || 3000;
module.exports = app;
app.listen(PORT, () => console.log(`Escuchando en el puerto ${PORT} ...`));
