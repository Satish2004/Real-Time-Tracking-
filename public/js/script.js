// Initialize socket.io connection
const socket = io();

// Check if the browser supports geolocation
if (navigator.geolocation) {
  navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      console.log("Current position:", latitude, longitude);
      // Emit location to the server
      socket.emit("send-location", { latitude, longitude });
    },
    (error) => {
      console.error("Error getting geolocation:", error);
    },
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    }
  );
} else {
  console.error("Geolocation is not supported by this browser.");
}

// Initialize Leaflet map
const map = L.map("map").setView([0, 0], 2); // Initial view set to zoom out

// Set up the map's tile layer (e.g., OpenStreetMap)
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "Satish chandra",
}).addTo(map);

// Create a dictionary to hold user markers
const markers = {};
let firstLocation = true; // Track the first location update

socket.on("receive-location", (data) => {
  const { id, latitude, longitude } = data;

  // If it's the first location received, set the view to that location
  if (firstLocation) {
    map.setView([latitude, longitude], 16); // Set initial zoom
    firstLocation = false;
  }

  // If marker for this user already exists, update its location
  if (markers[id]) {
    markers[id].setLatLng([latitude, longitude]);
  }
  // If marker for this user doesn't exist, create it
  else {
    markers[id] = L.marker([latitude, longitude]).addTo(map);
  }
});

// Handle user disconnection and remove their marker
socket.on("user-disconnected", (id) => {
  if (markers[id]) {
    map.removeLayer(markers[id]);
    delete markers[id];
  }
});
