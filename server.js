const express = require("express");
const path = require("path");

const app = express();

app.set("view engine", "ejs");
app.use("/assets", express.static(path.join(__dirname, "assets")))
app.use("/", require("./routes/web"));

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});