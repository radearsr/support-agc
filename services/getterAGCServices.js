const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

const readCookieFromFile = (pathToFile) => (
  new Promise((resolve, reject) => {
    fs.readFile(pathToFile, "utf8", (err, jsonStr) => {
      if (err) {
        reject(err);
      }
      resolve(jsonStr);
    })
  })
);

const writeCookieToFile = (key, token="") => {
  const values = {
    key,
    token
  };
  const jsonString = JSON.stringify(values)
  return new Promise((resolve, reject) => {
    fs.writeFile(path.join(__dirname, "./sessionCookies.json"), jsonString, err => {
      if (err) {
        reject("Error writing file", err);
      }
      resolve("success");
    })
  });
};

const getSessionAndTokenForLogin = async (endpoint) => {
  const response = await axios({
    method: "get",
    url: `${endpoint}/login`,
    headers: {
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
    }
  });
  const xsrfToken = response.headers["set-cookie"][0].split(";")[0];
  const session = response.headers["set-cookie"][1].split(";")[0];
  const arrCookie = [xsrfToken, session];
  const cookie = arrCookie.join(";");

  // CSRF TOKEN
  const htmlHead = response.data.split("<title>")[0];
  const contentCSRF = htmlHead.split("content");
  const content = contentCSRF[contentCSRF.length - 1];
  const csrfSplited = content.split("\"");
  const csrf = csrfSplited[1]
  
  return {
    cookie,
    csrf,
  };
};

const getSessionAndToken = async (headCookie, endpoint) => {
  const response = await axios({
    method: "get",
    url: `${endpoint}/dashboard`,
    headers: {
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
      "cookie": `${headCookie}`,
    }
  });
  // CSRF TOKEN
  const htmlHead = response.data.split("<title>")[0];
  const contentCSRF = htmlHead.split("content");
  // console.log(contentCSRF[5]);
  const content = contentCSRF[5];
  const csrfSplited = content.split("\"");
  // console.log(csrfSplited);
  const csrf = csrfSplited[1];
  return csrf;
};

const loginAndGetSessionCookie = async (headCookie, payload, endpoint) => {
  const bodyFormData = new FormData();
  bodyFormData.append("_token", payload.token);
  bodyFormData.append("email", payload.email);
  bodyFormData.append("password", payload.password);

  const response = await axios({
    method: "post",
    url: `${endpoint}/login`,
    data: bodyFormData,
    headers: { 
      "Content-Type": "multipart/form-data",
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0. 0.0 Safari/537.36",
      "cookie": `${headCookie}`,
    },
  });
  const xsrfToken = response.headers["set-cookie"][0].split(";")[0];
  const session = response.headers["set-cookie"][1].split(";")[0];
  const arrCookie = [xsrfToken, session];
  const cookie = arrCookie.join(";");
  return cookie;
};

const getDetailManga = async (headCookie, url, proxy, endpoint) => {
  // console.log({ headCookie, url, proxy, endpoint })
  const response = await axios({
    method: "get",
    url: `${endpoint}/dashboard/manga`,
    params: {
      url,
      proxy,
    },
    headers: {
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
      "cookie": `${headCookie}`,
    }
  });
  const result = response.data;
  return {
    result
  };
};

const getMangaChapter = async (headCookie, url, proxy, endpoint) => {
  // console.log({ headCookie, url, proxy, endpoint })
  const response = await axios({
    method: "get",
    url: `${endpoint}/dashboard/manga/chapter`,
    params: {
      url,
      proxy,
    },
    headers: {
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
      "cookie": `${headCookie}`,
    }
  });
  const result = response.data;
  return {
    result
  };
};

const postDetailsManga = async (headCookie, payloadToken, details, endpoint) => {
  const bodyFormData = new FormData();
  // console.log(headCookie, payloadToken);
  bodyFormData.append("_token", payloadToken);
  bodyFormData.append("title", details.title);
  bodyFormData.append("desc", details.description);
  bodyFormData.append("manga_adult_content", "NO");
  bodyFormData.append("ero_project", "0");
  bodyFormData.append("ero_type", details.type);
  bodyFormData.append("ero_image", details.thumbnail);
  bodyFormData.append("ero_cover", "");
  bodyFormData.append("ero_japanese", details.alternative);
  bodyFormData.append("ero_status", details.status);
  bodyFormData.append("ero_author", details.author);
  bodyFormData.append("ero_published", details.released);
  bodyFormData.append("ero_score", parseFloat(details.rating));
  bodyFormData.append("ero_artist", details.author);
  bodyFormData.append("genres", details.genres_array.join(",+"));
  bodyFormData.append("tags", details.tags);

  const response = await axios({
    method: "post",
    url: `${endpoint}/dashboard/manga/publish`,
    data: bodyFormData,
    headers: { 
      "Content-Type": "multipart/form-data",
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0. 0.0 Safari/537.36",
      "cookie": `${headCookie}`,
    },
  });

  return response.data.data;
}

const postMangaChapter = async (chapter, postId, headCookie, payloadToken) => {
  const bodyFormData = new FormData();
  console.log(headCookie, payloadToken);
  // console.log(chapter.images);
  const chapterImageMapped = chapter.images.map((img) => {
    return `<img src="${img}">`;
  });
  const finalChapter = chapterImageMapped.join("");
  // console.log(finalChapter);  
  bodyFormData.append("_token", payloadToken);
  bodyFormData.append("title", chapter.title);
  bodyFormData.append("ero_chapter", chapter.chapter);
  bodyFormData.append("content", "");
  bodyFormData.append("content_clonekuma", "");
  bodyFormData.append("id_google_drive", "");
  bodyFormData.append("content_bawaan", `${finalChapter}`);
  bodyFormData.append("ero_seri", postId);
  bodyFormData.append("search_terms", "");
  bodyFormData.append("server_bawaan", "on");
  bodyFormData.append("mulai", "");
  bodyFormData.append("sampai", "");
  bodyFormData.append("log", "");

  const response = await axios({
    method: "post",
    url: `${BASE_URL}/dashboard/manga/chapter`,
    data: bodyFormData,
    headers: { 
      "Content-Type": "multipart/form-data",
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0. 0.0 Safari/537.36",
      "cookie": `${headCookie}`,
    },
  });

  return response.data.data;
};

exports.postMangaPublish = async (endpoint, email, password, payload) => {
  try {
    // console.log({endpoint, email, password, payload});
    const cookieJson = await readCookieFromFile(path.join(__dirname, "./sessionCookies.json"));
    const { key: cookie, token: csrf } = JSON.parse(cookieJson);
    const responsePublish = await postDetailsManga(cookie, csrf, payload, endpoint);
    // console.log(responsePublish);
    return responsePublish;
  } catch (error) {
    console.error(error);
    if (error.response.status === 401 && error.response.data.message === "Unauthenticated.") {
      const { cookie: key, csrf } = await getSessionAndTokenForLogin(endpoint);
      const cookie = await loginAndGetSessionCookie(key, {
        token: csrf,
        email,
        password,
      }, endpoint);
      const csrfForPublish = await getSessionAndToken(cookie, endpoint);
      await writeCookieToFile(cookie, csrfForPublish);
      const responsePublish = await postDetailsManga(cookie, csrfForPublish, payload, endpoint);
      return responsePublish;
    }
  }
};

exports.getTokenAndGetDetailManga = async (endpoint, linkManga, email, password) => {
  try {
    // console.log({endpoint, linkManga, email, password});
    const cookieJson = await readCookieFromFile(path.join(__dirname, "./sessionCookies.json"));
    const { key: cookie } = JSON.parse(cookieJson);
    const response = await getDetailManga(cookie, linkManga, "", endpoint);
    return response.result;
  } catch (error) {
    // console.error(error);
    if (error.response.status === 401 && error.response.data.message === "Unauthenticated.") {
      const { cookie: key, csrf } = await getSessionAndTokenForLogin(endpoint);
      const cookie = await loginAndGetSessionCookie(key, {
        token: csrf,
        email,
        password,
      }, endpoint);
      console.log(cookie);
      const csrfForPublish = await getSessionAndToken(cookie, endpoint);
      await writeCookieToFile(cookie, csrfForPublish);
      const response = await getDetailManga(cookie, linkManga, "", endpoint);
      return response.result;
    }
    // console.error(error);
  }
};

exports.getTokenAndGetChapterManga = async (endpoint, linkChapter, email, password) => {
  try {
    const cookieJson = await readCookieFromFile(path.join(__dirname, "./sessionCookies.json"));
    const { key: cookie } = JSON.parse(cookieJson);
    const response = await getMangaChapter(cookie, linkChapter, "", endpoint);
    return response.result;
  } catch (error) {
    // console.error(error.response);
    if (error.response.status === 401 && error.response.data.message === "Unauthenticated.") {
      const { cookie: key, csrf } = await getSessionAndTokenForLogin();
      const cookie = await loginAndGetSessionCookie(key, {
        token: csrf,
        email,
        password,
      }, endpoint);
      const csrfForPublish = await getSessionAndToken(cookie, endpoint);
      await writeCookieToFile(cookie, csrfForPublish);
      const response = await getMangaChapter(cookie, urlChapter, "", endpoint);
      return response.result;
    }
    // console.error(error);
  }  
};
