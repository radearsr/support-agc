const ClientError = require("../exceptions/ClientError");
const intMysqlServices = require("../services/internalMysqlServices");
const securityServices = require("../services/securityServices");

const currentPageStatus = {
  code: 200,
  msg:"",
};

const loginPageController = (req, res) => {
  res.render("pages/login", {
    title: "Login - Support AGC",
    statusCode: currentPageStatus.code,
    msg: currentPageStatus.msg,
  });
  currentPageStatus.code = 200;
  currentPageStatus.msg = "";
};

const registerPageController = (req, res) => {
  res.render("pages/register", {
    title: "Register - Support AGC",
    statusCode: currentPageStatus.code,
    msg: currentPageStatus.msg,
  });
  currentPageStatus.code = 200;
  currentPageStatus.msg = "";
};

const postRegisterController = async (req, res) => {
  try {
    const payload = req.body;
    await intMysqlServices.checkAvailableEmail(payload.email);
    const hashedPassword = await securityServices.hashingPassword(payload.password);
    const createdNewUser = await intMysqlServices.createNewUser({
      ...payload,
      password: hashedPassword,
    });
    currentPageStatus.code = 201;
    currentPageStatus.msg = `Berhasil membuat akun dengan email ${payload.email}`;
    return res.redirect("/register");
  } catch (error) {
    if (error instanceof ClientError) {
      currentPageStatus.code = error.statusCode;
      currentPageStatus.msg = error.message;
      return res.redirect("/register");
    }
    console.log(error);
    currentPageStatus.code = 500;
    currentPageStatus.msg = "terjadi kegagalan pada server kami";
    return res.redirect("/register");
  }
};

const postLoginController = async (req, res) => {
  try {
    const payload = req.body;
    const userCredential = await intMysqlServices.getUserWhereEmail(payload.email);
    await securityServices.comparePassword(payload.password, userCredential.password);
    currentPageStatus.code = 200;
    currentPageStatus.msg = "Berhasil login";
    return res.redirect("/dashboard");
  } catch (error) {
    if (error instanceof ClientError) {  
      currentPageStatus.code = error.statusCode;
      currentPageStatus.msg = error.message;
      return res.redirect("/login");
    }
    currentPageStatus.code = 500;
    currentPageStatus.msg = "Terjadi kegagalan pada server kami"
    return res.redirect("/login");
  }
};

module.exports = {
  loginPageController,
  registerPageController,
  postRegisterController,
  postLoginController,
};
