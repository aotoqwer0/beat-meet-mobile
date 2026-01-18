import TrackPlayer, { Event } from 'react-native-track-player';

module.exports = async function () {
  // This service needs to be registered for the module to work
  // When the user presses "Play" on their headphones or lock screen
  TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());

  // When the user presses "Pause"
  TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());

  // When the user presses "Next"
  TrackPlayer.addEventListener(Event.RemoteNext, () => TrackPlayer.skipToNext());

  // When the user presses "Previous"
  TrackPlayer.addEventListener(Event.RemotePrevious, () => TrackPlayer.skipToPrevious());

  // Handle interruptions (e.g., incoming call)
  TrackPlayer.addEventListener(Event.RemoteDuck, async (e) => {
    if (e.paused) {
      TrackPlayer.pause();
    } else {
      TrackPlayer.play();
    }
  });
};