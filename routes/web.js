const express = require("express");

const router = express();
const loginController = require("../controllers/loginController");
const registerController = require("../controllers/registerController");
const dashboardController = require("../controllers/dashboardController");
const mangaController = require("../controllers/mangaController");
const chapterController = require("../controllers/chapterController");
const listsController = require("../controllers/listsController");
const accountController = require("../controllers/accountController");
const settingController = require("../controllers/settingController");

router
  .get("/", dashboardController.homePageController)
  .get("/login",loginController.loginPageController)
  .get("/register",registerController.registerPageController)
  .get("/dashboard", dashboardController.homePageController)
  .get("/dashboard/manga", mangaController.mangaPageController)
  .get("/dashboard/chapter", chapterController.chapterPageController)
  .get("/dashboard/lists", listsController.listAutoPostPageController)
  .get("/dashboard/account", accountController.accountPageController)
  .get("/dashboard/settings", settingController.settingPageController);

module.exports = router;
