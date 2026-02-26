let TAM = 8;

const tableroJugador = document.getElementById("tableroJugador");
const tableroBot = document.getElementById("tableroBot");
const tableroAtaques = document.getElementById("tableroAtaques");
const mensaje = document.getElementById("mensaje");

const botonRotar = document.getElementById("botonRotar");
const botonIniciar = document.getElementById("botonIniciar");
const botonReiniciar = document.getElementById("botonReiniciar");
const selectorBarco = document.getElementById("selectorBarco");

const selectorTam = document.getElementById("selectorTam");

selectorTam.onchange = () => {
    
    TAM = +selectorTam.value;

    // Reiniciar jugador
    jugador.cuadricula = Array.from({length:TAM},()=>Array(TAM).fill(0));
    jugador.barcos = [];
    jugador.disparos.clear();

    // Reiniciar bot
    bot.cuadricula = Array.from({length:TAM},()=>Array(TAM).fill(0));
    bot.barcos = [];
    bot.disparos.clear();

    // Reiniciar barcos disponibles
    restantes = {...planBarcos};

    juegoIniciado = false;

    construir();

    msg("Coloca tus barcos");
};

let orientacion = "H";
let juegoIniciado = false;

const planBarcos = {4:1,3:2,2:3,1:4};
let restantes = {...planBarcos};

const jugador = crearEstado();
const bot = crearEstado();

function crearEstado(){
    return{
    cuadricula:Array.from({length:TAM},()=>Array(TAM).fill(0)),
    barcos:[],
    disparos:new Set()
    };
}

function construir(){
    [tableroJugador,tableroBot,tableroAtaques].forEach(t=>t.innerHTML="");
    tableroJugador.style.gridTemplateColumns = `repeat(${TAM}, 36px)`;
    tableroBot.style.gridTemplateColumns = `repeat(${TAM}, 36px)`;
    tableroAtaques.style.gridTemplateColumns = `repeat(${TAM}, 36px)`;
    for(let f=0;f<TAM;f++){
    for(let c=0;c<TAM;c++){

        const cj=document.createElement("div");
        cj.className="celda";
        cj.onclick=()=>colocarBarco(f,c);
        tableroJugador.appendChild(cj);

        const cb=document.createElement("div");
        cb.className="celda";
        cb.onclick=()=>disparar(f,c);
        tableroBot.appendChild(cb);

        const ca=document.createElement("div");
        ca.className="celda";
        tableroAtaques.appendChild(ca);
    }
  }
}

function colocarBarco(f,c){
    if(juegoIniciado) return;

    const t = +selectorBarco.value;
    if(!restantes[t]) return msg("No quedan barcos");

    const pos=[];

    for(let i=0;i<t;i++){
        const nf=f+(orientacion==="V"?i:0);
        const nc=c+(orientacion==="H"?i:0);

        if(
        nf>=TAM || nc>=TAM ||
        jugador.cuadricula[nf][nc]!==0 ||
        !zonaLibre(jugador,nf,nc)
        ){
        return msg("No cabe aquí");
        }

        pos.push([nf,nc]);
    }

    pos.forEach(([x,y])=>{
        jugador.cuadricula[x][y]=1;
        celda(tableroJugador,x,y).classList.add("barco");
    });

    jugador.barcos.push({pos, hits:new Set()});
    restantes[t]--;
    msg("Barco colocado");
}

function colocarAleatorio(estado)
{
    const lista=[4,3,3,2,2,2,1,1,1,1];

    for(const t of lista)
    {
        let ok=false;

        while(!ok)
        {
            const f=Math.floor(Math.random()*TAM);
            const c=Math.floor(Math.random()*TAM);
            const o=Math.random()<0.5?"H":"V";

            const pos=[];

            for(let i=0;i<t;i++)
            {
                const nf=f+(o==="V"?i:0);
                const nc=c+(o==="H"?i:0);

                if(nf>=TAM||nc>=TAM||estado.cuadricula[nf][nc]!==0 ||
                !zonaLibre(estado,nf,nc)){
                pos.length=0;
                break;
                }
                pos.push([nf,nc]);
            }

            if(pos.length)
            {
                pos.forEach(([f,c])=>estado.cuadricula[f][c]=1);
                estado.barcos.push({pos, hits:new Set()});
                ok=true;
            }
        }
    }
}

function disparar(f,c)
{
    if(!juegoIniciado) return;

    const k=f+","+c;
    if(jugador.disparos.has(k)) return;

    jugador.disparos.add(k);
    resolver(bot,tableroBot,f,c);

    if(!victoria(bot)) setTimeout(turnoBot,600);
}

let objetivosBot = [];

function turnoBot(){
  let fila, col;

  // Si tiene objetivos pendientes (porque tocó antes)
  if(objetivosBot.length > 0)
    {
        const objetivo = objetivosBot.pop();
        fila = objetivo[0];
        col = objetivo[1];

        if(bot.disparos.has(fila+","+col))
        {
        return turnoBot();
        }
    } 
  else 
    {
        do
        {
            fila = Math.floor(Math.random()*TAM);
            col = Math.floor(Math.random()*TAM);
        }
        while(bot.disparos.has(fila+","+col));
    }

  bot.disparos.add(fila+","+col);

  const resultado = resolver(jugador, tableroAtaques, fila, col);

  // Si fue impacto → añadir alrededor como objetivos
  if(resultado === "impacto")
    {
    agregarObjetivosAlrededor(fila,col);
    }
}

function resolver(estado,tablero,f,c)
{
  const cel = celda(tablero,f,c);

  if(estado.cuadricula[f][c]===1)
    {
        estado.cuadricula[f][c]=3;
        cel.classList.add("impacto");

        const barco=estado.barcos.find(b=>b.pos.some(([x,y])=>x===f&&y===c));
        barco.hits.add(f+","+c);

        if(barco.hits.size===barco.pos.length)
            {
            barco.pos.forEach(([x,y])=>celda(tablero,x,y).classList.add("hundido"));
            msg("Hundido");
            return "hundido";
            }
            else
            {
            msg("Tocado");
            return "impacto";
            }

    }
  else if(estado.cuadricula[f][c]===0)
    {
        estado.cuadricula[f][c]=2;
        cel.classList.add("agua");
        msg("Agua");
        return "agua";
    }
}

function agregarObjetivosAlrededor(f,c){
  const posibles = [
    [f+1,c],
    [f-1,c],
    [f,c+1],
    [f,c-1]
  ];

  posibles.forEach(([nf,nc])=>
    {
        if(nf>=0 && nf<TAM && nc>=0 && nc<TAM)
        {
            objetivosBot.push([nf,nc]);
        }
    });
}

function zonaLibre(estado, fila, col)
{
  for(let f=fila-1; f<=fila+1; f++)
    {
        for(let c=col-1; c<=col+1; c++)
        {
            if(
                f>=0 && f<TAM &&
                c>=0 && c<TAM &&
                estado.cuadricula[f][c] === 1
            )
            {
                return false; // Hay barco cerca
            }
        }
    }
  return true;
}

function victoria(estado)
{
  const vivos=estado.barcos.some(b=>b.hits.size<b.pos.length);
  if(!vivos){msg("¡Fin del juego!");juegoIniciado=false;return true;}
  return false;
}



function celda(tab,f,c)
{
  return tab.children[f*TAM+c];
}

function msg(t){mensaje.textContent=t;}

botonRotar.onclick=()=>
{
  orientacion=orientacion==="H"?"V":"H";
  botonRotar.textContent="Rotar ("+(orientacion==="H"?"Horizontal":"Vertical")+")";
};

botonIniciar.onclick = () => {

  TAM = +selectorTam.value;

  restantes = {...planBarcos};   // 👈 AQUÍ

  jugador.cuadricula = Array.from({length:TAM},()=>Array(TAM).fill(0));
  jugador.barcos = [];
  jugador.disparos.clear();

  bot.cuadricula = Array.from({length:TAM},()=>Array(TAM).fill(0));
  bot.barcos = [];
  bot.disparos.clear();

  construir();
  colocarAleatorio(bot);

  juegoIniciado = true;

  msg("¡Juego iniciado!");
};
botonReiniciar.onclick=()=>location.reload();

