const videoPlayer = document.getElementById("videoPlayer");
const playButton = document.getElementById("btnPlay");
const stopButton = document.getElementById("btnStop");
const progressBar = document.getElementById("progressBar");
const timestamp = document.getElementById("timestamp");
const videoPlayerControls = document.getElementById("videoPlayerControls");
const controlsContainer = document.getElementById("controlsContainer"); //Listenes for mouse in/out events

videoPlayer.addEventListener("play", toggleVideoPlayerIcons);
videoPlayer.addEventListener("pause", toggleVideoPlayerIcons);
videoPlayer.addEventListener("timeupdate", updateVideoProgress);

playButton.addEventListener("click", toggleVideoPlayback);

stopButton.addEventListener("click", stopVideoPlayback);

progressBar.addEventListener("change", progressChanged);

// Adding mouse in/out event on controls backdrop
controlsContainer.addEventListener("mouseenter", showControls);

//Show COntrols
function showControls() {
  videoPlayerControls.style.bottom = "0";
}

controlsContainer.addEventListener("mouseleave", hideControls);

const debounce = new Debounce(3000); //3 Seconds debounce
// Hide Controls
function hideControls() {
  debounce.start().onComplete(() => {
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
