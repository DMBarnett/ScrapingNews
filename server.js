const express = require("express");
const axios = require("axios");
const mongoose = require("mongoose");
const cheerio = require("cheerio");
const logger = require("morgan");
const exphbs = require("express-handlebars");
const PORT = process.env.PORT || 3000;
const db = require("./models");
const app = express();

app.use(logger("dev"))
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
app.engine("handlebars", exphbs({defaultLayout: "main"}));
app.set("view engine", "handlebars");

let mongoConnect = process.env.MONGODB_URI || "mongodb://127.0.01/scraperDB";

mongoose.connect(mongoConnect);

app.get("/scrape", function(req, res) {
  axios.get("http://www.wowhead.com").then(function(resp) {
    let $ = cheerio.load(resp.data);
    $(".news-list h1").each((i, element) => {
      let result = {};
      result.title = $(this)
        .children("a")
        .text();
      result.link = $(this)
        .children("a")
        .attr("href");
      console.log(result);
      db.Article.create(result)
        .then(dbArticle => console.log(dbArticle))
        .catch(err => console.log(err));
    });
    res.send("Scrape complete");
  });
});

app.get("/articles", function(req, res) {
  db.Article.find({})
    .then(dbArticles => res.json(dbArticles))
    .catch(err => res.json(err));
});


app.get("/articles/:id", function(req, res) {
  db.Article.findOne({_id: req.params.id})
    .populate("note")
    .then(dbArticles => res.json(dbArticles))
    .catch(err => res.json(err));
});

app.post("/articles/:id", function(req, res) {
  db.Note.create(req.body)
    .then(dbNote => {
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(dbArticle=>res.json(dbArticle))
    .catch(err => res.json(err));
});

app.listen(PORT, function() {
  console.log(`:Listening on port ${PORT}.`);
});
