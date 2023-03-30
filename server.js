require("dotenv").config();
const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const { Cron } = require("croner");
const path = require("path");

const localMysqlServices = require("./services/localMysqlServices");
const cronServices = require("./services/cronerServices");

let currentPattern = "* */1 * * *";
const app = express();

app.set("view engine", "ejs");
app.use("/assets", express.static(path.join(__dirname, "assets")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(session({
  secret: process.env.SESSION_KEY,
  saveUninitialized: true,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
  },
  resave: false,
}));

app.use(cookieParser());

app.use("/", require("./routes/web"));

const port = process.env.PORT || 5000;

let job;

setInterval(async () => {
  try {
    console.log(currentPattern);
    const settings = await localMysqlServices.getSettingWithoutUserId();
    const listsManga = await localMysqlServices.getDataAllListsMangaASC(settings.actionCount);
    console.log("CRON PATTERN", settings.cronPattern);
    console.log(settings.cronPattern !== currentPattern);
    if (settings.cronPattern !== currentPattern) {
      console.log("CRON PATTERN", settings.cronPattern)
      currentPattern = settings.cronPattern;
      job.stop();
      job = Cron(settings.cronPattern, async () => {
        await cronServices.cronActionPublish(settings.linkAgc, listsManga, settings.emailAgc, settings.passwordAgc, settings.linkWp);
      });
    }
  } catch (error) {
    console.error(error.message);
  }
}, 30000);

job = Cron(currentPattern, () => {
  console.log("START CRON");
});

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});

