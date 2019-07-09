const express = require("express");
const mongoose = require("mongoose");
const User = require("./models/User");
const Poll = require("./models/Poll");

const uri = 'mongodb+srv://MrRobot:Cicl!sm0si5@makeitreal-uiiha.mongodb.net/test?retryWrites=true&w=majority'
mongoose.connect(uri, { useNewUrlParser: true });

const app = express();

app.set('view engine', 'pug');
app.set('views', 'views');
app.use(express.urlencoded());

// listar todas las encuestas
app.get("/", async (req, res, next) => {
  res.render('index') // quitar cuando se valla a realizar el commit 
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
app.get("/polls/new", (req, res) => {

});

// formulario para votar por una encuesta
app.get("/polls/:id", (req, res) => {

});

// votar por una encuesta
app.post("/polls/:id/vote", (req, res) => {

});

// ver los resultados de una encuesta
app.get("/polls/:id:/results", (req, res) => {

});

app.listen(3000, () => console.log("Escuchando en el puerto 3000 ...."));
