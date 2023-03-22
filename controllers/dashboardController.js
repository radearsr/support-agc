exports.homePageController = (req, res) => {
  res.render("pages/index", { title: "Dashboard", fullName: "Super Admin" });
};
