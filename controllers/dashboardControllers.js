const homePageController = (req, res) => {
  res.render("pages/home", {
    title: "Home - Dashboard Support AGC",
    fullName: "Super Admin",
    roleName: "Administrator",
    activePage: "Home",
  });
};

const grabPageController = (req, res) => {
  res.render("pages/grab", {
    title: "Grab - Dashboard Support AGC",
    fullName: "Super Admin",
    roleName: "Administrator",
    activePage: "Grab",
  });
};

const listsPageController = (req, res) => {
  res.render("pages/lists", {
    title: "Lists - Dashboard Support AGC",
    fullName: "Super Admin",
    roleName: "Administrator",
    activePage: "Lists",
  });
};

const settingPageController = (req, res) => {
  res.render("pages/setting", {
    title: "Setting - Dashboard Support AGC",
    fullName: "Super Admin",
    roleName: "Administrator",
    activePage: "Setting",
  });
};

const accountPageController = (req, res) => {
  res.render("pages/account", {
    title: "Account - Dashboard Support AGC",
    fullName: "Super Admin",
    roleName: "Administrator",
    activePage: "Account",
  });
};

module.exports = {
  homePageController,
  grabPageController,
  listsPageController,
  settingPageController,
  accountPageController,
};
