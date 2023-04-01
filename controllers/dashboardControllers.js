const localMysqlServices = require("../services/localMysqlServices");
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
  const genres = await localMysqlServices.getDataAllGenres();
  res.render("pages/grab", {
    title: "Grab - Dashboard Support AGC",
    fullName: fullname,
    roleName: role,
    activePage: "Grab",
    genres,
  });
};

const listsPageController = async (req, res) => {
  const {
    fullname,
    role,
  } = req.session;
  try {
    const resultLists = await localMysqlServices.getDataAllListsManga();
    res.render("pages/lists", {
      title: "Lists - Dashboard Support AGC",
      fullName: fullname,
      roleName: role,
      activePage: "Lists",
      lists: resultLists,
    });
  } catch (error) {
    if (error instanceof ClientError) {
      console.log("TEst")
      res.statusCode = error.statusCode;
      return res.render("pages/lists", {
        title: "Lists - Dashboard Support AGC",
        fullName: fullname,
        roleName: role,
        activePage: "Lists",
        lists: [],
        msg: error.message,
      });
    }
    res.statusCode = 500;
    return res.json({
      status: "error",
      message: "Terjadi kegagalan pada server kami",
    });
  }
};

const settingPageController = async (req, res) => {
  const {
    userId,
    fullname,
    role,
  } = req.session;
  try {
    const result = await localMysqlServices.getSettingWithUserId(userId);
    res.render("pages/setting", {
      title: "Setting - Dashboard Support AGC",
      fullName: fullname,
      roleName: role,
      activePage: "Setting",
      settings: result,
    });
  } catch (error) {
    res.render("pages/setting", {
      title: "Setting - Dashboard Support AGC",
      fullName: fullname,
      roleName: role,
      activePage: "Setting",
    });
  }
};

const accountPageController = async (req, res) => {
  const {
    userId
  } = req.session;
  const userInfo = await localMysqlServices.getUserProfileByUserId(userId);
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
    await localMysqlServices.updateUserProfile(userId, {
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

const postGrebMangaWithCharController = async (req, res) => {
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

const postAddNewMangaController = async (req, res) => {
  try {
    const payload = req.body;
    const addedManga = await localMysqlServices.insertManga([[
      payload.title,
      payload.link,
      payload.status,
      new Date(Date.now())
    ]]);
    res.statusCode = 201;
    res.json({
      status: "success",
      message: `Berhasil menambahkan lists manga baru dengan ID ${addedManga.inserId}`,
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

const postAddNewMangaBulkController = async (req, res) => {
  try {
    const payload = req.body;
    const restucturePayload = payload.dataManga.map((data) => [data.title, data.link, data.status, new Date(Date.now())]);
    const addedManga = await localMysqlServices.insertManga(restucturePayload);
    res.statusCode = 201;
    res.json({
      status: "success",
      message: `Berhasil menambahkan ${addedManga.affectedRows} lists manga`,
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

const putListMangaController = async (req, res) => {
  try {
    const { listId } = req.params;
    const payload = req.body;
    await localMysqlServices.updateMangaById(listId, payload);
    res.json({
      status: "success",
      message: "Berhasil memperbarui list",
    });
  } catch (error) {
    if (error instanceof ClientError) {
      res.statusCode = error.statusCode;
      res.json({
        status: "fail",
        message: error.message,
      });
    }
    console.log(error);
    res.statusCode = 500;
    res.json({
      status: "error",
      message: "Terjadi kegagalan pada server kami"
    });
  }
};

const deleteListMangaController = async (req, res) => {
  try {
    const { listId } = req.params;
    await localMysqlServices.deleteMangaById(listId);
  } catch (error) {
    if (error instanceof ClientError) {
      res.statusCode = error.statusCode;
      res.json({
        status: "fail",
        message: error.message,
      });
    }
    console.log(error);
    res.statusCode = 500;
    res.json({
      status: "error",
      message: "Terjadi kegagalan pada server kami"
    });
  }
};



const postSettingController = async (req, res) => {
  try {
    const {
      userId,
    } = req.session;
    const payload = req.body;
    console.log(payload);
    await localMysqlServices.createOrUpdateSetting(userId, payload);
    res.json({
      status: "success",
      msg: "Berhasil menambahkan setting",
    })
  } catch (error) {
    console.log(error);
    res.json({
      status: "error",
      msg: "Terjadi kegagalan pada server",
    });
  }
};


module.exports = {
  homePageController,
  grabPageController,
  listsPageController,
  settingPageController,
  accountPageController,
  postAccountController,
  postGrebMangaWithCharController,
  postAddNewMangaController,
  putListMangaController,
  deleteListMangaController,
  postAddNewMangaBulkController,
  postSettingController,
};
