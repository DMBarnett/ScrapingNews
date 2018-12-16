const mongoose = require("mongoose");

const Schema = mongoose.Schema;

let ArticleSchema = new Schema({
  title: {
    type:String,
    required: true,
    unique: true,
  },
  link:{
    type: String,
    required: true
  },
  note:{
    type:Schema.Types.ObjectId,
    ref: "Note"
  },
  blurb: {
    type:String,
    required: true
  }
})

let Article = mongoose.model("Article", ArticleSchema);

module.exports = Article;