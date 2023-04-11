require("dotenv").config();
const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const { Cron } = require("croner");
const path = require("path");
const actionAgcService = require("./services/actionAgcServices");
const localMysqlServices = require("./services/localMysqlServices");
const wpMysqlServices = require("./services/wpMysqlServices");
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
    await telegramService.senderNofitication("1047449361", "Monitoring Manga Start");
    await telegramService.senderNofitication(settings.telegramId, "Monitoring Manga Start");
    if (settings.monitType === "INTR") {
      const mangaLists = await localMysqlServices.getDataAllListsMangaASC();      
      mangaLists.forEach((list, idx) => {
        setTimeout(() => {
          actionAgcService.cronMonitoringInternal(settings.linkAgc,{
           title: list.title,
           link: list.link,
          }, settings.emailAgc, settings.passwordAgc, settings.linkWordpress, settings.telegramId);
        }, idx * 6000);
      });
    } else {
      const mangaWpLists = await wpMysqlServices.getAllPostMangaOrderByPostDate("manga", "ASC");
      mangaWpLists.forEach(async (list, idx) => {
        setTimeout(async () => {
          try {
            await cronMonitoringChapter(settings.linkAgc, {
              title: list.post_title,
              id: list.ID,
            }, "https://www.mangageko.com", settings.emailAgc, settings.passwordAgc, settings.linkWordpress, settings.telegramId);
          } catch (error) {
            utils.logging.error(utils.currentFormatDate());
            utils.logging.error(error);
          }
        }, idx * 6000);
      });
    }
  } catch (error) {
    utils.logging.error(error);
    console.error(error);
  }
});
