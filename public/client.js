/* 
// LOGIC 🤓
- Create Room
- You go to the Room 
- Enter your name

- Check if there is old Data:
	- Get the Socket Data
	
- Select Restaurant
- Select an Arrival Point
- Calculate Time

SHARE LIVE SOCKET DATA :
	clients,
  original position,
  restaurant position,
  drag position, 
  final destination position,
  calculate time,

// TO START : npm run start
// LINK : http://localhost:3000
*/

// SOCKETS/DOM VARIABLES
const socket = io("http://localhost:3000");
const messageContainer = document.getElementById("message-container");
const roomContainer = document.getElementById("room-container");
const messageForm = document.getElementById("send-container");
const messageInput = document.getElementById("message-input");

// DOM VARIABLES
const distanceDOM = document.querySelector("#distance");
const speedDOM = document.querySelector("#speed");
const tempsDOM = document.querySelector("#temps");
const restos = document.querySelectorAll(".resto");
const distancePhrasesContainer = document.querySelector(".calc-distance-live");
const distancePhrases = document.querySelectorAll(".calc-distance-phrase");

let mapUsers = [],
  latLngs = [],
  dragMarker,
  destinationSelected = false,
  restoSelected = false,
  arrivalPointSelected = false,
  randomPositions = [
    [48.892656039268175, 2.224818735812648],
    [48.89618286859847, 2.2292598687723957],
    [48.8894675714243, 2.228852228549019],
    [48.891978859564844, 2.230031490325928],
    [48.892938194770835, 2.229516506195069],
    [48.89278300944141, 2.228314876556397],
    [48.8921058314579, 2.2311687469482426],
    [48.891978859564844, 2.2325205802917485],
    [48.89219047920743, 2.2284007072448735],
    [48.89398215628476, 2.228336334228516],
    [48.89372822170669, 2.2277569770812993],
    [48.89299462568024, 2.22649097442627],
    [48.892895871546926, 2.2276496887207036],
    [48.89355893127141, 2.2256541252136235],
    [48.89257139230686, 2.226018905639649],
    [48.891922427508895, 2.2266840934753422],
    [48.89219047920743, 2.225546836853028],
    [48.892895871546926, 2.2250103950500493],
    [48.89354482370927, 2.2245812416076665],
    [48.89732550793501, 2.220568656921387],
    [48.89757942424058, 2.2213840484619145],
    [48.89736782740884, 2.22249984741211],
    [48.89687409798481, 2.2230362892150883],
    [48.896140548121444, 2.223143577575684],
    [48.896112334450194, 2.2235083580017094],
    [48.895646806575485, 2.2238516807556157],
    [48.895533950680296, 2.2242808341979985],
    [48.89489913152242, 2.2244095802307133],
    [48.8954916296539, 2.2254824638366704],
    [48.896352150148275, 2.2265768051147465],
    [48.8961264412878, 2.2273278236389165],
    [48.89652143112482, 2.2285509109497075],
    [48.89717033622444, 2.228014469146729],
    [48.897057483768734, 2.2262763977050786],
    [48.89673303153939, 2.2256970405578618],
    [48.897113910028416, 2.2250533103942876],
    [48.89739604037151, 2.224066257476807],
    [48.89781923290043, 2.2259545326232915],
    [48.897734594681296, 2.227263450622559],
    [48.897762807436926, 2.228765487670899],
    [48.897254975399015, 2.2291302680969243],
    [48.896972844259764, 2.2299456596374516],
    [48.8976499563188, 2.2299671173095708],
  ], // I'M USING HERE A RANDOM POSITIONS FOR CLIENTS, SO I CAN TEST BUT OF COURSE WE CAN USE: navigator.geolocation.getCurrentPosition :)
  name;

// MAP MANAGEMENT
let map = L.map("map").setView([48.89314, 2.22691], 16);

L.tileLayer(
  "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw",
  {
    maxZoom: 18,
    attribution:
      'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
      '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: "mapbox/streets-v11",
    tileSize: 512,
    zoomOffset: -1,
    accessToken:
      "pk.eyJ1IjoiYWRpbWVyIiwiYSI6ImNrN3c1aWwzbTAwc2czbGxwd3JybXNmNnIifQ.IahW77oZa7y_dHVQZqrkcg",
  }
).addTo(map);

function addDragMarker(newPosition, latLngs, fromSocket = false) {
  deleteLines();

  dragMarker = new L.marker(newPosition, { draggable: "true" });

  // ON DRAG
  dragMarker.on("dragend", function (event) {
    deleteLines();
    if (map.hasLayer(dragMarker)) {
      map.removeLayer(dragMarker);
    }

    var marker = event.target;
    var position = marker.getLatLng();

    latLngs[latLngs.length - 1] = [position.lat, position.lng];

    marker.setLatLng(new L.LatLng(position.lat, position.lng), {
      draggable: "true",
    });

    calcDistance(latLngs);

    map.panTo(new L.LatLng(position.lat, position.lng));

    socket.emit("set-live-data", roomName, latLngs, {
      distance: distanceDOM.value,
      temps: tempsDOM.value,
    });
    updateDistancePhrase(name, tempsDOM.value);
    calcDistanceForOthers(mapUsers, [position.lat, position.lng]);
  });
  map.addLayer(dragMarker);

  if (fromSocket && !restoSelected) {
    dragMarker.dragging.disable();
  }

  // ON FIRST TAP
  latLngs.push(newPosition);
  calcDistanceForOthers(mapUsers, newPosition);
  calcDistance(latLngs);
}

function onMapClick(e) {
  if (restoSelected) {
    if (arrivalPointSelected) return false;
    if (destinationSelected) return false;

    if (map.hasLayer(dragMarker)) {
      map.removeLayer(dragMarker);
    }

    addDragMarker([e.latlng.lat, e.latlng.lng], latLngs);

    arrivalPointSelected = true;

    socket.emit("set-live-data", roomName, latLngs, {
      distance: distanceDOM.value,
      temps: tempsDOM.value,
    });
    updateDistancePhrase(name, tempsDOM.value);
  } else {
    alert('Please select a restaurant below first :)')
  }
}
map.on("click", onMapClick);

function markInMap(lat, lng, customIcon = false, name = false) {
  if (customIcon) {
    const customIcon = new L.divIcon({
      className: "",
      iconAnchor: [0, 24],
      labelAnchor: [-6, 0],
      popupAnchor: [0, -36],
      html: `<span class="my-custom-pin">${name.charAt(0)}</span>`,
    });

    L.marker([parseFloat(lat), parseFloat(lng)], { icon: customIcon }).addTo(
      map
    );
    return false;
  }

  L.marker([parseFloat(lat), parseFloat(lng)]).addTo(map);
}

function calcDistance(latLngs) {
  let polyline = L.polyline(latLngs, { color: "red" }).addTo(map);
  let dists = polyline.measuredDistance().split(" ");
  if (dists[1] === "m") {
    distanceVar = parseFloat(dists[0]) / 1000;
  } else {
    distanceVar = parseFloat(dists[0]);
  }

  speed = parseFloat(speedDOM.value);
  temps = distanceVar / speed;
  temps = temps * 60 * 60;

  distanceDOM.value = distanceVar;
  tempsDOM.value = new Date(temps * 1000).toISOString().substr(11, 8);
}

function deleteLines() {
  for (i in map._layers) {
    if (map._layers[i]._path != undefined) {
      try {
        map.removeLayer(map._layers[i]);
      } catch (e) {
        console.log(`Problem with : ${e + map._layers[i]}`);
      }
    }
  }
}

// INIT
if (messageForm != null) {
  while (!name) {
    name = prompt("What is your name?");
  }
  document.querySelector(".calc-distance-phrase").setAttribute("id", name);
  document
    .querySelector(".calc-distance-phrase")
    .querySelector(".client").textContent = name;

  appendMessage("You joined");

  let randomPosition = ~~(Math.random() * randomPositions.length);
  markInMap(
    randomPositions[randomPosition][0],
    randomPositions[randomPosition][1],
    (customIcon = true),
    name
  );

  socket.emit("new-user", roomName, name, randomPositions[randomPosition]);

  restos.forEach((resto) =>
    resto.addEventListener("click", function () {
      if (restoSelected) return;

      // PUSH MY POSITION AS FIRST ELEMENT IN THE ARRAY…
      latLngs.push(randomPositions[randomPosition]);

      // PUSH THE RESTAURANT…
      const [restoLat, restoLng] = resto.dataset.position.split(",");
      latLngs.push([+restoLat, +restoLng]);

      calcDistance(latLngs);

      restoSelected = true;
      if (destinationSelected) {
        dragMarker.dragging.enable();
      }

      socket.emit("set-live-data", roomName, latLngs, {
        distance: distanceDOM.value,
        temps: tempsDOM.value,
      });
      updateDistancePhrase(name, tempsDOM.value);
    })
  );

  messageForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const message = messageInput.value;
    appendMessage(`You: ${message}`);
    socket.emit("send-chat-message", roomName, message);
    messageInput.value = "";
  });
}

// SOCKETS AND HELPERS
socket.on("user-connected", (data) => {
  const { newUserData, clients } = data;

  if (newUserData.name !== name) appendMessage(`${newUserData.name} connected`);

  for (let user in clients) {
    if (clients[user].name !== name) {
      markInMap(
        clients[user].position[0],
        clients[user].position[1],
        (customIcon = true),
        clients[user].name
      );
      distancePhrasesContainer.insertAdjacentHTML(
        "afterbegin",
        `
      <p class="calc-distance-phrase" id="${clients[user].name}">Miam à <strong class="arrivalTime">13:00</strong>, <strong class="client">${clients[user].name}</strong> doit partir à <strong class="departTime">00:00:00</strong></p>
    `
      );
    }
  }
});

socket.on("get-live-data", (data) => {
  let copyDistanceDOM = distanceDOM.value;
  let copyTempsDOM = tempsDOM.value;

  // (data.latLngs).length TO KNOW IF IT IS A RESTAURANT: 2 CHOICE OR FINAL DESTINATION CHOICE: 3
  if (data.name !== name && data.latLngs.length === 2) {
    markInMap(data.latLngs[0][1], data.latLngs[0][0]);
    calcDistance(data.latLngs);
    mapUsers.push(data.latLngs);
    updateDistancePhrase(data.name.name, data.time.temps);
  } else if (data.name !== name && data.latLngs.length > 2) {
    if (map.hasLayer(dragMarker)) map.removeLayer(dragMarker);
    updateDistancePhrase(data.name.name, data.time.temps);
    addDragMarker(data.latLngs[data.latLngs.length - 1], [
      data.latLngs[0],
      data.latLngs[1],
    ]);
  }

  distanceDOM.value = copyDistanceDOM;
  tempsDOM.value = copyTempsDOM;
});

socket.on("chat-message", (data) => {
  appendMessage(`${data.name.name}: ${data.message}`);
});

socket.on("user-disconnected", (data) => {
  appendMessage(`${data.name} disconnected`);
});

function appendMessage(message) {
  const messageElement = document.createElement("div");
  messageElement.innerText = message;
  messageContainer.append(messageElement);
}

function calcDistanceForOthers(latlngs, newPosition) {
  latlngs.forEach((user) => {
    if (user.length > 2) user.pop();
    user.push(newPosition);
    calcDistance(user);
  });
}

function updateDistancePhrase(name, time) {
  const phrase = document.querySelector(`#${name}`);
  const arrivalTime = phrase.querySelector(".arrivalTime");
  const nameDOM = phrase.querySelector(".client");
  const departTime = phrase.querySelector(".departTime");

  nameDOM.textContent = name;
  departTime.textContent = time;

  function calculateTimeDepart(ecartTime, date) {
    ecartTime = ecartTime.split(":");

    let ecartTimeHour = ecartTime[0];
    let ecartTimeMin = ecartTime[1];

    function subtractHours(numOfHours, date = new Date()) {
      date.setHours(date.getHours() - numOfHours);

      return date;
    }
    function subtractMinutes(numOfMinutes, date = new Date()) {
      date.setMinutes(date.getMinutes() - numOfMinutes);

      return date;
    }

    if (ecartTimeHour === "00") {
      subtractMinutes(ecartTimeMin, date);
    } else {
      subtractHours(ecartTimeHour, date);
      subtractMinutes(ecartTimeMin, date);
    }

    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const date = new Date(`2022-04-27T${arrivalTime.textContent}`);
  departTime.textContent = calculateTimeDepart(departTime.textContent, date);
}
