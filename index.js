const express = require("express");
const mongoose = require("mongoose");
const User = require("./models/User");
const Poll = require("./models/Poll");

mongoose.connect("mongodb://127.0.0.1:27017/polls_top", { useNewUrlParser: true });

const app = express();

app.set('view engine', 'pug');
app.set('views', 'views');

app.use(express.urlencoded({ extended: true}));

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
      user: '5d25112a1c9d440000337c82',
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
    await Poll.findById(id, (err, poll) => {
      res.render('update', {poll})
    })
  } catch(err) {
    next(err);
  }
});

// formulario para editar una encuesta
app.post('/polls/update', async (req, res, next) => {
  try {
    let id = req.body.id;
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
app.get("/polls/:id", (req, res) => {

});

// votar por una encuesta
app.post("/polls/:id/vote", (req, res) => {
  //const vote = await Poll.findByIdAndUpdate()
});

// ver los resultados de una encuesta
app.get("/polls/:id:/results", (req, res) => {

});

app.listen(3000, () => console.log("Escuchando en el puerto 3000 ...."));
