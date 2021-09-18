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
    //week 1
    .all("/", (r) => {
      r.res.set(headersAll).send(login);
    })

    //week2
    .all("/sample/", (r) => {
      r.res.set(headersTEXT).send("function task(x) { return x*this*this; }");
    })
    .all("/login/", (r) => {
      r.res.set(headersTEXT).send(login);
    })

    //week3
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


    .all("/result4/", (r) => {
      const result = {
        message: login,
        "x-result": r.headers["x-test"],
      };
      let body = "";

      r.on("data", (data) => (body += data)).on("end", () => {
        result["x-body"] = body;
        r.res.writeHead(200, { ...CORS, "Content-Type": "application/json" });
        r.res.end(JSON.stringify(result));
      });
    })

    app.get('/code/', (req, res) => {
      res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
      createReadStream(import.meta.url.substring(7)).pipe(res);
  })

  app.get('/sha1/:input', (req, res) => {
      var shasum = crypto.createHash('sha1');
      shasum.update(req.params.input);
      res.send(shasum.digest('hex'));
  })

  app.get('/req/', (req, res) => {

      if (req.query.addr) {
          http.get(req.query.addr, (get) => {
              let data = '';

              get.on('data', (chunk) => {
                  data += chunk;
              });
              
              get.on('end', () => {
                  res.send(data);
              });
              
              }).on("error", (err) => {
              res.send(data);
              });
      } else {
          res.send('no addr found');
      }

  })

  app.post('/req/', (req, res) => {
      http.get(req.body.replace('addr=', ''), (get) => {
          let data = '';

          get.on('data', (chunk) => {
            data += chunk;
          });
        
          get.on('end', () => {
              res.send(data);
          });
        
        }).on("error", (err) => {
          res.send(data);
        });
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
