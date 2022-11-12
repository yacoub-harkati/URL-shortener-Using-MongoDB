require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
// Basic Configuration
const port = process.env.PORT || 80;
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

let shortUltShema = new mongoose.Schema({
  original_url: String,
  short_url: Number,
})

let Url = mongoose.model("Url", shortUltShema)

app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post('/api/shorturl', async function(req, res) {
  let db_return = await db_CreateUrl(req.body.url)
  let response = /(^http.?:\/{2})/g.test(req.body.url) ? db_return : {"error":"Invalid URL"}
  res.json(response); 
});

app.get('/api/shorturl/:link?', async function(req, res) {
  console.log(req.params.link)
  const ulrObject = await Url.findOne({short_url: req.params.link})
  res.redirect(303,ulrObject.original_url); 
});

async function db_CreateUrl(url) {
  let databaseLength = await Url.count("short_url") 
  let shortUrlNumber = databaseLength + 1
  let checkIfItExists = await Url.exists({"original_url": url})
  if (!checkIfItExists) {await Url.create({"original_url": url,"short_url": shortUrlNumber})}
  else if (checkIfItExists) {
    let findUrl = await Url.findOne({original_url: url})
    shortUrlNumber = findUrl.short_url
  }
  return {"original_url": url ,"short_url": shortUrlNumber}
}

app.listen(port , function() {
  console.log(`Listening on port ${port}`);
});

