const token = window.spotifyaccesstoken
let playlists_url="https://api.spotify.com/v1/users/9rfpj5pubetgir0ee9lqpkrp0/playlists"
//9rfpj5pubetgir0ee9lqpkrp0
let playlistID_url="https://api.spotify.com/v1/playlists/";
const scopes = ["playlist-read-private","playlist-read-collaborative"]
let apiDATA='';

function makeSideMenu(res){
   var menuItem='';

            // parse the array for the playlist info
            for (let i = 0; i < res.items.length; i++) {
                const item = res.items[i];
                let img = item.images
                let playlistId = item.id
                let userId = item.owner.id
                let playlistName = item.name
                //console.log(item.id)
                console.log(img)
                console.log(playlistName)
                console.log(userId)
                console.log(playlistId)

                  menuItem+='<li class="playlist_item" data-id="'+playlistId+'"> <strong>'+playlistName+'</strong></li>';

            }
                 $('.playlist_menu').html(menuItem);
}

function makeRightPlaylist(res){

             var tpl='<div class"playlistContainer">';

            // parse the array for the playlist info
            for (let i = 0; i < res.items.length; i++) {
                const item = res.items[i];
                let img = item.images
                let playlistId = item.id
                let userId = item.owner.id
                let playlistName = item.name
                //console.log(item.id)
                console.log(img)
                console.log(playlistName)
                console.log(userId)
                console.log(playlistId)

                var className= 'main_playlist_item_'+i;
                   tpl+='<div class="row main_playlist_item '+className+'" id="playlistid_'+playlistId+'">';
                tpl+='<div class="col-sm-4">';
                   tpl+='<img src="'+img[0].url+'" width="200" height="200" >';
                   tpl+='</div>';
                       tpl+='<div class="col-sm-4 item_title">';
                tpl+='<span>'+playlistName+'</span>';
                 tpl+='</div>';
  tpl+='</div>';


            }

               tpl+='</div>';
                 $('.playlistAjax').html(tpl);
}

function renderTrackData(res)
{
   $('.trackData').html('');
   var tpl ='';
   var j= 1;
   var trackItems = res.tracks.items;
            for (let i = 0; i < trackItems.length; i++) {
                  const item = trackItems[i];
                  const track =item.track;
                let date_added = item.added_at;

                let img = '';
                let playlistId = '';
                let userId = '';
                let playlistName = '';
                let songName = track.name;
                let trackId = track.id;
                var artists = [];
                for( artist  in track.artists){
                    artists.push(artist.name);
                }

                let artistName = artists.join(', ');
                let albumName = track.album.name;
                let duration = track.duration_ms;
                let small_img= track.album.images[2];
                //console.log(item.id)
                console.log(img)
                console.log(playlistName)
                console.log(userId)
                console.log(playlistId)

                var className= 'track_item_'+i;
                   tpl+='<tr class="trackItem '+className+'" id="trackid_'+playlistId+'">';
                   tpl+='<td>+j+</td>';
                tpl+='<td class="">';
                   tpl+='<div class="left_side"><img src="'+small_img.url+'" width="'+small_img.width+'" height="'+small_img.height+'" ></div>';
                   tpl+='<div class="right_side"><span class="title">'+songName+'</span><span class="artist_name">'+artistName+'</span></div>';
                   tpl+='</td>';
                    tpl+='<td class="">';
                     tpl+='<span class="album_name">'+albumName+'</span>';
                     tpl+='</td>';
                       tpl+='<td class="">';
                     tpl+='<span class="date_added">'+date_added+'</span>';
                     tpl+='</td>';

                     tpl+='<td class="">';
                     tpl+='<span class="track_time">'+duration+'</span>';
                     tpl+='</td>';

  tpl+='</tr>';

  j++;
            }

   $('.trackData').html(tpl);


}//First songs album cover for each playlist
function displayFirstItem(){
    $('.main_playlist_item').hide();
    $(".main_playlist_item_0").show();
}

$('body').on('click','.playlist_item',function(){
    var id= $(this).attr('data-id');
    var _ele = '#playlistid_'+id;
    $('.main_playlist_item').hide();
    $(_ele).show();



    $.ajax({
        method: "GET",
        url: playlistID_url+id,
        headers: {
            'Authorization': 'Bearer ' + window.spotifyaccesstoken
        }
    })
        .done(function (res) {
            console.log(res.tracks);
            renderTrackData(res);
        });
    return false;
});

    $.ajax({
        method: "GET",
        url: playlists_url,
        headers: {
            'Authorization': 'Bearer ' + window.spotifyaccesstoken
        }
    })
        .done(function (res) {
            console.log(res);
            apiDATA= res;
 makeSideMenu(res);
 makeRightPlaylist(res);
displayFirstItem();
            //let elem = document.getElementById('name').innerHTML

        });
