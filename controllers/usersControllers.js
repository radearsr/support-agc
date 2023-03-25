const ClientError = require("../exceptions/ClientError");
const intMysqlServices = require("../services/internalMysqlServices");

const loginPageController = (req, res) => {
  res.render("pages/login", {
    title: "Login - Support AGC",
  });
};

const registerPageController = (req, res) => {
  return res.render("pages/register", {
    title: "Register - Support AGC",
    statusCode: 200,
  });
};

const postRegisterController = async (req, res) => {
  try {
    const payload = req.body;
    console.log(payload);
    await intMysqlServices.checkAvailableEmail(payload.email);
    const createdNewUser = await intMysqlServices.createNewUser(payload);
    return res.render("pages/register", {
      ...createdNewUser,
      statusCode: 201,
      title: "Register - Support AGC",
    });
  } catch (error) {
    if (error instanceof ClientError) {
      res.statusCode = error.statusCode;
      return res.render("pages/register", {
        statusCode: error.statusCode,
        msg: error.message,
        title: "Register - Support AGC",
      });
    }
    res.statusCode = 500;
    return res.render("pages/register", {
      statusCode: 500,
      msg: "Terjadi kegagalan pada server kami",
      title: "Register - Support AGC",
    });
  }
};

module.exports = {
  loginPageController,
  registerPageController,
  postRegisterController
};
