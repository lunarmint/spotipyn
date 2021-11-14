var request = require("request")
var token = "Bearer"
var playlists_url="https://api.spotify.com/v1/users/9rfpj5pubetgir0ee9lqpkrp0/playlists"
const scopes = ["playlist-read-private","playlist-read-collaborative"]

request({url:playlists_url, headers:{"Authorization":token}}, function (err,res) {
    if (res) {
        var playlists = JSON.parse(res.body)
        var playlist_url = playlists.items[0].href

        // Make another call to the api to find playlist object
        request({url: playlist_url, headers: {"Authorization": token}}, function (err, res) {
            if (res) {
                var playlist = JSON.parse(res.body)
                console.log('playlist' + playlist.name)
                playlist.tracks.forEach(function (track) {
                    console.log(track.track.name)
                })
            }
        })
    }
})