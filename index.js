const express = require("express");
const mongoose = require("mongoose");
const User = require("./models/User");
const Poll = require("./models/Poll");
const bcrypt = require('bcrypt');
const cookieSession = require("cookie-session");

mongoose.connect("mongodb://127.0.0.1:27017/polls_top", { useNewUrlParser: true });

const app = express();

app.set('view engine', 'pug');
app.set('views', 'views');
app.use(cookieSession({
  secret: "una_cadena_secreta",
  maxAge: 3*60*1000
}));

app.use(express.urlencoded({ extended: true}));

app.get("/register", (req, res, next) => {
  res.render('register');
})

app.post('/register', async (req, res, next) => {
  try {
    const data = {
      email: req.body.email,
      password: req.body.password
    }
    const user = await User.create(data);
    res.redirect("/login");
  } catch(err) {
    
    next(err);
  }
})

app.get('/login', (req, res) => {
  res.render('login');
})

app.post("/login", async (req, res, next) => {  
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
  const polls = await Poll.find().populate('user');
  res.render("index", { polls });
});

// formulario para crear una encuesta
app.get("/polls/new", (req, res) => {
  res.render('form');
});

// crear una encuesta
app.post("/polls", async (req, res, next) => {
  try {
    const data = {
      title: req.body.title,
      description: req.body.description,
      user: '5d24f405f3c60aa3fad0e683',
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
app.get("/polls/:id/edit", async (req, res, next) => {
  try {
    const id = req.params.id;
    const poll = await Poll.findById(id);
    res.render('update', { poll })
  } catch(err) {
    next(err);
  }
});

// formulario para editar una encuesta
app.post('/polls/:id', async (req, res, next) => {
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
app.get("/logout", (req, res) => {
  res.session = null;
  res.clearCookie('session');
  res.clearCookie('session.sig');
  res.redirect('/login');
})

app.listen(3000, () => console.log("Escuchando en el puerto 3000 ...."));