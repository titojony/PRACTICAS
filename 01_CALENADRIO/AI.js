document.addEventListener("DOMContentLoaded", iniciarApp);


//  FUNCIÓN PRINCIPAL


function iniciarApp() {
    cargarCalendario();
    configurarFormulario();
}


//  VARIABLES GLOBALES


let fechaSeleccionada = null;
let eventos = JSON.parse(localStorage.getItem("eventos")) || [];

const calendario = document.getElementById("calendario");


//  DATOS DEL CALENDARIO


const DIAS_SEMANA = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];

const MESES = [
    { nombre: "Enero", dias: 31 },
    { nombre: "Febrero", dias: 28 },
    { nombre: "Marzo", dias: 31 },
    { nombre: "Abril", dias: 30 },
    { nombre: "Mayo", dias: 31 },
    { nombre: "Junio", dias: 30 },
    { nombre: "Julio", dias: 31 },
    { nombre: "Agosto", dias: 31 },
    { nombre: "Septiembre", dias: 30 },
    { nombre: "Octubre", dias: 31 },
    { nombre: "Noviembre", dias: 30 },
    { nombre: "Diciembre", dias: 31 }
];

// CAMBIAR YEAR

let yearActual = 2026;

function cambiarYear(delta) {
    yearActual += delta;
    generarCalendario(yearActual);
}


// CREAR CALENDARIO

function cargarCalendario() {
    generarCalendario(yearActual);
    
    
}


function generarCalendario(year) {

    // ⭐ ACTUALIZAR EL SPAN
    document.getElementById("YearTexto").textContent = year;

    const hoy = new Date();
    const diaHoy = hoy.getDate();
    const mesHoy = hoy.getMonth();
    const yearHoy = hoy.getFullYear();    

    calendario.innerHTML = "";

    MESES.forEach((mes, index) => {

        const divMes = document.createElement("div");
        divMes.classList.add("month");

        // Título
        const titulo = document.createElement("div");
        titulo.classList.add("mes");
        titulo.textContent = mes.nombre + " " + year;
        divMes.appendChild(titulo);

        // Días semana

        const filaDias = document.createElement("div");
        filaDias.classList.add("days");
        filaDias.textContent = DIAS_SEMANA.join(" ");
        divMes.appendChild(filaDias);

        // Primer día del mes
        const primerDia = new Date(year, index, 1).getDay();
        const offset = primerDia === 0 ? 6 : primerDia - 1;

        // Huecos iniciales
        for (let i = 0; i < offset; i++) {
            const celdaVacia = document.createElement("div");
            celdaVacia.classList.add("cell", "empty");
            divMes.appendChild(celdaVacia);
        }

        // 🔥 DÍAS DEL MES (automático — bisiestos incluidos)
        const diasMes = new Date(year, index + 1, 0).getDate();

        for (let dia = 1; dia <= diasMes; dia++) {

            const celda = document.createElement("div");
            celda.classList.add("cell");
            celda.textContent = dia;

            // ⭐ Resaltar día actual
            if (dia === diaHoy && index === mesHoy && year === yearHoy) {
                celda.style.backgroundColor = "#FFD700";
                celda.style.color = "#000";
                celda.style.fontWeight = "bold";
}

            celda.addEventListener("click", () => {
                const d = dia.toString().padStart(2, "0");
                const m = (index + 1).toString().padStart(2, "0");

                fechaSeleccionada = `${year}-${m}-${d}`;

                document.getElementById("modalAgenda").style.display = "flex";
                mostrarEventosDelDia(fechaSeleccionada);
            });

            divMes.appendChild(celda);
        }

        calendario.appendChild(divMes);
    });
}


//  SELECCIONAR DÍA


function seleccionarDia(dia, mesIndex) {

    const diaStr = dia.toString().padStart(2, "0");
    const mesStr = (mesIndex + 1).toString().padStart(2, "0");

    fechaSeleccionada = `2026-${mesStr}-${diaStr}`;

    document.getElementById("modalAgenda").style.display = "flex";

    mostrarEventosDelDia(fechaSeleccionada);
}


//  MOSTRAR EVENTOS


function mostrarEventosDelDia(fecha) {

    const lista = document.getElementById("listaEventos");
    lista.innerHTML = "";

    const eventosFiltrados = eventos
        .filter(ev => ev.fecha === fecha)
        .sort((a, b) => new Date(a.fecha + " " + a.hora) - new Date(b.fecha + " " + b.hora));

    eventosFiltrados.forEach(evento => {

        const li = document.createElement("li");
        li.textContent = `${evento.hora} - ${evento.titulo} (${evento.etiqueta})`;

        lista.appendChild(li);
    });
}


//  FORMULARIO


function configurarFormulario() {

    const form = document.getElementById("formEvento");

    form.addEventListener("submit", function(e) {

        e.preventDefault();

        if (!fechaSeleccionada) {
            alert("Selecciona un día primero");
            return;
        }

        const hora = document.getElementById("hora").value;
        const titulo = document.getElementById("titulo").value;
        const etiqueta = document.getElementById("etiqueta").value;

        const nuevoEvento = {
            id: Date.now(),
            fecha: fechaSeleccionada,
            hora,
            titulo,
            etiqueta
        };

        eventos.push(nuevoEvento);

        localStorage.setItem("eventos", JSON.stringify(eventos));

        mostrarEventosDelDia(fechaSeleccionada);

        form.reset();
    });
}