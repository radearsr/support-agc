const intMysqlServices = require("../services/internalMysqlServices");
const securityServices = require("../services/securityServices");
const grabbingServices = require("../services/getterMangaServices");
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
  res.render("pages/grab", {
    title: "Grab - Dashboard Support AGC",
    fullName: fullname,
    roleName: role,
    activePage: "Grab",
    genres,
  });
};

const listsPageController = async (req, res) => {
  try {
    const {
      fullname,
      role,
    } = req.session;
    const resultLists = await intMysqlServices.getDataAllListsManga();
    res.render("pages/lists", {
      title: "Lists - Dashboard Support AGC",
      fullName: fullname,
      roleName: role,
      activePage: "Lists",
      lists: resultLists,
    });
  } catch (error) {
    if (error instanceof ClientError) {
      res.statusCode = error.statusCode;
      return res.json({
        status: "fail",
        message: error.message,
      });
    }
    res.statusCode = 500;
    return res.json({
      status: "error",
      message: "Terjadi kegagalan pada server kami",
    });
  }
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

const postGrebMangaWithChar = async (req, res) => {
  try {
    const { linkTarget, firstChar, maxData } = req.body;
    const results = await grabbingServices.getMangaWithSplitChar(linkTarget, firstChar, maxData);
    res.json({
      status: "success",
      data: results,
    });
  } catch (error) {
    console.error(error);
    res.statusCode = 500;
    res.json({
      status: "error",
      message: "Terjadi kegagalan pada server kami",
    });
  }
};

const postAddNewManga = async (req, res) => {
  try {
    const payload = req.body;
    const addedMangaId = await intMysqlServices.insertManga([[payload.title, payload.link, payload.status]]);
    res.statusCode = 201;
    res.json({
      status: "success",
      message: `Berhasil menambahkan lists manga baru dengan ID ${addedMangaId}`,
    });
  } catch (error) {
    console.error(error);
    res.statusCode = 500;
    res.json({
      status: "error",
      message: "Terjadi kegagalan pada server kami",
    });
  }
}

module.exports = {
  homePageController,
  grabPageController,
  listsPageController,
  settingPageController,
  accountPageController,
  postAccountController,
  postGrebMangaWithChar,
  postAddNewManga,
};
