const express = require("express");

const router = express();
const usersController = require("../controllers/usersControllers");
const dashboardController = require("../controllers/dashboardControllers");

const middleware = require("../middleware/expressSession");

router
  .get("/", (req, res) => (res.redirect("/dashboard")))
  .get("/login", middleware.checkLoginStatus ,usersController.loginPageController)
  .get("/logout", usersController.logoutController)
  .get("/register",usersController.registerPageController)
  .get("/dashboard", dashboardController.homePageController)
  .get("/dashboard/manga", dashboardController.grabPageController)
  .get("/dashboard/lists", dashboardController.listsPageController)
  .get("/dashboard/account", dashboardController.accountPageController)
  .get("/dashboard/settings", dashboardController.settingPageController);

router
  .post("/register", usersController.postRegisterController)
  .post("/login", usersController.postLoginController)
  .post("/dashboard/account", dashboardController.postAccountController)
  .post("/dashboard/setting", dashboardController.postSettingController)
  .post("/manga/bychar", dashboardController.postGrebMangaWithChar)
  .post("/manga/add", dashboardController.postAddNewManga);

module.exports = router;
