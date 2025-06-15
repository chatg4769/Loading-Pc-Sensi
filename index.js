const express = require("express");
const app = express();
const path = require("path");
const PORT = 4000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public/"));

app.get("/", async (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server Started on Port ${PORT}`);
});
