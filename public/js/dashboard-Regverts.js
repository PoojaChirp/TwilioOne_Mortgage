// Global variables
// const config = require("./../../config.json");
// const phoneNumber = config.User1.phoneNumber;
const phoneNumber = "+13098264420"; // Replace with the desired phone number
const emailAddress = "psrinath@twilio.com"; // Replace with the desired email address

let shouldUpdateStatusFlag = true; // Flag to control status update
let previousStatus = null; // Variable to store the previous status

// Function to handle status update
function handleStatusUpdate(status) {
  // Update the status display
  document.getElementById("status").innerText = status;

  fetch("/handle-status", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      status: status,
      emailAddress: emailAddress,
      phoneNumber: phoneNumber,
    }),
  })
    .then((response) => response.text())
    .then((data) => console.log(data))
    .catch((error) => console.error("Error:", error));
}

// Event listener for other actions that might trigger a status update
document.addEventListener("DOMContentLoaded", function () {
  // Generate a random status
  const randomStatus = getRandomStatus();

  // Call handleStatusUpdate only when needed
  if (shouldUpdateStatus()) {
    handleStatusUpdate(randomStatus);

    // Update the previousStatus variable
    previousStatus = randomStatus;
  }
});

// Example helper function to determine if status should be updated
function shouldUpdateStatus() {
  return shouldUpdateStatusFlag;
}

// Function to get random status
function getRandomStatus() {
  const statuses = ["Submitted", "Processing", "Processed"];
  let status;

  do {
    status = statuses[Math.floor(Math.random() * statuses.length)];
  } while (status === previousStatus);

  return status;
}

// Send Email button logic
const sendEmailButton = document.getElementById("send_email");
sendEmailButton.addEventListener("click", async () => {
  // Set the flag to false after sending the email
  shouldUpdateStatusFlag = false;
  // Update the status display
  document.getElementById("status").innerText = "Email - Processed";

  const subject = document.getElementById("subject").value;
  const text = document.getElementById("message").value;

  const response = await fetch("/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to: emailAddress, // Replace with a valid email
      subject: subject,
      text: text,
    }),
  });

  const result = await response.json();
  alert(result.success ? "Email sent!" : `Error: ${result.error}`);
});

// Function to make a voice call
async function makeCall() {
  const response = await fetch("/call", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to: phoneNumber, // Replace with a valid number
      url: "http://demo.twilio.com/docs/voice.xml",
    }),
  });
  const result = await response.json();
  alert(result.success ? "Call made!" : `Error: ${result.error}`);
}

// Function to track an event
async function trackEvent() {
  const response = await fetch("/segment/track", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId: "user123",
      event: "Test Event",
      properties: {
        exampleProperty: "exampleValue",
      },
    }),
  });
  const result = await response.json();
  alert(result.success ? "Event tracked!" : `Error: ${result.error}`);
}

// Video call functionality
const joinBtn = document.getElementById("join-btn");
const endBtn = document.getElementById("end-btn");
const identityInput = document.getElementById("customInput");
const videoUrlContainer = document.getElementById("video-url-container");
const videoUrlInput = document.getElementById("video-url");
let room = null; // Variable to hold the room object

joinBtn.addEventListener("click", async () => {
  document.getElementById("status").innerText = "Video call";
  const identity = document.getElementById("customInput").value.trim();
  if (!identity) {
    alert("Please enter a name");
    return;
  }

  try {
    const response = await fetch(`/token?identity=${identity}`);
    const data = await response.json();
    const token = data.token;

    Twilio.Video.connect(token, {
      name: "my-video-room",
    })
      .then((joinedRoom) => {
        room = joinedRoom; // Store the room object
        console.log(`Successfully joined a Room: ${room}`);

        const videoContainer = document.getElementById("video-container");

        // Attach the local participant's video
        room.localParticipant.tracks.forEach((trackPublication) => {
          if (trackPublication.track.kind === "video") {
            videoContainer.appendChild(trackPublication.track.attach());
          }
        });

        // Attach the remote participants' videos
        room.on("participantConnected", (participant) => {
          participant.tracks.forEach((trackPublication) => {
            if (trackPublication.track.kind === "video") {
              videoContainer.appendChild(trackPublication.track.attach());
            }
          });

          participant.on("trackSubscribed", (track) => {
            if (track.kind === "video") {
              videoContainer.appendChild(track.attach());
            }
          });
        });

        room.on("participantDisconnected", (participant) => {
          participant.tracks.forEach((trackPublication) => {
            if (trackPublication.track.kind === "video") {
              const attachedElements = trackPublication.track.detach();
              attachedElements.forEach((element) => element.remove());
            }
          });
        });

        room.on("disconnected", (room) => {
          room.localParticipant.tracks.forEach((trackPublication) => {
            if (trackPublication.track.kind === "video") {
              const attachedElements = trackPublication.track.detach();
              attachedElements.forEach((element) => element.remove());
            }
          });
        });

        // Display and set the video URL to share with participants
        const url = `${window.location.origin}?room=${room.name}`;
        videoUrlInput.value = url;

        videoUrlContainer.style.display = "block";

        // Show the "End Call" button and hide the "Join Call" button
        joinBtn.style.display = "none";
        endBtn.style.display = "block";
      })
      .catch((error) => {
        console.error(`Unable to connect to Room: ${error.message}`);
      });
  } catch (error) {
    console.error(`Failed to join the video call: ${error.message}`);
  }
});

// End Call button logic
endBtn.addEventListener("click", () => {
  document.getElementById("status").innerText = "Video call - Processed";
  if (room) {
    room.disconnect(); // Disconnect from the room
    console.log("Disconnected from the room.");

    // Clear the video container
    const videoContainer = document.getElementById("video-container");
    while (videoContainer.firstChild) {
      videoContainer.removeChild(videoContainer.firstChild);
    }

    // Hide the "End Call" button and show the "Join Call" button
    endBtn.style.display = "none";
    joinBtn.style.display = "block";

    // Hide the video URL container
    videoUrlContainer.style.display = "none";
  }
});

// Automatically join the room if the URL has a "room" query parameter
const urlParams = new URLSearchParams(window.location.search);
const roomName = urlParams.get("room");

if (roomName) {
  const customPrompt = document.getElementById("customPrompt");
  customPrompt.style.display = "block";

  const confirmBtn = document.getElementById("confirmBtn");
  confirmBtn.addEventListener("click", () => {
    const identity = document.getElementById("customInput").value;
    if (identity) {
      const identityInput = document.getElementById("identityInput");
      identityInput.value = identity;
      document.getElementById("join-btn").click();
      customPrompt.style.display = "none";
    }
  });
}
