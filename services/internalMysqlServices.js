require("dotenv").config();
const mysql = require("mysql");
const AuthenticationError = require("../exceptions/AuthenticationError");
const AuthorizationError = require("../exceptions/AuthorizationError");
const InvariantError = require("../exceptions/InvariantError");
const NotFoundError = require("../exceptions/NotFoundError");

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

exports.insertManga = async (values) => {
  const conn = await connectToDatabase(configDB);
  const sqlString = "INSERT INTO lists (title, link, status, createdAt) VALUES ?";
  const sqlEscapeVal = [values];
  console.info(logging(sqlString, sqlEscapeVal));
  const insertedManga = await queryDatabase(conn, sqlString, sqlEscapeVal);
  if (insertedManga.affectedRows < 1) throw new InvariantError("Gagal menambahakan manga baru");
  return insertedManga.insertId;
};

exports.getDataAllListsManga = async () => {
  const conn = await connectToDatabase(configDB);
  const sqlString = "SELECT * FROM lists ORDER BY createdAt DESC";
  console.info(logging(sqlString));
  const results = await queryDatabase(conn, sqlString);
  if (results.length < 1) throw new NotFoundError("lists manga tidak ditemukan");
  return results;
};

exports.saveSetting = async (payload) => {
  const conn = await connectToDatabase(configDB);
  const sqlString = "INSERT INTO settings (halaman_agc, email_agc, password_agc, id_telegram, tipe_schedule, action_count, cron_pattern) VALUES ?";
  const sqlEscapeVal = [[[payload.linkAgc, payload.emailAgc, payload.passwordAgc, payload.idTelegram, payload.tipeSchedule, payload.actionCount, payload.cronPattern]]];
  const results = await queryDatabase(conn, sqlString, sqlEscapeVal);
  if (results.affectedRows < 1) throw new InvariantError("Gagal menyimpan data");
  return results.insertId;
};


