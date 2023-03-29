const actionAgcServices = require("./services/actionAgcServices");
const getterMangaServices = require("./services/getterAgcServices");

(async () => {
  const detailManga = await getterMangaServices.getTokenAndGetDetailManga("https://agc.mangakio.net", "https://kiryuu.id/manga/jiangshi-x", "admin@gmail.com", "p4ssw0rd");
  console.log(detailManga.data.chapters[0]);
  const chapterManga = await getterMangaServices.getTokenAndGetChapterManga("https://agc.mangakio.net", detailManga.data.chapters[0].read_link, "admin@gmail.com", "p4ssw0rd");
  console.log(chapterManga);
})()
