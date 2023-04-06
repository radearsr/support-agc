require("dotenv").config();
const mysql = require("mysql");
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
  // console.info(logging(sqlString, sqlEscapeVal));
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
  // console.info(logging(sqlString, sqlEscapeVal));
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
  // console.info(logging(sqlString, sqlEscapeVal));
  const results = await queryDatabase(conn, sqlString, sqlEscapeVal);
  if (results.length < 1) throw new InvariantError("Gagal akun tidak tersedia");
  return results[0];
};

exports.getUserProfileByUserId = async (userId) => {
  const conn = await connectToDatabase(configDB);
  const sqlString = "SELECT * FROM users WHERE id=?";
  const sqlEscapeVal = [userId];
  // console.info(logging(sqlString, sqlEscapeVal));
  const results = await queryDatabase(conn, sqlString, sqlEscapeVal);
  if (results.length < 1) throw new AuthorizationError("ID user tidak terdaftar");
  return results[0];
};

exports.updateUserProfile = async (userId, payload) => {
  const conn = await connectToDatabase(configDB);
  const sqlString = "UPDATE users SET fullname=?, email=?, password=? WHERE id=?";
  const sqlEscapeVal = [[payload.fullname], [payload.email], [payload.password], [userId]];
  // console.info(logging(sqlString, sqlEscapeVal));
  const results = await queryDatabase(conn, sqlString, sqlEscapeVal);
  if (results.affectedRows < 1) throw new InvariantError("Gagal memperbarui profile");
};

exports.getDataAllGenres = async () => {
  const conn = await connectToDatabase(configDB);
  const sqlString = "SELECT * FROM manga_genres";
  const results = await queryDatabase(conn, sqlString);
  // console.info(logging(sqlString));
  if (results.length < 1) throw new InvariantError("Data genre tidak tersedia");
  return results;
};

exports.insertManga = async (values) => {
  const conn = await connectToDatabase(configDB);
  const sqlString = "INSERT INTO lists (title, link, status, createdAt) VALUES ?";
  const sqlEscapeVal = [values];
  // console.info(logging(sqlString, sqlEscapeVal));
  const insertedManga = await queryDatabase(conn, sqlString, sqlEscapeVal);
  if (insertedManga.affectedRows < 1) throw new InvariantError("Gagal menambahakan manga baru");
  return insertedManga;
};

exports.updateMangaById = async (listId, values) => {
  const conn = await connectToDatabase(configDB);
  const sqlString = "UPDATE lists SET title=?, link=?, status=? WHERE id=?";
  const sqlEscapeVal = [[values.title], [values.link], [values.status], [listId]];
  console.info(logging(sqlString, sqlEscapeVal));
  const updatedManga = await queryDatabase(conn, sqlString, sqlEscapeVal);
  if (updatedManga.affectedRows < 1) throw new InvariantError("Gagal Memperbarui List");
};

exports.deleteMangaById = async (listId) => {
  const conn = await connectToDatabase(configDB);
  const sqlString = "DELETE FROM lists WHERE id=?";
  const sqlEscapeVal = [[listId]];
  console.info(logging(sqlString, sqlEscapeVal));
  const deletedManga = await queryDatabase(conn, sqlString, sqlEscapeVal);
  console.log(deletedManga);
  if (insertedManga.affectedRows < 1) throw new InvariantError("Gagal Menghapus List");
};

exports.getDataAllListsManga = async (skip, keyword, take) => {
  const conn = await connectToDatabase(configDB);
  const sqlString = "SELECT * FROM lists WHERE title LIKE ? ORDER BY createdAt DESC LIMIT ?, ?";
  const sqlEscapeVal = [[`%${keyword.toLowerCase()}%`], [skip], [take]];
  // console.info(logging(sqlString, sqlEscapeVal));
  const results = await queryDatabase(conn, sqlString, sqlEscapeVal);
  if (results.length < 1) throw new NotFoundError("lists manga tidak ditemukan");
  return results;
};

exports.getCountAllListsManga = async (keyword) => {
  const conn = await connectToDatabase(configDB);
  const sqlString = `SELECT COUNT(*) AS total_data FROM lists WHERE title LIKE ?`;
  const sqlEscapeVal = [[`%${keyword.toLowerCase()}%`]];
  // console.info(logging(sqlString, sqlEscapeVal));
  const results = await queryDatabase(conn, sqlString, sqlEscapeVal);
  if (results[0].total_data < 1) throw new NotFoundError("lists manga tidak ditemukan");
  return results[0].total_data; 
};

exports.getDataAllListsMangaASC = async () => {
  const conn = await connectToDatabase(configDB);
  const sqlString = "SELECT * FROM lists WHERE status='1' ORDER BY createdAt ASC";
  // const sqlEscapeVal = [[limit]];
  // console.info(logging(sqlString, sqlEscapeVal));
  const results = await queryDatabase(conn, sqlString);
  if (results.length < 1) throw new NotFoundError("lists manga tidak ditemukan");
  return results;
};

const insertSetting = async (userId, payload) => {
  const conn = await connectToDatabase(configDB);
  const sqlString = "INSERT INTO settings (linkAgc, userId, emailAgc, passwordAgc, linkWordpress, telegramId) VALUES ?";
  const sqlEscapeVal = [[[payload.linkAgc, userId, payload.emailAgc, payload.passwordAgc, payload.linkWordpress, payload.idTelegram]]];
  // console.info(logging(sqlString, sqlEscapeVal));
  const results = await queryDatabase(conn, sqlString, sqlEscapeVal);
  if (results.affectedRows < 1) throw new InvariantError("Gagal menyimpan data");
  return results.insertId;
};

const updateSetting = async (userId, payload) => {
  const conn = await connectToDatabase(configDB);
  const sqlString = "UPDATE settings SET linkAgc=?, emailAgc=?, passwordAgc=?, linkWordpress=?, telegramId=? WHERE userId=?";
  const sqlEscapeVal = [[payload.linkAgc], [payload.emailAgc], [payload.passwordAgc], [payload.linkWordpress], [payload.idTelegram], [userId]];
  // console.info(logging(sqlString, sqlEscapeVal));
  const updatedSetting = await queryDatabase(conn, sqlString, sqlEscapeVal);
  if (updatedSetting.affectedRows < 1) throw new InvariantError("Gagal memperbarui setting");
};

const selectSettingWithUserId = async (userId) => {
  const conn = await connectToDatabase(configDB);
  const sqlString = "SELECT * FROM settings WHERE userId=?";
  const sqlEscapeVal = [[userId]];
  // console.info(logging(sqlString, sqlEscapeVal));
  const resultSetting =  await queryDatabase(conn, sqlString, sqlEscapeVal);
  if (resultSetting.length < 1) throw new NotFoundError("Setting belum tersedia");
};

exports.getSettingWithUserId = async (userId) => {
  const conn = await connectToDatabase(configDB);
  const sqlString = "SELECT * FROM settings WHERE userId=?";
  const sqlEscapeVal = [[userId]]
  // console.info(logging(sqlString, sqlEscapeVal));
  const result = await queryDatabase(conn, sqlString, sqlEscapeVal);
  if (result.length < 1) throw new NotFoundError("Setting tidak ditemukan");
  return result;
};

exports.getSettingWithoutUserId = async () => {
  const conn = await connectToDatabase(configDB);
  const sqlString = "SELECT * FROM settings LIMIT 1";
  const result = await queryDatabase(conn, sqlString);
  // console.info(logging(sqlString));
  if (result.length < 1) throw new NotFoundError("Setting tidak ditemukan");
  return result[0];
};

exports.createOrUpdateSetting = async (userId, payload) => {
  try {
    await selectSettingWithUserId(userId);
    await updateSetting(userId, payload);
  } catch (error) {
    if (error.message === "Setting belum tersedia") {
      await insertSetting(userId, payload);
    }
    console.error(error.message);
  }
};
