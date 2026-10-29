const express = require("express");
const app = express();

const PORT = 4000;
app.get("/", function (request, response) {
  response.send("🙋‍♂️, 🌏 🎊✨🤩");
});

app.listen(PORT, () =>
  console.log(`The server started in: http://localhost:${PORT} ✨✨`),
);
