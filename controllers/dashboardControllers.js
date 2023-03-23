const homePageController = (req, res) => {
  res.render("pages/home", {
    title: "Home - Dashboard Support AGC",
    fullName: "Super Admin",
    roleName: "Administrator",
  });
};

const grabPageController = (req, res) => {
  res.render("pages/grab", {
    title: "Grab - Dashboard Support AGC",
    fullName: "Super Admin",
    roleName: "Administrator",
  });
};

const listsPageController = (req, res) => {
  res.render("pages/lists", {
    title: "Lists - Dashboard Support AGC",
    fullName: "Super Admin",
    roleName: "Administrator",
  });
};

const settingPageController = (req, res) => {
  res.render("pages/setting", {
    title: "Setting - Dashboard Support AGC",
    fullName: "Super Admin",
    roleName: "Administrator",
  });
};

const accountPageController = (req, res) => {
  res.render("pages/account", {
    title: "Account - Dashboard Support AGC",
    fullName: "Super Admin",
    roleName: "Administrator",
  });
};

module.exports = {
  homePageController,
  grabPageController,
  listsPageController,
  settingPageController,
  accountPageController,
};
