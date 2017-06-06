//Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var port = process.env.PORT || 3000;
var Note = require("./models/Note.js");
var Article = require("./models/Article.js");

//Scraping Tools
var request = require("request");
var cheerio = require("cheerio");


// Initialize Express
var app = express();

// User morgan and body parser with our app
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
    extended: false
}));

// Make public a static dir
app.use(express.static("public"));

//Database configuration with mongoose
mongoose.connect("mongodb://localhost/hw14");
// mongoose.connect("mongodb://heroku_7zb2nd2r:lsau3g84jjtaah0sm6s4r3r1dn@ds129641.mlab.com:29641/heroku_7zb2nd2r");
var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
    console.log("Mongoose Error: ", error);
});

//Once logged in to the db through mongoose, log a success message
db.once("open", function() {
    console.log("Mongoose connection successful.");
});

// Routes
app.get("/scrape", function(req, res) {
    //We grab the body of the html with request
    request("http://www.technewsworld.com/", function(error, response, html) {
        //We load that into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(html);
        $("div .title").each(function(i, element) {
            var result = {};
            result.title = $(this).children("a").text();
            result.link = $(this).children("a").attr("href");

            //using our Article model, create a new entry
            //This effectively passes the result object to the entry
            var entry = new Article(result);

            // Article.update(result, result, {upsert: true})

            entry.save(function(err, doc) {
                if (err) console.log(err);
                else {
                    console.log(doc);
                }
            })
        })
    })
})

app.get("/articles", function(req, res) {
    Article.find({}, function(error, doc) {
        // Log any errors
        if (error) {
            console.log(error);
        }
        // Or send the doc to the browser as a json object
        else {
            res.json(doc);
        }
    });
})

app.get("/articles/:id", function(req, res) {
    Article.findOneAndUpdate({ "_id": req.params.id }, { saved: true })
        .exec(function(err, doc) {
            if (err) console.log(err);
            else {
                res.send(doc);
            }
        })
})

app.get("/notes/:id", function(req,res){
    Article.findOne({"_id":req.params.id})
    .populate("note")
    .exec(function(error, doc) {
        if(error) console.log(error)
        else{
            res.json(doc);
        }
    })
})

app.post("/notes/:id", function(req, res){
    var newNote = new Note(req.body);
    newNote.save(function(error, doc){
        if(error) console.log(error);
        else {
            Article.findOneAndUpdate({"_id": req.params.id}, {"note": doc._id})
            .exec(function(err, doc){
                if(err){
                    console.log(err);
                } else {
                    res.send(doc);
                }
            })
        }
    })
})

app.get("/deletenote/:id", function(req, res){
    var delnote = req.params.id
    console.log(delnote);
    Note.find({"title": delnote}).remove().exec();
})

app.get("/delete/:id", function(req, res){
    Article.findOneAndUpdate({ "_id": req.params.id }, { saved: false })
        .exec(function(err, doc) {
            if (err) console.log(err);
            else {
                res.send(doc);
            }
        })
})

app.listen(port, function() {
    console.log("App is running on port 3000")
})
