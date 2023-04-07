require("dotenv").config();
const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const { Cron } = require("croner");
const path = require("path");
const actionAgcService = require("./services/actionAgcServices");
const localMysqlServices = require("./services/localMysqlServices");
const telegramService = require("./services/telegramService");
const utils = require("./services/utils");

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

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});

Cron("0 0 */4 * * *", { timezone: "Asia/Jakarta" }, async () => {
  try {
    utils.logging.log(utils.currentFormatDate());
    utils.logging.log("Cron Is Running");
    const settings = await localMysqlServices.getSettingWithoutUserId();
    const mangaLists = await localMysqlServices.getDataAllListsMangaASC();
    await telegramService.senderNofitication("1047449361", "Monitoring Manga Start");
    await telegramService.senderNofitication(settings.telegramId, "Monitoring Manga Start");
    mangaLists.forEach((list, idx) => {
      setTimeout(() => {
        actionAgcService.cronActionPublish(settings.linkAgc,{
         title: list.title,
         link: list.link,
        }, settings.emailAgc, settings.passwordAgc, settings.linkWordpress, settings.telegramId);
      }, 6000 * idx)
    });
  } catch (error) {
    utils.logging.error(error);
    console.error(error);
  }
});