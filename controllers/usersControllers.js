const ClientError = require("../exceptions/ClientError");
const localMysqlServices = require("../services/localMysqlServices");
const securityServices = require("../services/securityServices");
const { logging, currentFormatDate } = require("../services/utils");


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
    await localMysqlServices.checkAvailableEmail(payload.email);
    const hashedPassword = await securityServices.hashingPassword(payload.password);
    await localMysqlServices.createNewUser({
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
    logging.error(currentFormatDate());
    logging.error(error);
    currentPageStatus.code = 500;
    currentPageStatus.msg = "terjadi kegagalan pada server kami";
    return res.redirect("/register");
  }
};

const postLoginController = async (req, res) => {
  try {
    const payload = req.body;
    const userCredential = await localMysqlServices.getUserWhereEmail(payload.email);
    await securityServices.comparePassword(payload.password, userCredential.password);
    currentPageStatus.code = 200;
    currentPageStatus.msg = "Berhasil login";
    req.session.userId = userCredential.id;
    req.session.fullname = userCredential.fullname;
    req.session.role = userCredential.role;
    res.redirect("/dashboard");
  } catch (error) {
    if (error instanceof ClientError) {  
      currentPageStatus.code = error.statusCode;
      currentPageStatus.msg = error.message;
      return res.redirect("/login");
    }
    logging.error(currentFormatDate());
    logging.error(error);
    currentPageStatus.code = 500;
    currentPageStatus.msg = "Terjadi kegagalan pada server kami"
    return res.redirect("/login");
  }
};

const logoutController = (req, res) => {
  req.session.destroy();
  res.redirect("/login");
};

module.exports = {
  loginPageController,
  registerPageController,
  postRegisterController,
  postLoginController,
  logoutController,
};
