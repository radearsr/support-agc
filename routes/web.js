const express = require("express");

const router = express();
const usersController = require("../controllers/usersControllers");
const dashboardController = require("../controllers/dashboardControllers");

router
  .get("/", dashboardController.homePageController)
  .get("/login",usersController.loginPageController)
  .get("/register",usersController.registerPageController)
  .get("/dashboard", dashboardController.homePageController)
  .get("/dashboard/manga", dashboardController.grabPageController)
  .get("/dashboard/lists", dashboardController.listsPageController)
  .get("/dashboard/account", dashboardController.accountPageController)
  .get("/dashboard/settings", dashboardController.settingPageController);

module.exports = router;
