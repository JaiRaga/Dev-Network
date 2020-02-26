const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.send("API Working!");
});

const PORT = process.env.PORT || 9008;

app.listen(PORT, () => console.log(`Server is up on ${PORT}`));
