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

    // Get the buttons.
    const play_button = document.getElementById("play");
    const fast_backwards = document.getElementById("fast_backwards");
    const fast_forward = document.getElementById("fast_forward");
    const shuffle_button = document.getElementById("shuffle");
    const loop_button = document.getElementById("loop");
    const volume_button = document.getElementById("volume");
    const volume_bar = document.getElementById("volume-bar");

    // Location of the current object as url.
    const location = `${window.location.protocol}//${window.location.host}/`;

    /**
     * Update various elements on the player whenever a change in the player state is detected.
     */
    player.addListener("player_state_changed", ({paused, repeat_mode, shuffle, track_window: {current_track}}) => {
        if (paused) {
            // Without this, when the button is clicked and if the mouse is still on it, it would display the white version of the button.
            if (play_button.src === location + "static/img/player/pause_button.png") {
                play_button.src = location + "static/img/player/play_button.png";
            }
        } else {
            if (play_button.src === location + "static/img/player/play_button.png") {
                play_button.src = location + "static/img/player/pause_button.png";
            }
        }

        // If repeat mode is being toggled on/off elsewhere, automatically update the element to reflect the change.
        // Secondary checks are used to prevent conflict with the onclick function that would make the button go crazy.
        if (repeat_mode === 0 && loop_button.src === location + "static/img/player/loop_button_toggled_2.png") {
            loop_button.src = location + "static/img/player/loop_button.png";
        } else if (repeat_mode === 1 && loop_button.src === location + "static/img/player/loop_button.png") {
            loop_button.src = location + "static/img/player/loop_button_toggled_1.png";
        } else if (repeat_mode === 2 && loop_button.src === location + "static/img/player/loop_button_toggled_1.png") {
            loop_button.src = location + "static/img/player/loop_button_toggled_2.png";
        }

        // If shuffle is being toggled on/off elsewhere, automatically update the element to reflect the change.
        if (shuffle) {
            shuffle_button.src = location + "/static/img/player/shuffle_button_toggled.png"
        } else {
            shuffle_button.src = location + "static/img/player/shuffle_button.png";
        }

        // If shuffle is being toggled on/off elsewhere, automatically update the element to reflect the change.
        document.getElementById("song-name").innerText = current_track.name;
        document.getElementById("album-cover").src = current_track.album.images[0].url;
        document.getElementById("artist-name").innerText = current_track.artists[0].name;

        const duration_ms = current_track.duration_ms;
        document.getElementById("playback-bar").max = duration_ms;
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
                play_button.src = location + "static/img/player/pause_button_hover.png";
                interval_id = window.setInterval(updatePosition, 1000);
            } else {
                play_button.src = location + "static/img/player/play_button_hover.png";
                clearInterval(interval_id);
            }
        });

        // Play/pause the music again.
        player.togglePlay();
    }

    /**
     * Change the button to blue when the cursor is on the element.
     */
    play_button.onmouseover = function () {
        if (play_button.src === location + "static/img/player/play_button.png") {
            play_button.src = location + "static/img/player/play_button_hover.png";
        } else if (play_button.src === location + "static/img/player/pause_button.png") {
            play_button.src = location + "static/img/player/pause_button_hover.png";
        }
    }

    /**
     * Return the button to white when the cursor leaves the button.
     */
    play_button.onmouseout = function () {
        if (play_button.src === location + "static/img/player/play_button_hover.png") {
            play_button.src = location + "static/img/player/play_button.png";
        } else if (play_button.src === location + "static/img/player/pause_button_hover.png") {
            play_button.src = location + "static/img/player/pause_button.png";
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
     * Change the button to blue when the cursor is on the element.
     */
    fast_backwards.onmouseover = function () {
        fast_backwards.src = location + "static/img/player/fast_backwards_button_hover.png";
    }

    /**
     * Return the button to white when the cursor leaves the button.
     */
    fast_backwards.onmouseout = function () {
        fast_backwards.src = location + "static/img/player/fast_backwards_button.png";
    }

    /**
     * Single click to jump to the next track.
     * @returns {Promise<void>}
     */
    fast_forward.onclick = async function () {
        player.nextTrack();
    };

    /**
     * Change the button to blue when the cursor is on the element.
     */
    fast_forward.onmouseover = function () {
        fast_forward.src = location + "static/img/player/fast_forward_button_hover.png";
    }

    /**
     * Return the button to white when the cursor leaves the button.
     */
    fast_forward.onmouseout = function () {
        fast_forward.src = location + "static/img/player/fast_forward_button.png";
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
                    shuffle_button.src = location + "static/img/player/shuffle_button.png";
                });
            } else {
                spotify.setShuffle(true, null, function () {
                    shuffle_button.src = location + "static/img/player/shuffle_button_toggled.png";
                });
            }
        });
    }

    /**
     * Change the state of the repeat mode to 0, 1, 2 (off, context, track).
     */
    loop_button.onclick = function () {
        player.getCurrentState().then(state => {
            if (!state) {
                return;
            }

            if (state.repeat_mode === 0) {
                spotify.setRepeat("context", null, function () {
                    loop_button.src = location + "static/img/player/loop_button_toggled_1.png";
                });
            } else if (state.repeat_mode === 1) {
                spotify.setRepeat("track", null, function () {
                    loop_button.src = location + "static/img/player/loop_button_toggled_2.png";
                });
            } else if (state.repeat_mode === 2) {
                spotify.setRepeat("off", null, function () {
                    loop_button.src = location + "static/img/player/loop_button.png";
                });
            }
        });
    }

    /**
     * Change the button to blue when the cursor is on the element.
     */
    volume_button.onmouseover = function () {
        volume_button.src = location + "static/img/player/unmute_button_hover.png";
    }

    /**
     * Return the button to white when the cursor leaves the button.
     */
    volume_button.onmouseout = function () {
        volume_button.src = location + "static/img/player/unmute_button.png";
    }

    /**
     * Update the volume of the player when a change in input value is detected, and change the volume icon to mute if = 0,
     * as well as apply an alternative color when the slider is being clicked on.
     */
    volume_bar.addEventListener("input", function () {
        const volume = volume_bar.value;
        player.setVolume(volume);

        if (volume === "0") {
            volume_button.src = location + "static/img/player/mute_button_hover.png";

            volume_bar.onmousedown = function () {
                volume_button.src = location + "static/img/player/mute_button_hover.png";
            }

            volume_bar.onmouseup = function () {
                volume_button.src = location + "static/img/player/mute_button.png";
            }
        } else {
            volume_button.src = location + "static/img/player/unmute_button_hover.png";

            volume_bar.onmousedown = function () {
                volume_button.src = location + "static/img/player/unmute_button_hover.png";
            }

            volume_bar.onmouseup = function () {
                volume_button.src = location + "static/img/player/unmute_button.png";
            }
        }
    });

    /**
     * Get the position of the current playing track in ms and update the progress bar and the timer on the left accordingly.
     */
    function updatePosition() {
        player.getCurrentState().then(state => {
            if (!state) {
                return;
            }

            const position = state.position;
            console.log(position);
            document.getElementById("playback-start").innerText = getTime(position);
            document.getElementById("playback-bar").value = position;

        });
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