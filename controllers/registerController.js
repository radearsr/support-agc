exports.registerPageController = (req, res) => {
  res.render("pages/register", { title: "Register - Denonime", fullName: "Super Admin" });
}

exports.registerPostController = (req, res) => {}