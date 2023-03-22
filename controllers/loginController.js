exports.loginPageController = (req, res) => {
  res.render("pages/login", { title: "Login - Denonime", fullName: "Super Admin" });
}

exports.loginPostControler = (req, res) => {}
