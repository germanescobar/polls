const express = require("express");
const mongoose = require("mongoose");
const User = require("./models/User");
const Poll = require("./models/Poll");
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');

mongoose.connect("mongodb://127.0.0.1:27017/polls_top", { useNewUrlParser: true });

const app = express();
app.use(cookieSession({
  secret: 'hola',
  maxAge:  10* 60 * 1000,
}));
app.set('view engine', 'pug');
app.set('views', 'views');
app.use(express.urlencoded({ extended: true}));

app.get("/", async (req, res, next) => {
  const polls = await Poll.find().populate('user');
  res.render("index", { polls });
});

// Formulario de registro
app.get('/register', async (req, res) => {
  try {
    res.render('register');
  } catch (error) {
    next(error);
  }
});

// Registrar un nuevo usuario
app.post('/register', async (req, res, next) => {
  try {
    let user = await User.findOne({ email: req.body.email });
    if (!user) {
        user = new User({
        email: req.body.email,
        name: req.body.name,
        password: req.body.password 
      });
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
      await user.save();
      res.redirect('/login');
    } else { 
      res.status(400).send(`El usuario con email: ${req.body.email} ya existe.`)
    };
  } catch (e) {
    next(e);
  };
});

// Formulario de login
app.get('/login',  async (req, res, next) => {
  try {
    res.render('login');
  } catch (error) {
    next(error);
  }
});

// Inicio de sesion del usuario
app.post('/login', async (req, res, next) => {
  try {
    let user = await User.findOne({ email: req.body.email });
    req.session.userId = req.session.userId || user._id;
    if (!user) {
      res.status(300).send(`Usuario o email incorrecto`);
    };

    const validPassword = await bcrypt.compare(req.body.password, user.password);

    if(!validPassword) {
      res.status(300).send(`Usuario o email incorrecto`);
    }    
    res.redirect('/');
  } catch (e) {
    next(e);
  };
});

// Cierre de sesion del usuario
app.get('/logout', async (req, res) => {
  req.session.userId = null;
  res.redirect('/');
})

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
      user: '5d26c1e28960881724148913',
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

app.listen(3000, () => console.log("Escuchando en el puerto 3000 ...."));
