const puppeteer = require("puppeteer");
const mongoose = require("mongoose");
const User = require("./models/User");
const app = require("./index");
const Poll = require("./models/Poll");

 jest.setTimeout(30000);

let server;
let page;
let browser;
const width = 1920;
const height = 1080;
beforeAll(async () => {
  server = app.listen(3000);

  browser = await puppeteer.launch({
    headless: false,
    slowMo: 80,
    args: [`--window-size=${width},${height}`]
  });
  page = await browser.newPage();
  await page.setViewport({ width, height });
});

beforeEach(async () => {
  for (var i in mongoose.connection.collections) {
    await mongoose.connection.collections[i].remove({});
  }
});

afterAll(async () => {
  server.close();
  await mongoose.disconnect();
  browser.close();
});

test("user can register and login", async () => {
  await page.goto("http://localhost:3000/");
  await page.click('a[href="/register"]');

  // registrarse
  await page.waitFor('input[id=email]');
  await page.type("input[id=email]", "pedro@gmail.com");
  await page.type("input[id=password]", "test1234");
  let nav = page.waitForNavigation();
  await page.click("button[type=submit]");
  await nav;

  const user = await User.findOne({ email: "pedro@gmail.com" });
  expect(user).not.toBeNull();

  // login
  expect(page.url()).toMatch(/login$/);
  await page.type("input[id=email]", "pedro@gmail.com");
  await page.type("input[id=password]", "test1234");
  nav = page.waitForNavigation();
  await page.click("button[type=submit]");
  await nav;

  expect(page.url()).toMatch(/\/$/);

  //Crear una encuesta
  await page.click('a[href="/polls/new"]'); 
  await page.waitFor('input[name=title]');
  await page.type("input[name=title]", "Encuesta 1");
  await page.type("textarea[name=description]", "Esta es la encuesta 1");
  await page.type("input[name=option1]", "Opcion 1");
  await page.type("input[name=option2]", "Opcion 2");
  nav = page.waitForNavigation();
  await page.click("input[type=submit]");
  await nav;

  expect(page.url()).toMatch(/\/$/);

  //Votar por una encuesta
  const poll = await Poll.findOne({ title: "Encuesta 1" });
  expect(poll).not.toBeNull();
  await page.click(`a[href="/polls/${poll._id}"]`);
  await page.waitFor('input[name=option]');
  await page.click('input[name=option]');
  nav = page.waitForNavigation();
  await page.click("button[type=submit]");

});

