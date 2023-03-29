const wpMysqlServices = require("./wpMysqlServices");
const utils = require("./utils");

const mangaPublish = async (data, linkWordpress) => {
  try {
    // Insert To Post Table And Return ID
    const idFirstPost = await wpMysqlServices.updateOrCreatePostsManga(data);
    // Update Link Wordpress
    await wpMysqlServices.updateGuid(idFirstPost, linkWordpress);
    // Rename Object Key
    const renamedData = utils.restructureObject(data);
    // Restructure To Insert PostMeta Table
    const fDataForInsertPostMeta = utils.createFirstPostMetaField(idFirstPost, renamedData, data.title);
    // Insert PostMeta Table
    await wpMysqlServices.insertPostMeta(fDataForInsertPostMeta);
    // Insert Genres
    data.genres_array.forEach(async (genre) => {
      // Create Or Get Term
      const termsId = await wpMysqlServices.selectOrCreateTerms(genre);
      // Create Or Get Term Taxonomy
      const taxonomyId = await wpMysqlServices.selectOrCreateTaxonomy(termsId, "genres");
      // Update Count Taxonomy
      await wpMysqlServices.updateTaxonomyCount(taxonomyId);
      // Update Term Relationship
      await wpMysqlServices.updateOrCreateTermRelationship(idFirstPost, taxonomyId);
    });
    // Update Or Create Post Image
    const postImageId = await wpMysqlServices.updateOrCreatePostImage(idFirstPost, renamedData);
    // Restructure To Insert PostMeta Image Table
    const sDataForInsertPostMeta = utils.createSecondPostMetaField(idFirstPost, postImageId, renamedData);
    await wpMysqlServices.insertPostMeta(sDataForInsertPostMeta);
    return idFirstPost;
  } catch (error) {
    throw new Error(error.message);
  }
};

const publishChapter = async (data, parentPostId, urlWordpress) => {
  try {
    // Get Parent Post By Id
    const parentPosts = await wpMysqlServices.selectPostsById(parentPostId);
    // Update Or Create Post Chapter
    const postId = await wpMysqlServices.updateOrCreatePostsChapter(data);
    // Update Guid in Post Chapter
    await wpMysqlServices.updateGuid(postId, urlWordpress);
    // Rename Data For Create Post Meta
    const restructurePayload = utils.restructureObjectChapter(data, parentPostId);
    // Create Object To MysqlescapeStr
    const fDataForInsertPostMeta = utils.firstPostMetaChapter(postId, restructurePayload)
    // Insert Post Meta Chapter
    await wpMysqlServices.insertPostMeta(fDataForInsertPostMeta);
    // Update Modify Field in Parent Post
    await wpMysqlServices.updateModifyDateParentPostChapter(parentPostId, parentPostId);
    // Select Or Insert Table Term With Param post_title Parent Post
    const termId = await wpMysqlServices.selectOrCreateTerms(parentPosts.post_title);
    // Select Or Insert Table Term Taxonomy With Param termId
    const termTaxonomyId = await wpMysqlServices.selectOrCreateTaxonomy(termId, "category");
    // Update Count In Table termTaxonomy
    await wpMysqlServices.updateTaxonomyCount(termTaxonomyId);
    // Update Or Create Table Term Relationship
    await wpMysqlServices.updateOrCreateTermRelationship(postId, termTaxonomyId);
    // Select PostId From Table PostMeta Where Ero Seri = Parent Post Id
    const postsId = await wpMysqlServices.selectPostIdInPostMetaChapter(parentPostId);
    // Select Latest Chapter From PostMeta
    const latestChapters = await wpMysqlServices.selectLatestChapter(postsId);
    // Create Ero latest Field
    const eroLatest = await Promise.all(latestChapters.map(async (latestChap) => {
      // Select Post Chapter
      const postChapter = await wpMysqlServices.selectPostsById(latestChap.post_id);
      // Restructure Value To Insert Postmeta
      const restuctureEroLatest = utils.createLatestPostmeta(latestChap.post_id, latestChap.meta_value, postChapter.post_name, postChapter.post_modified);
      return restuctureEroLatest;
    }));
    // Create Ero Latest to ready insert
    const restructureErolatest = utils.createEroLatestPostMetaField(parentPostId, eroLatest);
    // Update or Create Post Meta Field ero_latest
    await wpMysqlServices.updateOrCreateEroLatestChapter(parentPostId, restructureErolatest);
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

module.exports = {
  mangaPublish,
  publishChapter,
};
