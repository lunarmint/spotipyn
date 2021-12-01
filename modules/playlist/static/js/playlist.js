spotify.getUserPlaylists(function (err, data) {
    makeSideMenu(data);
    makeRightPlaylist(data);
    displayFirstItem();

    $("body").on("click", ".playlist_item", function () {
        const id = $(this).attr("data-id");
        const _ele = "#playlistid_" + id;
        $('.main_playlist_item').hide();
        $(_ele).show();
        spotify.getPlaylist(id,null, function (err, data) {
            renderTrackData(data);
        });
    });
});

function makeSideMenu(res) {
    let menuItem = "";

    // Parse the array for the playlist info.
    for (let i = 0; i < res.items.length; i++) {
        const item = res.items[i];
        let playlistId = item.id
        let playlistName = item.name
        menuItem += `<li><a href="javascript:void(0);" class="playlist_item" data-id="${playlistId}">${playlistName}</a></li>`
    }

    $('.playlist_menu').html(menuItem);
}

function makeRightPlaylist(res) {

    let tpl = '<div class"playlistContainer">';

    // parse the array for the playlist info
    for (let i = 0; i < res.items.length; i++) {
        const item = res.items[i];
        let img = item.images
        let playlistId = item.id
        let playlistName = item.name

        let className = "main_playlist_item_" + i;
        tpl += `<div class="row main_playlist_item ${className}" id="playlistid_${playlistId}">`
        tpl += `<div class="col-sm-4">`;
        tpl += `<img src="${img[0].url}" width="200" height="200" alt="">`
        tpl += `</div>`;
        tpl += `<div class="col-sm-4 item_title">`;
        tpl += `<span>${playlistName}</span>`
        tpl += `</div>`;
        tpl += `</div>`;
    }

    tpl += `</div>`;
    $(".playlistAjax").html(tpl);
}


//To convert the time from ms to minutes and seconds
function msConversion(millis) {
    let sec = Math.floor(millis / 1000);
    let hrs = Math.floor(sec / 3600);
    sec -= hrs * 3600;
    let min = Math.floor(sec / 60);
    sec -= min * 60;
    sec = "" + sec;
    sec = ("00" + sec).substring(sec.length);

    if (hrs > 0) {
        min = "" + min;
        min = ("00" + min).substring(min.length);
        return hrs + ":" + min + ":" + sec;
    } else {
        return min + ":" + sec;
    }
}

function renderTrackData(res) {
    $(".trackData").html("");
    let tpl = "";
    let j = 1;
    const trackItems = res.tracks.items;
    for (let i = 0; i < trackItems.length; i++) {
        const item = trackItems[i];
        const track = item.track;
        let playlistId = "";
        let songName = track.name;
        let artists = [];
        for (const artist in track.artists) {
            artists.push(track.artists[artist].name);
        }

        let artistName = artists.join(", ");
        let albumName = track.album.name;
        let duration = track.duration_ms;
        let small_img = track.album.images[2];
        duration = msConversion(duration);
        let className = "track_item_" + i;

        tpl += `<tr class="trackItem ${className}" id="trackid_${playlistId}">`
        tpl += `<td>${j}</td>`
        tpl += `<td class="">`;
        tpl += `<div class="left_side"><img src="${small_img.url}" width="${small_img.width}" height="${small_img.height}" alt=""></div>`
        tpl += `<div class="right_side"><span class="title">${songName}</span></div>`
        tpl += `</td>`;
        tpl += `<td class="">`;
        tpl += `<span class="artist_name">${artistName}</span>`;
        tpl += `</td>`;
        tpl += `<td class="">`;
        tpl += `<span class="album_name">${albumName}</span>`;
        tpl += `</td>`;
        tpl += `<td class="">`;
        tpl += `<span class="track_time">${duration}</span>`;
        tpl += `</td>`;
        tpl += `</tr>`;
        j++;
    }
    $(".trackData").html(tpl);
}

//First album cover(s) for each playlist
function displayFirstItem() {
    $(".main_playlist_item").hide();
    $(".main_playlist_item_0").show();
}