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


/*


beforeEach(async () => {
  // antes de cada prueba limpiamos todas las colecciones para iniciar con una
  // base de datos en blanco
  for (var i in mongoose.connection.collections) {
    await mongoose.connection.collections[i].remove({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
});

const signIn = async (credentials) => {
  const agent = request.agent(app);
  await agent.post('/login')
      .type("form")
      .send(credentials);

  return agent;
}

describe('GET /', () => {
  it('responds with success code', async () => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(200);
  });
});

describe('GET /polls/new private', () => {
  it("redirects to login if not authenticated", async () => {
    const response = await request(app).get('/polls/new');
    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe("/login");
  });
  
  it("responds with success code if authenticated", async () => {
    const credentials = { email: "pedro@gmail.com", password: "test1234" };
    const user = await User.create(credentials);
    const agent = await signIn(credentials);

    const response = await agent.get("/polls/new");
    const $ = cheerio.load(response.text);
    expect(response.statusCode).toBe(200);
    expect($('.label').text().slice(0,5)).toBe('Title');
  });
});

describe('POST /polls private', () => {
  it("verify if user is logged", async () => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(200);
  });

  it ('shows polls', async () => {
    const user = await User.create({ email: "pedro@gmail.com", password: "test1234" });

    await Poll.create({
      title: "Poll 1",
      description: "Description 1",
      user: user,
      options: [
        { text: "Option 1" },
        { text: "Option 2" }
      ]
    });

    const response = await request(app).get("/");
    const $ = cheerio.load(response.text);
    expect($(".column").length).toBe(1);
    expect($(".column .title").text().trim()).toBe("Poll 1");
  })
});
*/
