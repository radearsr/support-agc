const ClientError = require("../exceptions/ClientError");
const intMysqlServices = require("../services/internalMysqlServices");
const securityServices = require("../services/securityServices");

const loginPageController = (req, res) => {
  res.render("pages/login", {
    title: "Login - Support AGC",
  });
};

const registerPageController = (req, res) => {
  const { statusCode=200 , msg="" } = req.query;
  console.log(req.query);
  return res.render("pages/register", {
    title: "Register - Support AGC",
    statusCode: parseFloat(statusCode),
    msg,
  });
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
    return res.redirect(`/register?statusCode=${201}&msg=${createdNewUser.fullname}`);
  } catch (error) {
    if (error instanceof ClientError) {
      res.statusCode = error.statusCode;
      return res.render("pages/register", {
        statusCode: error.statusCode,
        msg: error.message,
        title: "Register - Support AGC",
      });
    }
    console.log(error);
    res.statusCode = 500;
    return res.render("pages/register", {
      statusCode: 500,
      msg: "Terjadi kegagalan pada server kami",
      title: "Register - Support AGC",
    });
  }
};

const postLoginController = async (req, res) => {
  try {
    const payload = req.body;
    const userCredential = await intMysqlServices.getUserWhereEmail(payload.email);
    await securityServices.comparePassword(payload.password, userCredential.password);
    res.redirect("/dashboard");
  } catch (error) {
    if (error instanceof ClientError) {
      res.statusCode = error.statusCode;
      return res.redirect(`/login?statusCode=${error.statusCode}&msg=${error.message}`);
    }
    res.statusCode = 500;
    return res.render(`/login?statusCode=500&msg=Terjadi kegagalan pada server`);
  }
};

module.exports = {
  loginPageController,
  registerPageController,
  postRegisterController,
  postLoginController,
};
