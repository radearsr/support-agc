require("dotenv").config();
const axios = require("axios");

exports.senderSuccessUpdateManga = async (teleMessageId, title, start, end, linkPost) => {
  const message = `✅ MANGA UPDATE\n>>${title}<<\n>>Chapter Terakhir ${start}<<\n>>Chapter Saat Ini${end}<<\n>>${linkPost}<<\n`;
  await axios.get(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
    params: {
      chat_id: teleMessageId,
      text: message,
    }
  });
};

exports.senderSuccessPostManga = async (teleMessageId, title, chapter, linkPost) => {
  const message = `✅ NEW MANGA\n>>${title}<<\n>>Chapter ${chapter}<<\n>>${linkPost}<<\n`;
  await axios.get(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
    params: {
      chat_id: teleMessageId,
      text: message,
    }
  });
};

exports.senderMangaUptoDate = async (teleMessageId, title, chapter, linkPost) => {
  const message = `👌 MANGA UP TO DATE\n>>${title}<<\n>>Chapter ${chapter}<<\n>>${linkPost}<<\n`;
  await axios.get(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
    params: {
      chat_id: teleMessageId,
      text: message,
    }
  });
};

exports.senderNofitication = async (teleMessageId, text) => {
  const message = `>> NOTIFIKASI <<\n${text}`;
  await axios.get(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
    params: {
      chat_id: teleMessageId,
      text: message,
    }
  });
};
