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

let mongoConnect = process.env.MONGODB_URI || "mongodb://127.0.0.1/scraperDB";

mongoose.connect(mongoConnect);

app.get("/scrape", function(req, res) {
  axios.get("http://www.wowhead.com").then(function(resp) {
    //console.log(resp.data);
    let $ = cheerio.load(resp.data);
    
    $(".news-post").each((i, element) => {
      let result = {};
      result.title = element.children[5].children[1].children[3].children[1].children[0].children[0].data;
      result.link = element.children[1].attribs.href;
      result.blurb = element.children[7].children[5].children[0].data;
      db.Article.create(result)
        .then(dbArticle => console.log(dbArticle))
        .catch(err => console.log(err));
    });
    res.send("Scrape complete");
  });
});

app.get("/",(req, res)=>{
  res.render("index");
})

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
  console.log(`Listening on port ${PORT}.`);
});
