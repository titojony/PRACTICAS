//----
const techno = [
    "techno_imagenes/T01.jpg",
    "techno_imagenes/T02.jpg",
    "techno_imagenes/T03.jpg",
    "techno_imagenes/T04.jpg"
];

function tecno_music() {
    const index = Math.floor(Math.random() * techno.length);
    return techno[index];
}
//----
const latin = [
    "latin_imagenes/L01.jpg",
    "latin_imagenes/L02.jpg",
    "latin_imagenes/L03.jpg",
    "latin_imagenes/L04.jpg"
];

function latin_music() {
    const index = Math.floor(Math.random() * latin.length); 
    return latin[index];
}
//----
const chill = [
    "chill_imagenes/C01.jpg",
    "chill_imagenes/C02.jpg",
    "chill_imagenes/C03.jpg",
    "chill_imagenes/C04.jpg"
];

function chill_music() {
    const index = Math.floor(Math.random() * chill.length);
    return chill[index];
}
//----
const playlists = [
  {
    title: "Techno",
    description: "Ritmos electrónicos potentes",
    image: tecno_music()
  },
  {
    title: "Latineo",
    description: "Para romper la pista",
    image: latin_music()
  },
  {
    title: "Relax & Chill",
    description: "Stay off",
    image: chill_music()
  }
];

const container = document.getElementById("playlistContainer");

playlists.forEach(p => {
    const card = document.createElement("div");
    card.className = "card";

  card.innerHTML = `
  <div class="card-img">
    <img src="${p.image}">
    <button class="play-card">▶</button>
  </div>
  <h3>${p.title}</h3>`
  ;

  card.onclick = () => selectPlaylist(p.title);

  container.appendChild(card);
});

const canciones = [
  "Techno — Dark Pulse",
  "Latin — Fuego",
  "Chill — Relax Waves",
];

let indice = 0;

const texto = document.getElementById("nowPlaying");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const playBtn = document.getElementById("playBtn");

let reproduciendo = false;

function selectPlaylist(name) {
    document.getElementById("nowPlaying").textContent = "Seleccionado: " + name;
}


const boton = document.getElementById("playBtn");

boton.addEventListener("click", () => {

  if (boton.textContent === "▶") {
    boton.textContent = "⏸";
  } else {
    boton.textContent = "▶";
  }

    reproduciendo = !reproduciendo;

});

nextBtn.addEventListener("click", () => {

  indice++;

  if (indice >= canciones.length) {
    indice = 0; // vuelve al principio
  }

  texto.textContent = canciones[indice];
});

prevBtn.addEventListener("click", () => {

  indice--;

  if (indice < 0) {
    indice = canciones.length - 1; // última canción
  }

  texto.textContent = canciones[indice];
});
