const Twitter = require('twitter')
const fs = require('fs')
const db = require('./db.js')

const twitterClient = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
})

function tweet(place) {
  return function() {
    if (['winner', 'loser'].indexOf(place) > -1) {
      db.getWinnerLoser(function(err, record) {
        if (err) return console.log("DB error: ", err)

        var user = JSON.parse(record[place])
        var image = fs.readFileSync(__dirname + '/../public/img/' + place + '.jpg')
        twitterClient.post('media/upload', {'media': image}, function(err, media) {
          if (!err) {
            console.log("Successfully uploaded image")

            var status = {
              status: user.name + ", you are this week's " + place,
              media_ids: media.media_id_string
            }
            
            twitterClient.post('statuses/update', status, function(err, tweet, response){
              if (err) return console.log("Error", err)
              console.log("Successfully posted tweet")
            })
          } else {
            console.log("Error", err)
          }
        })
      })
    }
  }
}

module.exports = {
  tweetWinnerAndLoser: function() {
    tweet('winner')()
    tweet('loser')()
  }
}
