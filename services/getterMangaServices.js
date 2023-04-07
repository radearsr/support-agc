require("dotenv").config();
const mysql = require("mysql");
const axios = require("axios");
const cheerio = require("cheerio");
const NotFoundError = require("../exceptions/NotFoundError");
const fs = require("fs");

const getMangaWithSplitChar = async (endpoint, character, maxData) => {
  const { data } = await axios.get(`${endpoint}/manga/list-mode`);
  const $ = cheerio.load(data);
  const resultLists = [];

  if (character === "all") {
    $(".series").each((idx, el) => {
      let title = $(el).text();
      const link = $(el).attr("href");
      if (resultLists.length < maxData) {
        title = title.replace(/Bahasa Indonesia|bahasa indonesia|Indonesia/g, '').trim();
        title = title.replace(/’/g, '\'');
        resultLists.push({
          title,
          link,
        });
      }
    });
    if (resultLists.length < 1) throw new NotFoundError("Lists manga tidak ditemukan");
    return resultLists;
  }

  $(".series").each((idx, el) => {
    const title = $(el).text();
    const link = $(el).attr("href");
    if ((title.charAt(0) === character) && (resultLists.length < maxData)) {
      resultLists.push({
        title,
        link,
      });
    }
  });
  if (resultLists.length < 1) throw new NotFoundError("Lists manga tidak ditemukan");
  return resultLists;
};

const getMangaGenres = async (endpoint) => {
  const { data } = await axios.get(`${endpoint}/manga/`);
  const $ = cheerio.load(data);
  const resultLists = [];

  $(".genre-item").each((idx, el) => {
    const id = $(el).attr("value");
    const name = $(el).next().text();
    resultLists.push([
      id,
      name,
    ]);
  });
  if (resultLists.length < 1) throw new NotFoundError("Lists genre tidak ditemukan");
  return resultLists;
};

// (async () => {
//   const result = await getMangaGenres("https://kiryuu.id/");
//   const conn = await connectToDatabase(configDB);
//   const query = await queryDatabase(conn, "INSERT INTO manga_genres (id_genre, name) VALUES ?", [result]);
//   console.log(query);
// })()

const getMangaWithCategory = async (endpoint, genresId="all", status, type, order) => {
  let dataHtml;
  if (genresId !== "all") {
    const mappedGenresId = genresId.map((id) => (`genre%5B%5D=${id}`));
    const genresForUrl = mappedGenresId.join("&");
    const { data } = await axios.get(`${endpoint}/manga?${genresForUrl}&status=${status === "all" ? "" : status}&type=${type === "all" ? "" : type}&order=${order === "default" ? "" : order}`);
    dataHtml = data;
  } else {
    const { data } = await axios.get(`${endpoint}/manga/?status=${status === "all" ? "" : status}&type=${type === "all" ? "" : type}&order=${order === "default" ? "" : order}`);
    dataHtml = data;
  }
  // console.log(dataHtml);
  // fs.writeFileSync("./index.html", dataHtml)
  const $ = cheerio.load(dataHtml);
  const resultLists = [];
  $(".bsx").each((_idx, el) => {
    const title = $(el).children("a").attr("title");
    const link = $(el).children("a").attr("href");
    console.log({ title, link });
    resultLists.push({
      title,
      link,
    });
  });
  if (resultLists.length < 1) throw new NotFoundError("Lists manga tidak ditemukan");
  return resultLists;
};

module.exports = {
  getMangaWithSplitChar,
  getMangaWithCategory,
};
