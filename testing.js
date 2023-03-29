const { Cron } = require("croner");
const actionAgcServices = require("./services/actionAgcServices");
const getterMangaServices = require("./services/getterAgcServices");

(async () => {
  // Get Details Manga
  const detailManga = await getterMangaServices.getTokenAndGetDetailManga("https://agc.mangakio.net", "https://kiryuu.id/manga/jiangshi-x", "admin@gmail.com", "p4ssw0rd");
  console.log(detailManga.data);
  // Get And Post Manga Chapter
  const mangaChapters = detailManga.data.chapters;
  mangaChapters.forEach(async (chapter, idx) => {
    setTimeout(async () => {
      const chapterManga = await getterMangaServices.getTokenAndGetChapterManga("https://agc.mangakio.net", chapter.read_link, "admin@gmail.com", "p4ssw0rd");
      console.log(chapterManga.data.title); 
    }, 5000 * idx);
  });
})();


