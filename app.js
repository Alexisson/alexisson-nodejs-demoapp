export default function appScr(
  express,
  bodyParser,
  fs,
  crypto,
  http,
  CORS,
  User,
  mongoose,
  puppeteer,
  login
) {
  const app = express();
  const path = import.meta.url.substring(7);
  const headersHTML = { "Content-Type": "text/html; charset=utf-8", ...CORS };
  const headersAll = {
    "Content-Type": "text/html; charset=utf-8",
    "X-Author": "itmo307709",
    ...CORS,
  };
  const headersTEXT = { "Content-Type": "text/plain", ...CORS };
  const headersJSON = { "Content-Type": "application/json", ...CORS };

  app
    .use(bodyParser.urlencoded({ extended: true }))
    .use(bodyParser.json())
    .all("/", (r) => {
      r.res.set(headersAll).send(login);
    })
    .all("/sample/", (r) => {
      r.res.set(headersTEXT).send("function task(x) { return x*this*this; }");
    })
    .all("/fetch/", (r) => {
      r.res.set(headersHTML).render("fetch");
    })
    .all("/promise/", (r) => {
      r.res
        .set(headersTEXT)
        .send(
          "function task(x){return new Promise((res,rej) => x<18 ? res('yes') : rej('no'))}"
        );
    })
    .all("/result4/", async (r) => {
      r.res.set(headersJSON);
      await r
        .on("data", function (chunk) {
          data += chunk;
        })
        .on("end", () => {});
      r.res.write(
        JSON.stringify({
          message: login,
          "x-result": headers,
          "x-body": data,
        })
      );
      r.res.end();

      // r.res.send(JSON.stringify(
      //     {
      //         "message": login,
      //         "x-result": r.headers['x-test'],
      //         "x-body": Object.keys(r.body)[0]
      //     }
      // ))
    })
    .all("/login/", (r) => {
      r.res.set(headersTEXT).send(login);
    })
    .all("/code/", (r) => {
      r.res.set(headersTEXT);
      fs.readFile(path, (err, data) => {
        if (err) throw err;
        r.res.end(data);
      });
    })
    .all("/sha1/:input/", (r) => {
      r.res
        .set(headersTEXT)
        .send(crypto.createHash("sha1").update(r.params.input).digest("hex"));
    })
    .get("/req/", (req, res) => {
      res.set(headersTEXT);
      let data = "";
      http.get(req.query.addr, async function (response) {
        await response
          .on("data", function (chunk) {
            data += chunk;
          })
          .on("end", () => {
            res.send(data);
          });
      });
    })
    .post("/req/", (r) => {
      r.res.set(headersTEXT);
      const { addr } = r.body;
      r.res.send(addr);
    })
    .post("/insert/", async (r) => {
      r.res.set(headersTEXT);
      const { login, password, URL } = r.body;
      const newUser = new User({ login, password });
      try {
        await mongoose.connect(URL, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
        try {
          await newUser.save();
          r.res.status(201).json({ "Добавлено: ": login });
        } catch (e) {
          r.res.status(400).json({ "Ошибка: ": "Нет пароля" });
        }
      } catch (e) {
        console.log(e.codeName);
      }
    })
    .all("/test/", async (r) => {
      r.res.set(headersTEXT);
      const { URL } = r.query;
      console.log(URL);
      const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
      const page = await browser.newPage();
      await page.goto(URL);
      await page.waitForSelector("#inp");
      await page.click("#bt");
      const got = await page.$eval("#inp", (el) => el.value);
      console.log(got);
      browser.close();
      r.res.send(got);
    })
    .all("/render/", async (req, res) => {
      res.set(headersCORS);
      const { addr } = req.query;
      const { random2, random3 } = req.body;

      http.get(addr, (r, b = "") => {
        r.on("data", (d) => (b += d)).on("end", () => {
          fs.writeFileSync("views/render.pug", b);
          res.render("render", { login: login, random2, random3 });
        });
      });
    })
    .use((r) => r.res.status(404).set(headersTEXT).send(login))
    .set("view engine", "pug");
  return app;
}
