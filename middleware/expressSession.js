exports.checkUserCredentials = (req, res, next) => {
  if (!req.session) return res.redirect("/login");
  const {
    userId,
    fullname,
    role,
  } = req.session;
  if (!userId && !fullname && !role) return res.redirect("/login");
  next();
};

exports.checkLoginStatus = (req, res, next) => {
  const {
    userId,
    fullname,
    role,
  } = req.session;
  if (userId && fullname && role) return res.redirect("/dashboard");
  next();
};
