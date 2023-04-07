const { serialize, unserialize } = require("php-serialize");
const { Console } = require("console");
const fs = require("fs");
const path = require("path");

// Create My Own Logging
exports.logging = new Console({
  stdout: fs.createWriteStream(path.join(__dirname, "../errorLog/accessLog.log")),
  stderr: fs.createWriteStream(path.join(__dirname, "../errorLog/errorLog.log")), 
});

exports.currentFormatDate = () => {
  const date = new Date();
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let seconds = date.getSeconds();
  minutes = minutes < 10 ? "0" + minutes : minutes;
  const strTime = `${hours}:${minutes}:${seconds}`;
  return `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()} ${strTime}`;
};

exports.restructureObject = (data) => {
  const renamedData = {}

  Object.keys(data).map((key) => {
    switch (key) {
      case "cover":
        renamedData["ero_cover"] = data[key];
        break;
      case "thumbnail":
        renamedData["ero_image"] = data[key];
        break;
      case "status":
        renamedData["ero_status"] = data[key];
        break;
      case "author":
        renamedData["ero_author"] = data[key];
        break;
      case "author":
        renamedData["ero_artist"] = data[key];
        break;
      case "type":
        renamedData["ero_type"] = data[key];
        break;
      case "released":
        renamedData["ero_published"] = data[key];
        break;
      case "rating":
        renamedData["ero_score"] = data[key];
        break;
      case "serialization":
        renamedData["ero_serialization"] = data[key];
        break;
      case "alternative":
        renamedData["ero_japanese"] = data[key];
        break;
      case "genres_array":
        renamedData["genres"] = data[key];
        break;
      default :
        renamedData[key] = data[key];
        break;
    }
  });
  renamedData["ero_project"] = "0";
  return renamedData;
};

exports.restructureObjectChapter = (data, postParent) => {
  const renamedData = {};

  Object.keys(data).map((key) => {
    switch(key) {
      case "title":
        break;
      case "images":
        break;
      case "slug":
        break;
      case "chapter":
        renamedData["ero_chapter"] = data["chapter"].split("Chapter ")[1];
        break;
      default :
        renamedData[key] = data[key];
        break;
    }
  });

  const imageWithTag = data.images.map((image) => {
    return `<img src="${image}">`;
  });
  const embedGroupObj = {
    ab_hostname: "Server Bawaan",
    ab_embed: imageWithTag.join(""),
    _state:  "expanded",
  };
  renamedData["ero_seri"] = postParent;
  renamedData["ero_imagecdn"] = "disable";
  renamedData["ab_embedgroup"] = serialize([embedGroupObj]);
  renamedData["wpb_post_views_count"] = 2;
  return renamedData;
};

exports.firstPostMetaChapter = (postId, data) => {
  const devMeta = ["ero_seri", "ero_chapter", "ero_imagecdn", "ab_embedgroup", "wpb_post_views_count"];
  const resultPayload = devMeta.map((meta) => {
    return {
      post_id: postId,
      meta_key: meta,
      meta_value: data[meta],
    }
  });
  const restructureToMysqlEscape = resultPayload.map((value) => [value.post_id, value.meta_key, value.meta_value]);
  return restructureToMysqlEscape;
}

exports.createFirstPostMetaField = (postId, data, title) => {
  const devMeta = ["ero_hot", "ero_project", "ero_image", "ero_japanese", "ero_english", "ero_type", "ero_author", "ero_published", "ero_serialization", "ero_score", "ero_status", "ero_cover", "ero_synonyms"];
  const resultPayload = devMeta.map((meta) => {
    return {
      post_id: postId,
      meta_key: meta,
      meta_value: data[meta],
    }
  });
  const resultFilteredPayload = resultPayload.filter((payload) => payload.meta_value !== undefined);
  const mangaMeta = {
    wpb_post_views_count: 0,
    onesignal_meta_box_present: 1,
    onesignal_send_notification: " ",
    fifu_image_url: data["ero_image"],
    fifu_image_alt: title,
    ero_autogenerateimgcat: 1,
    ero_latest: serialize([]),
  };
  Object.keys(mangaMeta).forEach((meta) => {
    resultFilteredPayload.push({
      post_id: postId,
      meta_key: meta,
      meta_value: mangaMeta[meta],
    });
  });
  const restructureToMysqlEscape = resultFilteredPayload.map((value) => [value.post_id, value.meta_key, value.meta_value]);
  return restructureToMysqlEscape;
};

exports.createSecondPostMetaField = (postId, postImageId, data) => {
  const objectPostMeta = [
    {
      post_id: postId,
      meta_key: "_wp_attachment_image_alt",
      meta_value: data.title,
    },
    {
      post_id: postId,
      meta_key: "_wp_attached_file",
      meta_value: data.ero_image,
    },
    {
      post_id: postId,
      meta_key: "_thumbnail_id",
      meta_value: postImageId,
    }
  ];
  const restructureToMysqlEscape = objectPostMeta.map((value) => [value.post_id, value.meta_key, value.meta_value]);
  return restructureToMysqlEscape;
};

exports.createLatestPostmeta = (chapterPostId, numChapter, slugChapter, postModified) => {
  const date = new Date(postModified);
  const sevenHours = 1000 * 60 * 60 * 7;
  const resultTime = date.getTime() + sevenHours;
  return {
    id: chapterPostId,
    chapter: numChapter,
    permalink: slugChapter,
    time: resultTime,
  }
};

exports.createEroLatestPostMetaField = (parentPostId, eroLatest) => {
  const objectPostMeta = [{
    post_id: parentPostId,
    meta_key: "ero_latest",
    meta_value: serialize(eroLatest),
  }];
  const restructureToMysqlEscape = objectPostMeta.map((value) => [value.post_id, value.meta_key, value.meta_value]);
  return restructureToMysqlEscape;
};
