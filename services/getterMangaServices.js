require("dotenv").config();
const axios = require("axios");
const cheerio = require("cheerio");

const getMangaWithSplitChar = async (endpoint, character, maxData) => {
  const { data } = await axios.get(`${endpoint}/manga/list-mode`);
  const $ = cheerio.load(data);
  const resultLists = [];
  $(".series").each((idx, el) => {
    const title = $(el).text();
    const link = $(el).attr("href");
    if ((title.charAt(0) === character) && (resultLists.length <= maxData)) {
      resultLists.push({
        title,
        link,
      });
    }
  });
  return resultLists;
};

const getMangaWithCategory = async (endpoint, genresId, status, type, order) => {
  const mappedGenresId = genresId.map((id) => (`genre%5B%5D=${id}`));
  const genresForUrl = mappedGenresId.join("&");
  const { data } = await axios.get(`${endpoint}/manga?${genresForUrl}&status=${status}&type=${type}&order=${order}`);
  const $ = cheerio.load(data);
  const resultLists = [];
  $(".bsx").each((_idx, el) => {
    const title = $(el).children("a").attr("title");
    const link = $(el).children("a").attr("href");
    lists.push({
      title,
      link,
    });
  });
  return resultLists;
};

module.exports = {
  getMangaWithSplitChar,
  getMangaWithCategory,
};
