window.onSpotifyWebPlaybackSDKReady = () => {
    const player = new Spotify.Player({
        name: "Spotipyn",
        getOAuthToken: cb => {
            cb(token);
        },
        volume: 0.75
    });

    /**
     * Log the player state and status on initialization to the console.
     */
    player.addListener("ready", ({device_id}) => {
        console.log('Ready with Device ID', device_id);
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

    // Get the buttons.
    const play_button = document.getElementById("play");
    const fast_backwards = document.getElementById("fast_backwards");
    const fast_forward = document.getElementById("fast_forward");
    const shuffle_button = document.getElementById("shuffle");
    const loop_button = document.getElementById("loop");
    const volume_button = document.getElementById("volume");
    const volume_bar = document.getElementById("volume-bar");

    /**
     * Change the shuffle and loop button state to blue/white automatically when its change of state is detected.
     *
     * Also attempt to update the song name, artist, album art, and timer during the first 5% progress on the new song.
     */
    player.addListener("player_state_changed", ({shuffle, repeat_mode, position}) => {
        if (shuffle) {
            // shuffle_button.src = "{{ url_for('static', filename='img/player/shuffle_button_toggled.png') }}";
            shuffle_button.src = "/static/img/player/shuffle_button_toggled.png"
        } else {
            shuffle_button.src = "static/img/player/shuffle_button.png";
        }

        if (repeat_mode === 0) {
            loop_button.src = "static/img/player/loop_button.png";
        } else if (repeat_mode === 1) {
            loop_button.src = "static/img/player/loop_button_toggled_1.png";
        } else {
            loop_button.src = "static/img/player/loop_button_toggled_2.png";
        }

        player.getVolume().then(volume => {
            volume_bar.value = volume;
        });

        const max = document.getElementById("playback-bar").max;
        if (position / max < 0.05) {
            updateState();
        }
    });

    /**
     * Swap the state of the play/pause button accordingly to the current song playback state, and trigger/stop the
     * timer and progress bar when the song is play/paused.
     * @returns {Promise<void>}
     */
    play_button.onclick = async function () {
        player.togglePlay();
        await updateState();
        let timer = window.setInterval(updatePosition, 1000);
        player.getCurrentState().then(state => {
            if (!state) {
                return;
            }

            if (state.paused) {
                play_button.src = "static/img/player/play_button_hover.png";
                clearInterval(timer);
            } else {
                play_button.src = "static/img/player/pause_button_hover.png";
                // Start the playback progress bar when the song is played.
                window.setInterval(updatePosition, 1000);
            }
        });
    }

    // Location of the current object as url.
    const location = window.location.toString()

    /**
     * Change the button to blue when the cursor is on the element.
     */
    play_button.onmouseover = function () {
        if (play_button.src === location + "static/img/player/play_button.png") {
            play_button.src = "static/img/player/play_button_hover.png";
        } else if (play_button.src === location + "static/img/player/pause_button.png") {
            play_button.src = "static/img/player/pause_button_hover.png";
        }
    }

    /**
     * Return the button to white when the cursor leaves the button.
     */
    play_button.onmouseout = function () {
        if (play_button.src === location + "static/img/player/play_button_hover.png") {
            play_button.src = "static/img/player/play_button.png";
        } else if (play_button.src === location + "static/img/player/pause_button_hover.png") {
            play_button.src = "static/img/player/pause_button.png";
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
        await updateState();
    }

    /**
     * Change the button to blue when the cursor is on the element.
     */
    fast_backwards.onmouseover = function () {
        fast_backwards.src = "static/img/player/fast_backwards_button_hover.png";
    }

    /**
     * Return the button to white when the cursor leaves the button.
     */
    fast_backwards.onmouseout = function () {
        fast_backwards.src = "static/img/player/fast_backwards_button.png";
    }

    /**
     * Single click to jump to the next track.
     * @returns {Promise<void>}
     */
    fast_forward.onclick = async function () {
        player.nextTrack();
        await updateState();
    };

    /**
     * Change the button to blue when the cursor is on the element.
     */
    fast_forward.onmouseover = function () {
        fast_forward.src = "static/img/player/fast_forward_button_hover.png";
    }

    /**
     * Return the button to white when the cursor leaves the button.
     */
    fast_forward.onmouseout = function () {
        fast_forward.src = "static/img/player/fast_forward_button.png";
    }

    /**
     * Change the button to blue when the cursor is on the element.
     */
    volume_button.onmouseover = function () {
        volume_button.src = "static/img/player/unmute_button_hover.png";
    }

    /**
     * Return the button to white when the cursor leaves the button.
     */
    volume_button.onmouseout = function () {
        volume_button.src = "static/img/player/unmute_button.png";
    }

    /**
     * Update the volume of the player when a change in input value is detected, and change the volume icon to mute if = 0,
     * as well as apply an alternative color when the slider is being clicked on.
     */
    volume_bar.addEventListener("input", function () {
        let volume = volume_bar.value;
        player.setVolume(volume);

        if (volume === "0") {
            volume_button.src = "static/img/player/mute_button_hover.png";

            volume_bar.onmousedown = function () {
                volume_button.src = "static/img/player/mute_button_hover.png";
            }

            volume_bar.onmouseup = function () {
                volume_button.src = "static/img/player/mute_button.png";
            }
        } else {
            volume_button.src = "static/img/player/unmute_button_hover.png";

            volume_bar.onmousedown = function () {
                volume_button.src = "static/img/player/unmute_button_hover.png";
            }

            volume_bar.onmouseup = function () {
                volume_button.src = "static/img/player/unmute_button.png";
            }
        }
    });

    /**
     * Update the song name, artist name, album cover, and the song duration of a track whenever the user interact with the player.
     *
     * Note: Spotify API has a delay in response. Without this, it would result in a return of an outdated WebPlaybackState object,
     * which would lead to the song name not being updated correctly and a plethora of other related problems. Basically an API limitation.
     * 250ms is a safe number to guarantee an up-to-date response.
     *
     * @returns {Promise<void>}
     */
    async function updateState() {
        await sleep(250);
        player.getCurrentState().then(state => {
            if (!state) {
                return;
            }

            document.getElementById("song-name").innerText = state.track_window.current_track.name;
            document.getElementById("artist-name").innerText = state.track_window.current_track.artists[0].name;
            document.getElementById("album-cover").src = state.track_window.current_track.album.images[0].url;

            const duration_ms = state.track_window.current_track.duration_ms;
            document.getElementById("playback-bar").max = duration_ms;
            document.getElementById("playback-end").innerText = getTimer(duration_ms);
            document.getElementById("playback-bar").value = state.position;
        });
    }

    /**
     * Get the position of the current playing track in ms and update the progress bar and the timer on the left accordingly.
     */
    function updatePosition() {
        player.getCurrentState().then(state => {
            if (!state) {
                return;
            }

            const position = state.position;
            document.getElementById("playback-start").innerText = getTimer(position);
            document.getElementById("playback-bar").value = position;

        });
    }

    // Connect the player with the SDK.
    player.connect();
}

// Utility functions.
/**
 * Set a delay for the code asynchronously similarly to Python's time.sleep().
 * @param ms - The time in milliseconds.
 * @returns {Promise<unknown>}
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Receive a duration in milliseconds and return a timer string in the mm:ss format.
 * @param ms - The duration in milliseconds.
 * @returns {string} - The formatted timer.
 */
function getTimer(ms) {
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