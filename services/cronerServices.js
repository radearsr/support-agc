const actionAgcServices = require("./actionAgcServices");
const getterMangaServices = require("./getterAgcServices");
const wpMysqlServices = require("../services/wpMysqlServices");
// const publishedManga = await getterMangaServices.postMangaPublish("https://agc.mangakio.net", "admin@gmail.com", "p4ssw0rd", detailManga.data);

const cronActionPublish = async (linkAgc, linksManga, email, password, linkWp) => {
  console.log({linkAgc, linksManga, email, password, linkWp})
  linksManga.forEach(async (linkManga, idx) => {
    setTimeout(async () => {
      // Check Available Post In Wordpress

      // Get Details Manga
      const detailManga = await getterMangaServices.getTokenAndGetDetailManga(linkAgc, linkManga, email, password);
      const publishedMangaId = await actionAgcServices.mangaPublish(detailManga.data, linkWp);
      // Get And Post Manga Chapter
      const mangaChapters = detailManga.data.chapters;
      mangaChapters.forEach(async (chapter, idx) => {
        setTimeout(async () => {
          // console.log({ linkAgc, linkChapter, email, password });
          const chapterManga = await getterMangaServices.getTokenAndGetChapterManga(linkAgc, chapter.read_link, email, password);
          await actionAgcServices.publishChapter(chapterManga.data, publishedMangaId, linkWp);
        }, 2000 * idx);
      });
    }, idx * 60000);
  });
};

(async () => {
 cronActionPublish("https://agc.deyapro.com", ["https://kiryuu.id/manga/good-hunting/"], "megumi@kyo.com", "iloveyou", "https://wordpress");
})()
