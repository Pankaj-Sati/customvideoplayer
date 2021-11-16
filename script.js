const videoPlayer = document.getElementById("videoPlayer");
const playButton = document.getElementById("btnPlay");
const stopButton = document.getElementById("btnStop");
const progressBar = document.getElementById("progressBar");
const timestamp = document.getElementById("timestamp");
const videoPlayerControls = document.getElementById("videoPlayerControls");
const controlsContainer = document.getElementById("controlsContainer"); //Listenes for mouse in/out events
const skipControls = document.getElementById("skipContols"); //Listenes for double click events

//Configuration object mapping the DOM element ids
const config = {
  backwardSkipEl: "backwardSkip",
  forwardSkipEl: "forwardSkip",
  skipIconEl: "skip-icon",
  skipDurationSec: 10,
  videoSkipDebounceMilli: 200,
  controlsDebounceMilli: 3000,
};

videoPlayer.addEventListener("play", toggleVideoPlayerIcons);
videoPlayer.addEventListener("pause", toggleVideoPlayerIcons);
videoPlayer.addEventListener("timeupdate", updateVideoProgress);
videoPlayer.addEventListener("touchstart", showControls);

playButton.addEventListener("click", toggleVideoPlayback);

stopButton.addEventListener("click", stopVideoPlayback);

progressBar.addEventListener("change", progressChanged);

//Adding video skip forward/backward controls
const videoSkipDebounce = new Debounce(config.videoSkipDebounceMilli); //We will listen for double click
let doubleClickCounter = 0; //Used to deduce a double click event
skipControls.addEventListener("click", (event) => {
  /**
   * Logic
   * We increment the click counter if user clicks on forward skip element
   * And decrement the click counter for backward skip element
   * For each click, we re-start a debounce
   * When debounce completes, we check if the click counter is >=+2 : Forward skip
   * Else if click counter was <=-2, then backward skip
   * Finally, we reset the counter value back to 0
   *
   * If we click only once, then debounce will complete with counter value 1 or -1 and reset
   * itself back to 0
   */
  if (event.target.id === config.forwardSkipEl) {
    if (doubleClickCounter < 0) {
      doubleClickCounter = 0;
    }
    doubleClickCounter++;
  } else if (event.target.id === config.backwardSkipEl) {
    if (doubleClickCounter > 0) {
      doubleClickCounter = 0;
    }
    doubleClickCounter--;
  }

  videoSkipDebounce.start().onComplete(() => {
    if (doubleClickCounter >= 2) {
      //Double clicked Forward
      skipVideo(true);
    } else if (doubleClickCounter <= -2) {
      //  Double clicked Backward
      skipVideo(false);
    }
    doubleClickCounter = 0;
  });
});

// Adding mouse in/out event on controls backdrop
controlsContainer.addEventListener("mouseenter", showControls);

//Show COntrols
function showControls() {
  videoPlayerControls.style.bottom = "0";
}

controlsContainer.addEventListener("mouseleave", hideControls);

const videoControlsDebounce = new Debounce(config.controlsDebounceMilli); //3 Seconds debounce
// Hide Controls
function hideControls() {
  videoControlsDebounce.start().onComplete(() => {
    videoPlayerControls.style.bottom = "-24px";
  });
}

/**
 * Changes the video player icons
 * if paused, it changes icon to play & vice-versa
 */
function toggleVideoPlayerIcons() {
  const iconEl = playButton.getElementsByTagName("i")[0];
  if (videoPlayer.paused) {
    //Video is paused
    iconEl.classList.add("fa-play");
    iconEl.classList.remove("fa-pause");
  } else {
    iconEl.classList.remove("fa-play");
    iconEl.classList.add("fa-pause");
  }
}

/**
 * Toggles video playback i.e. sets video to play if in paused state and
 * vice-versa
 */
function toggleVideoPlayback() {
  if (videoPlayer.paused) {
    videoPlayer.play();
  } else {
    videoPlayer.pause();
    hideControls();
  }
}

/**
 * Stops video playback by resetting the current time and set state to paused
 */
function stopVideoPlayback() {
  videoPlayer.pause();
  videoPlayer.currentTime = 0;
}

/**
 * Updates the progress bar & timer each time the timerupdate event in called
 */
function updateVideoProgress() {
  progressBar.value = (videoPlayer.currentTime / videoPlayer.duration) * 100;

  timestamp.innerText = convertTime(videoPlayer.currentTime);
}

/**
 * Converts number of seconds into minutes:seconds format (MM:SS)
 * @param {*} seconds
 * @returns string formatted time in MM:SS
 */
function convertTime(seconds) {
  const minutes = Math.floor(+seconds / 60);
  const sec = Math.floor(+seconds % 60);

  return `${minutes > 9 ? minutes : "0" + minutes}:${
    sec > 9 ? sec : "0" + sec
  }`;
}

/**
 * Updates the current timer of the video
 * Called when user changes the video progress input
 */
function progressChanged() {
  const progressPercent = +progressBar.value;
  videoPlayer.currentTime = (progressPercent * videoPlayer.duration) / 100;
  convertTime(videoPlayer.currentTime);
}

/**
 * Skips a video forward or backward
 * @param {*} isForward boolean
 */
function skipVideo(isForward) {
  if (isForward) {
    videoPlayer.currentTime += config.skipDurationSec;
    animateIcon(
      document
        .getElementById(config.forwardSkipEl)
        .querySelector(`.${config.skipIconEl}`)
    );
  } else {
    videoPlayer.currentTime -= config.skipDurationSec;
    animateIcon(
      document
        .getElementById(config.backwardSkipEl)
        .querySelector(`.${config.skipIconEl}`)
    );
  }
}

/**
 * A debounce timer constructor function
 * It will have following properties
 * ** start(): Starts the debounce timer. If a timer was already running, we will clear it
 * @param {*} milliseconds for debounce
 */
function Debounce(milliseconds) {
  let timerValue;
  let callbackFn; //Function to invoke on Complete
  /**
   *
   * @returns Object containing onComplete method that accepts a callback function
   * as an argument
   */
  this.start = () => {
    if (timerValue) {
      //If the timer already exist, clear it
      clearTimeout(timerValue);
    }
    timerValue = setTimeout(() => {
      if (callbackFn) {
        callbackFn(); //Invoking the callback function
      } else {
        throw new Error("No callback was provided");
      }
    }, milliseconds); //Set a new Timeout
    return {
      onComplete: onComplete,
    };
  };

  let onComplete = (callback) => {
    if (!callbackFn instanceof Function) {
      throw new Error("A callback function was expected");
    }

    callbackFn = callback; //Saving reference to the call back function
  };
}

/**
 * Animates the fading of icon on a DOM element
 * @param {*} iconElement Element used for displaying icon
 */
function animateIcon(iconElement) {
  if (!iconElement) {
    throw new Error("Unknown icon to animate");
  }
  iconElement.style.visibility = "visible";
  iconElement.style.opacity = "1";
  setTimeout(() => {
    iconElement.style.visibility = "hidden";
    iconElement.style.opacity = "0";
  }, config.videoSkipDebounceMilli);
}
