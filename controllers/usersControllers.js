const loginPageController = (req, res) => {
  res.render("pages/login", {
    title: "Login - Support AGC",
  });
};

const registerPageController = (req, res) => {
  res.render("pages/register", {
    title: "Register - Support AGC",
  });
};

module.exports = {
  loginPageController,
  registerPageController,
};
