window.onSpotifyWebPlaybackSDKReady = () => {
    const player = new Spotify.Player({
        name: "Spotipyn",
        getOAuthToken: callback => {
            callback(token);
        },
        volume: 0.5
    });

    /**
     * Log the player state and status.
     */
    player.addEventListener("ready", ({device_id}) => {
        console.log('Ready with Device ID', device_id);

        // Get the list of the current devices. If one of them is named "Spotipyn", transfer the playback to that device.
        spotify.getMyDevices(function (err, data) {
            let device_id = [];
            const devices = data.devices;
            for (let i = 0; i < devices.length; ++i) {
                if (devices[i].name === "Spotipyn") {
                    device_id.push(devices[i].id);
                }
            }
            spotify.transferMyPlayback(device_id, null, null);
        });

        // Update the volume bar's value on successful player initialization.
        player.getVolume().then(volume => {
            if (!volume) {
                return;
            }
            volume_bar.value = volume;
        });

        // Attempt to request for notification permission.
        Notification.requestPermission().then();
    });

    player.addEventListener("not_ready", ({device_id}) => {
        console.log("Device ID has gone offline", device_id);
    });

    player.addEventListener("initialization_error", ({message}) => {
        console.error(message);
    });

    player.addEventListener("authentication_error", ({message}) => {
        console.error(message);
    });

    player.addEventListener("account_error", ({message}) => {
        console.error(message);
    });

    player.addEventListener("autoplay_failed", () => {
        console.log("Autoplay is not allowed by the browser autoplay rules");
    });

    // Get the buttons and initialize the progress bar.
    const play_button = document.getElementById("play");
    const fast_backwards = document.getElementById("fast-backwards");
    const fast_forward = document.getElementById("fast-forward");
    const shuffle_button = document.getElementById("shuffle");
    const repeat_button = document.getElementById("repeat");
    const pin_button = document.getElementById("pin");
    const volume_button = document.getElementById("volume");
    const volume_bar = document.getElementById("volume-bar");
    const progress_bar = document.getElementById("playback-bar");
    const progress = new ProgressBar.Line("#playback-bar", {
        color: "#b3b3b3",
        trailColor: "#535353",
        svgStyle: {
            strokeLinecap: "round",
        },
    });

    // Form control.
    const form = document.getElementById("form");
    let input_label = document.getElementById("input-label");
    const option = document.getElementById("mode");
    const submit = document.getElementById("submit");

    // Location of the current object as url.
    const location = `${window.location.protocol}//${window.location.host}/`;

    /**
     * Update various elements on the player whenever a change in the player state is detected.
     */
    let duration_ms;
    let current_track_id;
    player.addEventListener("player_state_changed", ({paused, repeat_mode, shuffle, track_window: {current_track}}) => {
        if (paused) {
            // Without this, when the button is clicked and if the mouse is still on it, it would display the white version of the button.
            if (play_button.src === location + "static/img/player/pause.png") {
                play_button.src = location + "static/img/player/play.png";
            }
        } else {
            if (play_button.src === location + "static/img/player/play.png") {
                play_button.src = location + "static/img/player/pause.png";
            }
        }

        // If repeat mode is being toggled on/off elsewhere, automatically update the element to reflect the change.
        // Secondary checks are used to prevent conflict with the onclick function that would make the button go crazy.
        if (repeat_mode === 0 && repeat_button.src === location + "static/img/player/repeat-2.png") {
            repeat_button.src = location + "static/img/player/repeat.png";
        } else if (repeat_mode === 1 && repeat_button.src === location + "static/img/player/repeat.png") {
            repeat_button.src = location + "static/img/player/repeat-1.png";
        } else if (repeat_mode === 2 && repeat_button.src === location + "static/img/player/repeat-1.png") {
            repeat_button.src = location + "static/img/player/repeat-2.png";
        }

        // If shuffle is being toggled on/off elsewhere, automatically update the element to reflect the change.
        if (shuffle) {
            shuffle_button.src = location + "static/img/player/shuffle-on.png"
        } else {
            shuffle_button.src = location + "static/img/player/shuffle.png";
        }

        // If shuffle is being toggled on/off elsewhere, automatically update the element to reflect the change.
        document.getElementById("album-cover").src = current_track.album.images[0].url;

        // Get the song and artist name and hyperlink it to Spotify.
        duration_ms = current_track.duration_ms;
        document.getElementById("song-name").innerText = current_track.name;
        document.getElementById("song-name").href = `https://open.spotify.com/album/${current_track.album.uri.split(":")[2]}`
        document.getElementById("artist-name").innerText = current_track.artists[0].name;
        document.getElementById("artist-name").href = `https://open.spotify.com/album/${current_track.artists[0].uri.split(":")[2]}`;
        document.getElementById("playback-end").innerText = getTime(duration_ms);

        // Update the current song ID being played.
        current_track_id = current_track.uri.split(":")[2]
    });

    /**
     * Play/pause the song on button click.
     *
     * Also initialize an interval that fires a function every second to update the song progress bar and timer when the song is being played,
     * and clear the interval when it's paused to reduce the amount of API calls to avoid being rate limited.
     */
    let interval_id;
    play_button.onclick = async function () {
        // Get the state before playing/pausing and update the elements first.
        player.getCurrentState().then(state => {
            if (!state) {
                return;
            }

            if (state.paused) {
                play_button.src = location + "static/img/player/pause-hover.png";
                // Get the position of the current playing track in ms and update the progress bar and the timer on the left every second.
                interval_id = window.setInterval(function () {
                    player.getCurrentState().then(state => {
                        if (!state) {
                            return;
                        }

                        const position = state.position;
                        document.getElementById("playback-start").innerText = getTime(position);
                        progress.set(position / duration_ms);
                    });
                }, 1000);
            } else {
                play_button.src = location + "static/img/player/play-hover.png";
                // Remove the interval while paused to reduce the total amount of API requests.
                clearInterval(interval_id);
            }
        });

        // Play/pause the music again.
        player.togglePlay();
    }

    /**
     * Highlight the play/pause button when the cursor is on the element and return to grey when it leaves.
     */
    play_button.onmouseover = function () {
        if (play_button.src === location + "static/img/player/play.png") {
            play_button.src = location + "static/img/player/play-hover.png";
        } else if (play_button.src === location + "static/img/player/pause.png") {
            play_button.src = location + "static/img/player/pause-hover.png";
        }
    }

    play_button.onmouseout = function () {
        if (play_button.src === location + "static/img/player/play-hover.png") {
            play_button.src = location + "static/img/player/play.png";
        } else if (play_button.src === location + "static/img/player/pause-hover.png") {
            play_button.src = location + "static/img/player/pause.png";
        }
    }

    /**
     * Single click to seek to position 0 of the current track.
     * @returns {Promise<void>}
     */
    fast_backwards.onclick = async function () {
        player.seek(0);
    }

    /**
     * Double click to jump to the next track.
     * @returns {Promise<void>}
     */
    fast_backwards.ondblclick = async function () {
        player.previousTrack();
    }

    /**
     * Highlight the fast backwards button when the cursor is on the element and return to grey when it leaves.
     */
    fast_backwards.onmouseover = function () {
        fast_backwards.src = location + "static/img/player/fast-backwards-hover.png";
    }

    fast_backwards.onmouseout = function () {
        fast_backwards.src = location + "static/img/player/fast-backwards.png";
    }

    /**
     * Single click to jump to the next track.
     * @returns {Promise<void>}
     */
    fast_forward.onclick = async function () {
        player.nextTrack();
    };

    /**
     * Highlight the fast forward button when the cursor is on the element and return to grey when it leaves.
     */
    fast_forward.onmouseover = function () {
        fast_forward.src = location + "static/img/player/fast-forward-hover.png";
    }

    fast_forward.onmouseout = function () {
        fast_forward.src = location + "static/img/player/fast-forward.png";
    }

    /**
     * Change the state of shuffle mode to on/off.
     */
    shuffle_button.onclick = function () {
        player.getCurrentState().then(state => {
            if (!state) {
                return;
            }

            if (state.shuffle) {
                spotify.setShuffle(false, null, function () {
                    shuffle_button.src = location + "static/img/player/shuffle.png";
                });
            } else {
                spotify.setShuffle(true, null, function () {
                    shuffle_button.src = location + "static/img/player/shuffle-on.png";
                });
            }
        });
    }

    /**
     * Highlight the fast forward button when the cursor is on the element and return to grey when it leaves.
     */
    shuffle_button.onmouseover = function () {
        if (shuffle_button.src === location + "static/img/player/shuffle.png") {
            shuffle_button.src = location + "static/img/player/shuffle-hover.png";
        } else if (shuffle_button.src === location + "static/img/player/shuffle-on.png") {
            shuffle_button.src = location + "static/img/player/shuffle-on-hover.png";
        }
    }

    shuffle_button.onmouseout = function () {
        if (shuffle_button.src === location + "static/img/player/shuffle-hover.png") {
            shuffle_button.src = location + "static/img/player/shuffle.png";
        } else if (shuffle_button.src === location + "static/img/player/shuffle-on-hover.png") {
            shuffle_button.src = location + "static/img/player/shuffle-on.png";
        }
    }

    /**
     * Change the state of the repeat mode to 0, 1, 2 (off, context, track).
     */
    repeat_button.onclick = function () {
        player.getCurrentState().then(state => {
            if (!state) {
                return;
            }

            if (state.repeat_mode === 0) {
                spotify.setRepeat("context", null, function () {
                    repeat_button.src = location + "static/img/player/repeat-1.png";
                });
            } else if (state.repeat_mode === 1) {
                spotify.setRepeat("track", null, function () {
                    repeat_button.src = location + "static/img/player/repeat-2.png";
                });
            } else if (state.repeat_mode === 2) {
                spotify.setRepeat("off", null, function () {
                    repeat_button.src = location + "static/img/player/repeat.png";
                });
            }
        });
    }

    /**
     * Highlight the repeat button when the cursor is on the element and return to grey when it leaves.
     */
    repeat_button.onmouseover = function () {
        if (repeat_button.src === location + "static/img/player/repeat.png") {
            repeat_button.src = location + "static/img/player/repeat-hover.png";
        } else if (repeat_button.src === location + "static/img/player/repeat-1.png") {
            repeat_button.src = location + "static/img/player/repeat-1-hover.png";
        } else if (repeat_button.src === location + "static/img/player/repeat-2.png") {
            repeat_button.src = location + "static/img/player/repeat-2-hover.png";
        }
    }

    repeat_button.onmouseout = function () {
        if (repeat_button.src === location + "static/img/player/repeat-hover.png") {
            repeat_button.src = location + "static/img/player/repeat.png";
        } else if (repeat_button.src === location + "static/img/player/repeat-1-hover.png") {
            repeat_button.src = location + "static/img/player/repeat-1.png";
        } else if (repeat_button.src === location + "static/img/player/repeat-2-hover.png") {
            repeat_button.src = location + "static/img/player/repeat-2.png";
        }
    }

    /**
     * Highlight the pin button when the cursor is on the element and return to grey when it leaves.
     */
    pin_button.onmouseover = function () {
        pin_button.src = location + "static/img/player/pin-hover.png";
    }

    pin_button.onmouseout = function () {
        pin_button.src = location + "static/img/player/pin.png";
    }

    pin_button.onclick = function () {
        $("#modal").modal("show");
    }

    // Seek the player to the clicked location on the progress bar.
    progress_bar.onclick = function (event) {
        // Get the clicked x value relative to the element by subtracting the clicked x value of the screen by the bar's left offset.
        const x = event.pageX - this.offsetLeft;
        const progress_percentage = x / this.offsetWidth;
        progress.set(progress_percentage);
        player.seek(progress_percentage * duration_ms);
    }

    /**
     * Highlight the volume button when the cursor is on the element and return to grey when it leaves.
     */
    volume_button.onmouseover = function () {
        const volume = parseFloat(volume_bar.value);
        if (volume >= 0.5) {
            volume_button.src = location + "static/img/player/volume-full-hover.png";
        } else if (volume > 0 && volume < 0.5) {
            volume_button.src = location + "static/img/player/volume-low-hover.png";
        } else {
            volume_button.src = location + "static/img/player/volume-mute-hover.png";
        }
    }

    volume_button.onmouseout = function () {
        const volume = parseFloat(volume_bar.value);
        if (volume >= 0.5) {
            volume_button.src = location + "static/img/player/volume-full.png";
        } else if (volume > 0 && volume < 0.5) {
            volume_button.src = location + "static/img/player/volume-low.png";
        } else {
            volume_button.src = location + "static/img/player/volume-mute.png";
        }
    }

    /**
     * Update the volume of the player when a change in input value is detected, and change the volume icon to mute if = 0,
     * as well as apply an alternative color when the slider is being clicked on.
     */
    volume_bar.addEventListener("input", function () {
        const volume = parseFloat(volume_bar.value);
        player.setVolume(volume);

        if (volume >= 0.5) {
            volume_button.src = location + "static/img/player/volume-full-hover.png";

            volume_bar.onmousedown = function () {
                volume_button.src = location + "static/img/player/volume-full-hover.png";
            }

            volume_bar.onmouseup = function () {
                volume_button.src = location + "static/img/player/volume-full.png";
            }
        } else if (volume > 0 && volume < 0.5) {
            volume_button.src = location + "static/img/player/volume-low-hover.png";

            volume_bar.onmousedown = function () {
                volume_button.src = location + "static/img/player/volume-low-hover.png";
            }

            volume_bar.onmouseup = function () {
                volume_button.src = location + "static/img/player/volume-low.png";
            }
        } else {
            volume_button.src = location + "static/img/player/volume-mute-hover.png";

            volume_bar.onmousedown = function () {
                volume_button.src = location + "static/img/player/volume-mute-hover.png";
            }

            volume_bar.onmouseup = function () {
                volume_button.src = location + "static/img/player/volume-mute.png";
            }
        }
    });

    /**
     * Dynamically generate the input field depending on the mode selection.
     */
    option.onchange = function () {
        let content = "";
        input_label.innerHTML = "";
        if (option.value === "absolute") {
            document.getElementById("input-label").innerHTML = `<label for="minutes" class="form-label">Time:</label>`;
            content += `<input type="text" class="form-control" id="year" placeholder="yyyy" pattern="^[0-9]{4}$" title="Year must have 4 digits. Years before 1970 will be converted to 1970" aria-label="Year" required>`
            content += `<span class="input-group-text">-</span>`
            content += `<input type="text" class="form-control" id="month" placeholder="mm" pattern="^(0?[1-9]|1[012])$" title="Month must be a number from 1-12" aria-label="Month" required>`
            content += `<span class="input-group-text">-</span>`
            content += `<input type="text" class="form-control" id="day" placeholder="dd" pattern="^((0[1-9]|[12][0-9]|3[01])$" title="Day must be a number from 1-31. Nearest valid date will be used if out of bound" aria-label="Day" required>`
            content += `<span class="input-group-text"></span>`
            content += `<input type="text" class="form-control" id="hour" placeholder="hh" pattern="\\b(2[0-3]|[0-1]?[0-9])\\b" title="Hour must be a number from 0-23" aria-label="Hour" required>`
            content += `<span class="input-group-text">:</span>`
            content += `<input type="text" class="form-control" id="minute" placeholder="mm" pattern="[0-5]?[0-9]" title="Hour must be a number from 0-59" aria-label="Minute" required>`
            content += `<span class="input-group-text">:</span>`
            content += `<input type="text" class="form-control" id="second" placeholder="ss" pattern="[0-5]?[0-9]" title="Hour must be a number from 0-59" aria-label="Second" required>`
        } else if (option.value === "relative") {
            document.getElementById("input-label").innerHTML = `<label for="minutes" class="form-label">Timestamp:</label>`;
            content += `<input type="text" class="form-control" id="hour" placeholder="hh" pattern="[0-2]?[0-3]" title="Hour must be a number from 0-23" aria-label="Hour" required>`
            content += `<span class="input-group-text">:</span>`
            content += `<input type="text" class="form-control" id="minute" placeholder="mm" pattern="[0-5]?[0-9]" title="Hour must be a number from 0-59" aria-label="Minute" required>`
            content += `<span class="input-group-text">:</span>`
            content += `<div id="seconds-validation">`
            content += `<input type="text" class="form-control" id="second" placeholder="ss" pattern="[0-5]?[0-9]" title="Hour must be a number from 0-59" aria-label="Second" required>`
        }
        document.getElementById("form-content").innerHTML = content;
    }

    /**
     * Only dismiss the modal if the form is valid, checked when the mouse is hovered on the submit button.
     */
    submit.onmousemove = function () {
        if (form.checkValidity() === true) {
            document.getElementById("submit").setAttribute("data-bs-dismiss", "modal");
        } else {
            document.getElementById("submit").removeAttribute("data-bs-dismiss");
        }
    }

    /**
     * Get the form data values as an Object prototype, and then send it back to the Python backend.
     * @param event
     */
    form.onsubmit = function (event) {
        event.preventDefault();
        const inputs = Array.from(document.querySelectorAll("#form input")).reduce((acc, input) => ({...acc, [input.id]: input.value}), {});
        const mode = Array.from(document.querySelectorAll("#form select")).reduce((acc, input) => ({...acc, [input.id]: input.value}), {});
        const response = {
            ...inputs,
            ...mode,
        }

        response["song"] = current_track_id;
        const request = new XMLHttpRequest();
        request.open("POST", `/database/${JSON.stringify(response)}`);
        request.send();
    }

    /**
     * Loop through the database once every 3 seconds and fire the alerts as well as update the pin display.
     */
    window.setInterval(function () {
        $.get("/loop", function (data) {
            const pins = JSON.parse(data);

            // Flush the table if the Object is empty.
            if (Object.keys(pins).length === 0) {
                document.getElementById("table-items").innerHTML = "";
            }

            let td = "";
            for (let i = 0; i < Object.keys(pins).length; ++i) {
                const pin = pins[i];
                const time = pin["end_time"];
                const message = pin["message"];

                const date = new Date(time * 1000);
                const year = date.getFullYear();
                // Javascript count the month from 0.
                const month = date.getMonth() + 1;
                const day = date.getDate();

                // Add a 0 before hour, minute, and second if it is smaller than 10.
                const hour = function () {
                    return date.getHours() < 10 ? `0${date.getHours()}` : date.getHours();
                }

                const minute = function () {
                    return date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();
                }

                const second = function () {
                    return date.getSeconds() < 10 ? `0${date.getSeconds()}` : date.getSeconds();
                }

                // If the current UNIX time is equal or larger than the pin's end time, fire an alert.
                if (Date.now() / 1000 >= parseInt(time)) {
                    if (Notification.permission === "granted") {
                        const notification = new Notification("Spotipyn", {
                            body: message,
                            icon: location + "static/img/notification.png"
                        });
                        setTimeout(notification.close.bind(notification), 30000);
                    }
                }

                // Get the data of the track ready to be displayed.
                spotify.getTrack(pin["song"], null, function (err, data) {
                    let art = data.album.images[2].url;
                    const song_name = data.name;
                    const artist = data.artists[0].name;
                    const album = data.album.name;

                    td += `<tr>`
                    td += `<td class="table-number">`
                    td += `<p id="table-number">${i + 1}</p>`
                    td += `</td>`

                    td += `<td class="table-song">`
                    td += `<img src="${art}" id="table-image" alt="">`
                    td += `<p id="table-song">${song_name}</p>`
                    td += `</td>`

                    td += `<td class="table-artist">`
                    td += `<p id="table-artist">${artist}</p>`
                    td += `</td>`

                    td += `<td class="table-album">`
                    td += `<p id="table-album">${album}</p>`
                    td += `</td>`

                    td += `<td class="table-time">`
                    td += `<p id="table-time">${year}/${month}/${day} ${hour()}:${minute()}:${second()}</p>`
                    td += `</td>`

                    td += `<td class="table-message">`
                    td += `<p id="table-message">${message}</p>`
                    td += `</td>`
                    td += `</tr>`
                    document.getElementById("table-items").innerHTML = td;
                });
            }
        });
    }, 3000);

    // Connect the player with the SDK.
    player.connect();
}

// Utility functions.
/**
 * Receive a duration in milliseconds and return a timer string in the mm:ss format.
 * @param ms - The duration in milliseconds.
 * @returns {string} - The formatted timer.
 */
function getTime(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    // If second equals to 60, +1 to minute instead.
    if (seconds === "60") {
        return `${minutes + 1}:00`;
    } else {
        // If the second is single digit, add a 0 before the value.
        return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
    }
}