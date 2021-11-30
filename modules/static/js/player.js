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
    player.addListener("ready", ({device_id}) => {
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
    });

    player.addListener("not_ready", ({device_id}) => {
        console.log("Device ID has gone offline", device_id);
    });

    player.addListener("initialization_error", ({message}) => {
        console.error(message);
    });

    player.addListener("authentication_error", ({message}) => {
        console.error(message);
    });

    player.addListener("account_error", ({message}) => {
        console.error(message);
    });

    player.addListener("autoplay_failed", () => {
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
    const form = document.getElementById("form");
    const progress = new ProgressBar.Line("#playback-bar", {
        color: "#b3b3b3",
        trailColor: "#535353",
        svgStyle: {
            strokeLinecap: "round",
        },
    });

    // Location of the current object as url.
    const location = `${window.location.protocol}//${window.location.host}/`;

    /**
     * Update various elements on the player whenever a change in the player state is detected.
     */
    let duration_ms;
    player.addListener("player_state_changed", ({paused, repeat_mode, shuffle, track_window: {current_track}}) => {
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
        document.getElementById("song-name").innerText = current_track.name;
        document.getElementById("song-name").href = `https://open.spotify.com/album/${current_track.album.uri.split(":")[2]}`
        document.getElementById("artist-name").innerText = current_track.artists[0].name;
        document.getElementById("artist-name").href = `https://open.spotify.com/album/${current_track.artists[0].uri.split(":")[2]}`;

        duration_ms = current_track.duration_ms;
        document.getElementById("playback-end").innerText = getTime(duration_ms);
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
     * Get the form data values as an Object prototype.
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
        console.log(response);
    }

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
        return (minutes + 1) + ":00";
    } else {
        // If the second is single digit, add a 0 before the value.
        return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
    }
}