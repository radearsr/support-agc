const intMysqlServices = require("../services/internalMysqlServices");
const securityServices = require("../services/securityServices");

const ClientError = require("../exceptions/ClientError");

const currentPageStatus = {
  code: 200,
  msg: "",
};

const homePageController = async (req, res) => {
  try {
    const {
      fullname,
      role,
    } = req.session;
    return res.render("pages/home", {
      title: "Home - Dashboard Support AGC",
      fullName: fullname,
      roleName: role,
      activePage: "Home",
    });
  } catch (error) {
    console.log(error);
    res.redirect("/login");
  }
};

const grabPageController = async (req, res) => {
  const {
    fullname,
    role,
  } = req.session;

  const genres = await intMysqlServices.getDataAllGenres();
  console.log(genres);
  console.log(genres[0].id);
  res.render("pages/grab", {
    title: "Grab - Dashboard Support AGC",
    fullName: fullname,
    roleName: role,
    activePage: "Grab",
    genres,
  });
};

const listsPageController = (req, res) => {
  const {
    fullname,
    role,
  } = req.session;
  res.render("pages/lists", {
    title: "Lists - Dashboard Support AGC",
    fullName: fullname,
    roleName: role,
    activePage: "Lists",
  });
};

const settingPageController = (req, res) => {
  const {
    fullname,
    role,
  } = req.session;
  res.render("pages/setting", {
    title: "Setting - Dashboard Support AGC",
    fullName: fullname,
    roleName: role,
    activePage: "Setting",
  });
};

const accountPageController = async (req, res) => {
  const {
    userId
  } = req.session;
  const userInfo = await intMysqlServices.getUserProfileByUserId(userId);
  res.render("pages/account", {
    title: "Account - Dashboard Support AGC",
    fullName: userInfo.fullname,
    roleName: userInfo.role,
    activePage: "Account",
    email: userInfo.email,
    statusCode: parseFloat(currentPageStatus.code),
    msg: currentPageStatus.msg,
  });
  currentPageStatus.code = 200;
  currentPageStatus.msg = "";
};

const postAccountController = async (req, res) => {
  try {
    const {
      userId,
    } = req.session;
    const payload = req.body;
    const hashedPassword = await securityServices.hashingPassword(payload.password);
    await intMysqlServices.updateUserProfile(userId, {
      ...payload,
      password: hashedPassword,
    });
    currentPageStatus.code = 200;
    currentPageStatus.msg = `Berhasil memperbarui profile ${payload.email}`;
    res.redirect("/dashboard/account");
  } catch (error) {
    if (error instanceof ClientError) {
      currentPageStatus.code = error.statusCode;
      currentPageStatus.msg = error.message;
      return res.redirect("/dashboard/account");
    }
    console.log(error);
    currentPageStatus.code = 500;
    currentPageStatus.msg = "terjadi kegagalan pada server kami";
    return res.redirect("/dashboard/account");
  }
};

module.exports = {
  homePageController,
  grabPageController,
  listsPageController,
  settingPageController,
  accountPageController,
  postAccountController,
};
