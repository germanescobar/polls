const express = require("express");
const mongoose = require("mongoose");
const User = require("./models/User");
const Poll = require("./models/Poll");

mongoose.connect("mongodb://127.0.0.1:27017/polls_top", { useNewUrlParser: true });

const app = express();

app.set('view engine', 'pug');
app.set('views', 'views');

// listar todas las encuestas
app.get("/", async (req, res, next) => {

});

// formulario para crear una encuesta
app.get("/polls/new", (req, res) => {

});

// crear una encuesta
app.post("/polls", (req, res) => {

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
