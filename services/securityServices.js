const bcrypt = require("bcrypt");
const AuthenticationError = require("../exceptions/AuthenticationError");

const hashingPassword = async (plainText) => {
  const hashedPassword = await bcrypt.hash(plainText, 10);
  return hashedPassword;
};

const comparePassword = async (plainText, passwordHash) => {
  const result = await bcrypt.compare(plainText, passwordHash);
  if (!result) throw new AuthenticationError("password yang anda masukkan salah, silahkan coba kembali");
};

module.exports = {
  hashingPassword,
  comparePassword,
};
