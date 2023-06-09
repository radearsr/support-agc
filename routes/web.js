const express = require("express");

const router = express();
const usersController = require("../controllers/usersControllers");
const dashboardController = require("../controllers/dashboardControllers");

const middleware = require("../middleware/expressSession");

router
  .get("/", (req, res) => (res.redirect("/dashboard")))
  .get("/login", middleware.checkLoginStatus ,usersController.loginPageController)
  .get("/logout", middleware.checkUserCredentials, usersController.logoutController)
  .get("/register",usersController.registerPageController)
  .get("/dashboard", middleware.checkUserCredentials, dashboardController.homePageController)
  .get("/dashboard/manga", middleware.checkUserCredentials, dashboardController.grabPageController)
  .get("/dashboard/lists", middleware.checkUserCredentials, dashboardController.listsPageController)
  .get("/dashboard/account", middleware.checkUserCredentials, dashboardController.accountPageController)
  .get("/dashboard/settings", middleware.checkUserCredentials, dashboardController.settingPageController);

router
  .post("/register", usersController.postRegisterController)
  .post("/login", usersController.postLoginController)
  .post("/dashboard/account", dashboardController.postAccountController)
  .post("/dashboard/setting", dashboardController.postSettingController)
  .post("/manga/bychar", dashboardController.postGrebMangaWithCharController)
  .post("/manga/bygenre", dashboardController.postGrebMangaWithGenresController)
  .post("/manga/add", dashboardController.postAddNewMangaController)
  .post("/manga/add/bulk", dashboardController.postAddNewMangaBulkController)
  .post("/manga/:listId/edit", dashboardController.putListMangaController)
  .post("/manga/:listId/delete", dashboardController.deleteListMangaController)
  .post("/dashboard/lists/add", dashboardController.addMangaFromList)

router.all("*", (req, res) => {
  res.statusCode = 404;
  res.json({
    status: "fail",
    message: "Not Found",
  });
});

module.exports = router;
