require("dotenv").config();
const mysql = require("mysql");
const slugs = require("slugs");

const PREFIXDB = process.env.PREFIX_WP;

const configDB = mysql.createPool({
  host: process.env.WP_HOST,
  user: process.env.WP_USER,
  password: process.env.WP_PASSWORD,
  port: process.env.WP_PORT,
  database: process.env.WP_DATABASE,
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

// Select Table Posts where Title Manga Init
const selectPostsByTitleManga = async (title) => {
  const conn = await connectToDatabase(configDB);
  const sqlString = `SELECT * FROM ${PREFIXDB}_posts WHERE post_title=? AND post_author=1  ORDER BY post_modified ASC LIMIT 1`;
  const sqlEscapeVal = [title];
  // console.info(logging(sqlString, sqlEscapeVal));
  const checkPosts = await queryDatabase(conn, sqlString, sqlEscapeVal);
  if (checkPosts.length < 1) throw new Error("MYSQL_NOTFOUND_POST");
  return checkPosts[0].ID;
};

// Insert Table Posts Manga Init
const insertPostsManga = async (data) => {
  const date = new Date();
  const conn = await connectToDatabase(configDB);
  const sqlString = `INSERT INTO ${PREFIXDB}_posts (post_author, post_date, post_date_gmt, post_modified, post_modified_gmt, post_content, post_title, post_name, guid, post_type, post_status, ping_status, post_excerpt, to_ping, pinged, post_content_filtered) VALUES ?`;
  const sqlEscapeVal = [[[
    1,
    new Date(date.getTime()),
    new Date(date.getTime()),
    new Date(date.getTime()),
    new Date(date.getTime()),
    data.description,
    data.title,
    slugs(data.title),
    "",
    "manga",
    "publish",
    "closed",
    "",
    "",
    "",
    "",
  ]]];
  // console.info(logging(sqlString, sqlEscapeVal));
  const insertedPost = await queryDatabase(conn, sqlString, sqlEscapeVal);
  if (insertedPost.affectedRows < 1) throw new Error("MYSQL_INSERT_POST");
  return insertedPost.insertId;
};

// Update Table Posts Manga Init
const updatePostsManga = async (data, postId) => {
  const date = new Date();
  const conn = await connectToDatabase(configDB);
  const sqlString = `UPDATE ${PREFIXDB}_posts SET post_author=?, post_modified=?, post_modified_gmt=?, post_content=?, post_title=?, post_name=?, guid=?, post_type=?, post_status=?, ping_status=?, post_excerpt=?, to_ping=?, pinged=?, post_content_filtered=? WHERE ID=?`;
  const sqlEscapeVal = [
    [1], 
    [new Date(date.getTime())],
    [new Date(date.getTime())],
    [data.description],
    [data.title],
    [slugs(data.title)],
    [""],
    ["manga"],
    ["publish"],
    ["closed"],
    [""],
    [""],
    [""],
    [""],
    [postId]
  ];
  // console.info(logging(sqlString, sqlEscapeVal));
  const updatedPost = await queryDatabase(conn, sqlString, sqlEscapeVal);
  if (updatedPost.affectedRows < 1) throw new Error("MYSQL_POST_UPDATE");
  return postId;
};

// Update Or Create Posts Manga Init
exports.updateOrCreatePostsManga = async (data) => {
  try {
    const postsId = await selectPostsByTitleManga(data.title);
    const updatedPostId = await updatePostsManga(data, postsId);
    return updatedPostId;
  } catch (error) {
    if (error.message === "MYSQL_NOTFOUND_POST") {
      const postsId = await insertPostsManga(data);
      return postsId;
    }
    throw new Error(error.message);
  }
};

// Update Guid
exports.updateGuid = async (postId, urlWordpress) => {
  const conn = await connectToDatabase(configDB);
  const sqlString = `UPDATE ${PREFIXDB}_posts SET guid=? WHERE ID=?`;
  const sqlEscapeVal = [[`${urlWordpress}/?p=${postId}`], [postId]];
  // console.info(logging(sqlString, sqlEscapeVal));
  const updatedPostGuid = await queryDatabase(conn, sqlString, sqlEscapeVal);
  if (updatedPostGuid.affectedRows < 1) throw new Error("MYSQL_UPDATE_GUID");
};

// Insert Table PostMeta
exports.insertPostMeta = async (dataForInsert) => {
  const conn = await connectToDatabase(configDB);
  const sqlString = `INSERT INTO ${PREFIXDB}_postmeta (post_id, meta_key, meta_value) VALUES ?`;
  const sqlEscapeVal = [dataForInsert];
  // console.info(logging(sqlString, sqlEscapeVal));
  const insertedPostMeta = await queryDatabase(conn, sqlString, sqlEscapeVal);
  if (insertedPostMeta.affectedRows < 1) throw new Error("MYSQL_INSERT_POST_META");
  return insertedPostMeta.insertId;
};

// Insert Table Terms
const insertTerms = async (name) => {
  const conn = await connectToDatabase(configDB);
  const sqlString = `INSERT INTO ${PREFIXDB}_terms (name, slug) VALUES ?`;
  const sqlEscapeVal = [[
    [name, slugs(name)]
  ]];
  // console.info(logging(sqlString, sqlEscapeVal));
  const insertedTerms = await queryDatabase(conn, sqlString, sqlEscapeVal);
  if (insertedTerms.affectedRows < 1) throw new Error("MYSQL_INSERT_TERMS");
  return insertedTerms.insertId;
};

// Select Table Terms By Name
const selectTermsByName = async (name) => {
  const conn = await connectToDatabase(configDB);
  const sqlString = `SELECT * FROM ${PREFIXDB}_terms WHERE name=? LIMIT 1`;
  const sqlEscapeVal = [name];
  // console.info(logging(sqlString, sqlEscapeVal));
  const result = await queryDatabase(conn, sqlString, sqlEscapeVal);
  if (result.length < 1) throw new Error("MYSQL_NOTFOUND_TERMS");
  return result[0].term_id;
};

// Select TermsId Or Create Terms
exports.selectOrCreateTerms = async (name) => {
  try {
    const termsId = await selectTermsByName(name);
    return termsId;
  } catch (error) {
    if (error.message === "MYSQL_NOTFOUND_TERMS") {
      const termsId = await insertTerms(name);
      return termsId;
    }
    throw new Error(error.message);
  }
};

// Insert Table Term Taxonomy (manga Init -> genres | chapter -> category)
const insertTaxonomy = async (termId, taxonomy) => {
  const conn = await connectToDatabase(configDB);
  const sqlString = `INSERT INTO ${PREFIXDB}_term_taxonomy (term_id, taxonomy, description) VALUES?`;
  const sqlEscapeVal = [[[termId, taxonomy, ""]]];
  // console.info(logging(sqlString, sqlEscapeVal));
  const insertedTaxonomy = await queryDatabase(conn, sqlString, sqlEscapeVal);
  if (insertedTaxonomy.affectedRows < 1) throw new Error("MYSQL_INSERT_TAXONOMY");
  return insertedTaxonomy.insertId;
};

// Select Table Term Taxonomy
const selectTermTaxonomyWhereTermId = async (termId) => {
  const conn = await connectToDatabase(configDB);
  const sqlString = `SELECT * FROM ${PREFIXDB}_term_taxonomy WHERE term_id=? LIMIT 1`;
  const sqlEscapeVal = [termId];
  // console.info(logging(sqlString, sqlEscapeVal));
  const result = await queryDatabase(conn, sqlString, sqlEscapeVal);
  if (result.length < 1) throw new Error("MYSQL_NOTFOUND_TAXONOMY");
  return result[0].term_taxonomy_id;
};

// Select TaxonomyId Or Create Taxonomy
exports.selectOrCreateTaxonomy = async (termId, taxonomy) => {
  try {
    const taxonomyId = await selectTermTaxonomyWhereTermId(termId);
    return taxonomyId;
  } catch (error) {
    if (error.message === "MYSQL_NOTFOUND_TAXONOMY") {
      const taxonomyId = await insertTaxonomy(termId, taxonomy);
      return taxonomyId;
    }
    throw new Error(error.message);
  }
};

// Update Count + 1 Table Term Taxonomy
exports.updateTaxonomyCount = async (taxonomyId) => {
  const connRead = await connectToDatabase(configDB);
  const sqlStringRead = `SELECT * FROM ${PREFIXDB}_term_taxonomy WHERE term_taxonomy_id=?`;
  const sqlEscapeValRead = [taxonomyId];
  // console.info(logging(sqlStringRead, sqlEscapeValRead));
  const resultRead = await queryDatabase(connRead, sqlStringRead, sqlEscapeValRead);
  if (resultRead.length < 1) throw new Error("MYSQL_NOTFOUND_TAXONOMY");
  const connUpdate = await connectToDatabase(configDB);
  const sqlStringUpdate = `UPDATE ${PREFIXDB}_term_taxonomy SET count=?`;
  const sqlEscapeValUpdate = [resultRead[0].count + 1];
  // console.info(logging(sqlStringUpdate, sqlEscapeValUpdate));
  const updatedTaxonomyCount = await queryDatabase(connUpdate, sqlStringUpdate, sqlEscapeValUpdate);
  if (updatedTaxonomyCount.affectedRows < 1) throw new Error("MYSQL_UPDATE_COUNT_TAXONOMY");
  return taxonomyId;
};

// Insert Table Term Relationship
const insertTermRelationship = async (postId, taxonomyId) => {
  const conn = await connectToDatabase(configDB);
  const sqlString = `INSERT INTO ${PREFIXDB}_term_relationships (object_id, term_taxonomy_id) VALUES ?`;
  const sqlEscapeVal = [[[postId, taxonomyId]]];
  // console.info(logging(sqlString, sqlEscapeVal));
  const insertedRelation = await queryDatabase(conn, sqlString, sqlEscapeVal);
  if (insertedRelation.affectedRows < 1) throw new Error("MYSQL_UPDATE_COUNT_TAXONOMY");
  return taxonomyId;
};

// Select Table Term Relationship
const selectTermRelationship = async (postId, taxonomyId) => {
  const conn = await connectToDatabase(configDB);
  const sqlString = `SELECT * FROM ${PREFIXDB}_term_relationships WHERE object_id=? AND term_taxonomy_id=?`;
  const sqlEscapeVal = [[postId], [taxonomyId]];
  // console.info(logging(sqlString, sqlEscapeVal));
  const termRelationship = await queryDatabase(conn, sqlString, sqlEscapeVal);
  if (termRelationship.length < 1) throw new Error("MYSQL_NOTFOUND_RELATIONSHIP");
};

// Update Table Term Relationship
const updateTermRelationship = async (postId, taxonomyId) => {
  const conn = await connectToDatabase(configDB);
  const sqlString = `UPDATE ${PREFIXDB}_term_relationships SET object_id=?, term_taxonomy_id=? WHERE object_id=? AND term_taxonomy_id=?`;
  const sqlEscapeVal = [[postId], [taxonomyId], [postId], [taxonomyId]];
  // console.info(logging(sqlString, sqlEscapeVal));
  const updatedTermRelationship = await queryDatabase(conn, sqlString, sqlEscapeVal);
  if (updatedTermRelationship.affectedRows < 1) throw new Error("MYSQL_UPDATE _RELATIONSHIP");
}

// Update Or Create Term Relationship
exports.updateOrCreateTermRelationship = async (postId, taxonomyId) => {
  try {
    await selectTermRelationship(postId, taxonomyId);
    await updateTermRelationship(postId, taxonomyId);
  } catch (error) {
    if (error.message === "MYSQL_NOTFOUND_RELATIONSHIP") {
      return insertTermRelationship(postId, taxonomyId);
    }
    throw new Error(error.message);
  }
};

// Insert Table Posts Images Manga Init
const insertPostImage = async (postId, data) => {
  const date = new Date();
  const conn = await connectToDatabase(configDB);
  const sqlString = `INSERT INTO ${PREFIXDB}_posts (post_author, post_date, post_date_gmt, post_modified, post_modified_gmt, post_content, post_title, post_name, guid, post_type, post_status, ping_status, post_parent, post_mime_type, post_excerpt, to_ping, pinged, post_content_filtered) VALUES ?`;
  const sqlEscapeVal = [[[
    77777,
    new Date(date.getTime()),
    new Date(date.getTime()),
    new Date(date.getTime()),
    new Date(date.getTime()),
    data.description,
    data.title,
    " ",
    data.ero_image,
    "attachment",
    "inherit",
    "open",
    postId,
    "image/jpeg",
    "",
    "",
    "",
    "",
  ]]];
  // console.info(logging(sqlString, sqlEscapeVal));
  const insertedPost = await queryDatabase(conn, sqlString, sqlEscapeVal);
  if (insertedPost.affectedRows < 1) throw new Error("MYSQL_INSERT_POST_IMAGE");
  return insertedPost.insertId;
};

// Select Table Post Images Manga Init
const selectPostImage = async (postParent) => {
  const conn = await connectToDatabase(configDB);
  const sqlString = `SELECT * FROM ${PREFIXDB}_posts WHERE post_parent=?`;
  const sqlEscapeVal = [postParent];
  // console.info(logging(sqlString, sqlEscapeVal));
  const postImages = await queryDatabase(conn, sqlString, sqlEscapeVal);
  if (postImages.length < 1) throw new Error("MYSQL_NOTFOUND_POST_IMAGE");
  return postImages[0].post_parent;
};

// Update Table Posts Images Manga Init
const updatePostImage = async (postParent, data) => {
  const date = new Date();
  const conn = await connectToDatabase(configDB);
  const sqlString = `UPDATE ${PREFIXDB}_posts SET post_author=?, post_modified=?, post_modified_gmt=?, post_content=?, post_title=?, guid=?, post_type=?, post_status=?, ping_status=?, post_parent=?, post_mime_type=?, post_excerpt=?, to_ping=?, pinged=?, post_content_filtered=? WHERE post_parent=?`;
  const sqlEscapeVal = [
    [77777],
    [new Date(date.getTime())],
    [new Date(date.getTime())],
    [data.description],
    [data.title],
    [data.ero_image],
    ["attachment"],
    ["inherit"],
    ["open"],
    [postParent],
    ["image/jpeg"],
    [""],
    [""],
    [""],
    [""],
    [postParent],
  ];
  // console.info(logging(sqlString, sqlEscapeVal));
  const updatedPostImages = await queryDatabase(conn, sqlString, sqlEscapeVal);
  if (updatedPostImages.affectedRows < 1) throw new Error("MYSQL_UPDATE_POST_IMAGE");
  return postParent;
};

// Update Or Create Posts Image Manga Init
exports.updateOrCreatePostImage = async (postParent, data) => {
  try {
    const postImageId = await selectPostImage(postParent);
    const updatedPostImageId = await updatePostImage(postImageId, data);
    return updatedPostImageId;
  } catch (error) {
    if (error.message === "MYSQL_NOTFOUND_POST_IMAGE") {
      const postImageId = await insertPostImage(postParent, data);
      return postImageId;
    }
    throw new Error(error.message);
  }
};

// Select Table Posts By Id From Manga Init To Chapter Or General Select Posts By Id
exports.selectPostsById = async (parentPostId) => {
  const conn = await connectToDatabase(configDB);
  const sqlString = `SELECT * FROM ${PREFIXDB}_posts WHERE ID=?`;
  const sqlEscapeVal = [parentPostId];
  // console.info(logging(sqlString, sqlEscapeVal));
  const posts = await queryDatabase(conn, sqlString, sqlEscapeVal);
  if (posts.length < 1) throw new Error("MYSQL_NOTFOUND_POST_PARENT");
  return posts[0];
};

// Select Table Posts By Title Chapter
const selectPostsByTitleChapter = async (postTitle) => {
  const conn = await connectToDatabase(configDB);
  const sqlString = `SELECT * FROM ${PREFIXDB}_posts WHERE post_title=?`;
  const sqlEscapeVal = [postTitle];
  // console.info(logging(sqlString, sqlEscapeVal));
  const posts = await queryDatabase(conn, sqlString, sqlEscapeVal);
  if (posts.length < 1) throw new Error("MYSQL_NOTFOUND_EXITING_POST");
  return posts[0].ID;
};

// Insert Table Posts Chapter
const insertPostsChapter = async (data) => {
  const date = new Date();
  const conn = await connectToDatabase(configDB);
  const sqlString = `INSERT INTO ${PREFIXDB}_posts (post_author, post_date, post_date_gmt, post_modified, post_modified_gmt, post_content, post_title, post_name, guid, post_type, post_status, post_excerpt, to_ping, pinged, post_content_filtered) VALUES ?`;
  const sqlEscapeVal = [[[
    1,
    new Date(date.getTime()),
    new Date(date.getTime()),
    new Date(date.getTime()),
    new Date(date.getTime()),
    "",
    data.title,
    slugs(data.title),
    "",
    "post",
    "publish",
    "",
    "",
    "",
    "",
  ]]];
  // console.info(logging(sqlString, sqlEscapeVal));
  const insertedPost = await queryDatabase(conn, sqlString, sqlEscapeVal);
  if (insertedPost.affectedRows < 1) throw new Error("MYSQL_INSERT_POST");
  return insertedPost.insertId;
};

// Update Table Posts By Id Chapter
const updatePostsByIdChapter = async (data, postId) => {
  const date = new Date();
  const conn = await connectToDatabase(configDB);
  const sqlString = `UPDATE ${PREFIXDB}_posts SET post_author=?, post_modified=?, post_modified_gmt=?, post_content=?, post_title=?, post_name=?, guid=?, post_type=?, post_status=?, post_excerpt=?, to_ping=?, pinged=?, post_content_filtered=? WHERE ID=?`;
  const sqlEscapeVal = [
    [1],
    [new Date(date.getTime())],
    [new Date(date.getTime())],
    [""],
    [data.title],
    [slugs(data.title)],
    [""],
    ["post"],
    ["publish"],
    [""],
    [""],
    [""],
    [""],
    [postId]
  ];
  // console.info(logging(sqlString, sqlEscapeVal));
  const updatedPost = await queryDatabase(conn, sqlString, sqlEscapeVal);
  if (updatedPost.affectedRows < 1) throw new Error("MYSQL_UPDATE_POST");
  return postId;
};

// Update Or Create Posts Chapter
exports.updateOrCreatePostsChapter = async (data) => {
  try {
    const postId = await selectPostsByTitleChapter(data.title);
    await updatePostsByIdChapter(data, postId);
    return postId;
  } catch (error) {
    if (error.message === "MYSQL_NOTFOUND_EXITING_POST") {
      const postId = await insertPostsChapter(data);
      return postId;
    }
  }
};

// Update Modify Date Parent Post Chapter
exports.updateModifyDateParentPostChapter = async (postInitId) => {
  const date = new Date();
  const conn = await connectToDatabase(configDB);
  const sqlString = `UPDATE ${PREFIXDB}_posts SET post_modified=?, post_modified_gmt=? WHERE ID=?`;
  const sqlEscapeVal = [[new Date(date.getTime())], [new Date(date.getTime())], postInitId];
  // console.info(logging(sqlString, sqlEscapeVal));
  const updatedParentPost = await queryDatabase(conn, sqlString, sqlEscapeVal);
  if (updatedParentPost.affectedRows < 1) throw new Error("MYSQL_UPDATE_POST_PARENT");
};

// Select Table Posts id In PostMeta Table Where ero_seri = parent post id (Chapter)
exports.selectPostIdInPostMetaChapter = async (parentId) => {
  const conn = await connectToDatabase(configDB);
  const sqlString = `SELECT post_id FROM ${PREFIXDB}_postmeta WHERE meta_key=? AND meta_value=?`;
  const sqlEscapeVal = [["ero_seri"], [parentId]];
  // console.info(logging(sqlString, sqlEscapeVal));
  const results = await queryDatabase(conn, sqlString, sqlEscapeVal);
  if (results.length < 1) throw new Error("MYSQL_NOTFOUND_POST_META_WHERE_ERO_SERI");
  const postIds = results.map((result) => result.post_id);
  // console.log(postIds);
  return postIds;
};

// Select 3 Latest Chapter From Table PostMeta Id (Chapter)
exports.selectLatestChapter = async (ids) => {
  const conn = await connectToDatabase(configDB);
  // console.log(ids.join(","))
  const sqlString = `SELECT * FROM ${PREFIXDB}_postmeta WHERE meta_key=? AND post_id IN ? ORDER BY meta_value DESC LIMIT 3`;
  const sqlEscapeVal = [["ero_chapter"], [ids]];
  // console.info(logging(sqlString, sqlEscapeVal));
  const postMetas = await queryDatabase(conn, sqlString, sqlEscapeVal);
  if (postMetas.length < 1) throw new Error("MYSQL_NOTFOUND_POST_META_WHERE_ERO_CHAPTER");
  return postMetas;
};

// Select Ero Latest From Table Post Meta Where meta_value=ero_latest (Chapter)
const selectErolatestFromPostmetaChapter = async (parentPostId) => {
  const conn = await connectToDatabase(configDB);
  const sqlString = `SELECT * FROM ${PREFIXDB}_postmeta WHERE meta_key=? AND post_id=? LIMIT 1`;
  const sqlEscapeVal = [["ero_latest"], [parentPostId]];
  // console.info(logging(sqlString, sqlEscapeVal));
  const postMetas = await queryDatabase(conn, sqlString, sqlEscapeVal);
  if (postMetas.length < 1) throw new Error("MYSQL_NOTFOUND_POST_META_WHERE_ERO_LATEST");
  return postMetas[0].postId;
};

// Update Ero Latest To Table Post meta Where meta_value=ero_latest (Chapter)
const updateEroLatestFromPostmetaChapter = async (eroLatestVal, parentPostId) => {
  const conn = await connectToDatabase(configDB);
  const sqlString = `UPDATE ${PREFIXDB}_postmeta SET meta_value=? WHERE meta_key=? AND post_id=?`;
  const sqlEscapeVal = [[eroLatestVal], ["ero_latest"], [parentPostId]];
  // console.info(logging(sqlString, sqlEscapeVal));
  const updatedLatestPostmeta = await queryDatabase(conn, sqlString, sqlEscapeVal);
  if (updatedLatestPostmeta.affectedRows < 1) throw new Error("MYSQL_UPDATE_POST_META_ERO_LATEST");
  return parentPostId;
};

// Insert Ero Latest To Table Post Meta Chapter
const insertEroLatestFromPostmetaChapter = async (eroLatest) => {
  const conn = await connectToDatabase(configDB);
  const sqlString = `INSERT INTO ${PREFIXDB}_postmeta (post_id, meta_key, meta_value) VALUES ?`;
  const sqlEscapeVal = [eroLatest];
  // console.info(logging(sqlString, sqlEscapeVal));
  const insertedLatestPostmeta = await queryDatabase(conn, sqlString, sqlEscapeVal);
  if (insertedLatestPostmeta.affectedRows < 1) throw new Error("MYSQL_INSERT_POST_META_ERO_LATEST");
  return insertedLatestPostmeta.insertId;
};

exports.updateOrCreateEroLatestChapter = async (parentPostId, eroLatest) => {
  try {
    await selectErolatestFromPostmetaChapter(parentPostId);
    await updateEroLatestFromPostmetaChapter(eroLatest[0][2], parentPostId);
  } catch (error) {
    if (error.message === "MYSQL_NOTFOUND_POST_META_WHERE_ERO_LATEST") {
      await insertEroLatestFromPostmetaChapter(eroLatest);
    }
  };
};

exports.getPostIdWherePostName = async (title) => {
  const conn = await connectToDatabase(configDB);
  const sqlString = `SELECT * FROM ${PREFIXDB}_posts WHERE post_name=? LIMIT 1`;
  const sqlEscapeVal = [slugs(title)];
  // console.info(logging(sqlString, sqlEscapeVal));
  const posts = await queryDatabase(conn, sqlString, sqlEscapeVal);
  if (posts.length < 1) throw new Error("MYSQL_NOTFOUND_SELECT_POST_NAME");
  return posts[0].ID;
};

exports.getTotalChapterWhereEroSeri = async (eroSeri) => {
  const conn = await connectToDatabase(configDB);
  const sqlString = `SELECT COUNT(DISTINCT post_id) AS total_chapters FROM ${PREFIXDB}_postmeta WHERE meta_key=? AND meta_value=?`;
  const sqlEscapeVal = [["ero_seri"], [eroSeri]];
  // console.info(logging(sqlString, sqlEscapeVal));
  const result = await queryDatabase(conn, sqlString, sqlEscapeVal);
  if (result[0].total_chapters < 1) throw new Error("MYSQL_COUNT_POST_META");
  return result[0].total_chapters;
};
