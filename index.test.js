const request = require("supertest");
const mongoose = require("mongoose");
const cheerio = require('cheerio');
const User = require("./models/User");
const Poll = require("./models/Poll");
const app = require("./index");

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


  
