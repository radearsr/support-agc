require("dotenv").config();
const mysql = require("mysql");
const AuthenticationError = require("../exceptions/AuthenticationError");
const AuthorizationError = require("../exceptions/AuthorizationError");
const InvariantError = require("../exceptions/InvariantError");

const configDB = mysql.createPool({
  host: process.env.INT_HOST,
  user: process.env.INT_USER,
  password: process.env.INT_PASSWORD,
  port: process.env.INT_PORT,
  database: process.env.INT_DATABASE,
});

// Create Connection To Database
const connectToDatabase = (pool) => (new Promise((resolve, reject) => {
  pool.getConnection((error, conn) => {
    if (error) reject(error);
    resolve(conn);
  });
}));

// Create Query Action To Database
const queryDatabase = (connection, sqlString, escapeStrValue) => (new Promise((resolve, reject) => {
  connection.query(sqlString, escapeStrValue, (error, result) => {
    if (error) reject(error);
    resolve(result);
  });
  connection.release();
}));

// Display Logging SQL
const logging = (sqlString, escapeStrValue) => {
  return mysql.format(sqlString, escapeStrValue);
};

exports.checkAvailableEmail = async (email) => {
  const conn = await connectToDatabase(configDB);
  const sqlString = "SELECT * FROM users WHERE email=?";
  const sqlEscapeVal = [email];
  console.info(logging(sqlString, sqlEscapeVal));
  const results = await queryDatabase(conn, sqlString, sqlEscapeVal);
  if (results.length >= 1) throw new InvariantError("Gagal email sudah tersedia. silahkan login untuk masuk");
};

exports.createNewUser = async (payload) => {
  const conn = await connectToDatabase(configDB);
  const sqlString = "INSERT INTO users (fullname, role, email, password) VALUES ?";
  const sqlEscapeVal = [[[
    payload.fullname,
    "Administrator",
    payload.email,
    payload.password
  ]]];
  console.info(logging(sqlString, sqlEscapeVal));
  const createdUser = await queryDatabase(conn, sqlString, sqlEscapeVal);
  console.log(createdUser);
  if (createdUser.affectedRows < 1) throw new InvariantError("Gagal membuat user baru, silahkan coba kembali");
  return {
    userId: createdUser.insertId,
    fullname: payload.fullname,
  };
};

exports.getUserWhereEmail = async (email) => {
  const conn = await connectToDatabase(configDB);
  const sqlString = "SELECT * FROM users WHERE email=?";
  const sqlEscapeVal = [email];
  console.info(logging(sqlString, sqlEscapeVal));
  const results = await queryDatabase(conn, sqlString, sqlEscapeVal);
  if (results.length < 1) throw new InvariantError("Gagal akun tidak tersedia");
  return results[0];
};

exports.getUserProfileByUserId = async (userId) => {
  const conn = await connectToDatabase(configDB);
  const sqlString = "SELECT * FROM users WHERE id=?";
  const sqlEscapeVal = [userId];
  console.info(logging(sqlString, sqlEscapeVal));
  const results = await queryDatabase(conn, sqlString, sqlEscapeVal);
  if (results.length < 1) throw new AuthorizationError("ID user tidak terdaftar");
  return results[0];
};

exports.updateUserProfile = async (userId, payload) => {
  const conn = await connectToDatabase(configDB);
  const sqlString = "UPDATE users SET fullname=?, email=?, password=? WHERE id=?";
  const sqlEscapeVal = [[payload.fullname], [payload.email], [payload.password], [userId]];
  console.info(logging(sqlString, sqlEscapeVal));
  const results = await queryDatabase(conn, sqlString, sqlEscapeVal);
  if (results.affectedRows < 1) throw new InvariantError("Gagal memperbarui profile");
};

exports.getDataAllGenres = async () => {
  const conn = await connectToDatabase(configDB);
  const sqlString = "SELECT * FROM manga_genres";
  const results = await queryDatabase(conn, sqlString);
  console.info(logging(sqlString));
  if (results.length < 1) throw new InvariantError("Data genre tidak tersedia");
  return results;
};


