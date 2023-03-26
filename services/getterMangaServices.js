const axios = require("axios");
const cheerio = require("cheerio");
const path = require("path");
const fs = require("fs");

const getMangaWithSplitChar = async (character, maxData) => {
  const { data } = await axios.get("https://kiryuu.id/manga/list-mode");
  const $ = cheerio.load(data);
  const resultLists = [];
  $(".series").each((_idx, el) => {
    const title = $(el).text();
    const link = $(el).attr("href");
    if (title.charAt(0) === character && _idx <= maxData) {
      resultLists.push({
        title,
        link,
      });
    }
  });
  return resultLists;
};

// (async () => {
//   const { data } = await axios.get("https://kiryuu.id/manga/list-mode");
//   // console.log(data);
//   const $ = cheerio.load(data);

//   const lists = [];

//   $(".series").each((_idx, el) => {
//     const title = $(el).text();
//     const link = $(el).attr("href");
//     if (title.charAt(0) === "A" && _idx <= 100) {
//       lists.push({
//         title,
//         link,
//       });
//     }
//   });
//   console.log(lists);
// })()

(async () => {
  const { data } = await axios.get("https://kiryuu.id/manga/?genre%5B%5D=37&genre%5B%5D=4&status=ongoing&type=manhua");
  // console.log(data);
  fs.writeFileSync(path.join(__dirname, "index.html"), data);
  // console.log(data);
  // const $ = cheerio.load(data);

  // const lists = [];

  // $(".series").each((_idx, el) => {
  //   const title = $(el).text();
  //   const link = $(el).attr("href");
  //   if (title.charAt(0) === "A" && _idx <= 100) {
  //     lists.push({
  //       title,
  //       link,
  //     });
  //   }
  // });
  console.log(lists);
})()