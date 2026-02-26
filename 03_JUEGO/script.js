const Tamaño = 8;
const tableroJugador = document.getElementById('jugador');
const tableroBot = document.getElementById('bot');
const mensajeJuego = document.getElementById('mensaje');
const botonRotar = document.getElementById('botonRotar');
const seleccionarBarco = document.getElementById('seleccionarBarco');

let orientation = 'H';
let inicioJuego = false;

const distribucionBarcos = {4:1,3:2,2:3,1:4};
let barcosResatntes = {...distribucionBarcos};

const jugador = crearEstado();
const bot = crearEstado();

function crearEstado(){
  return {
    Cuadricula: Array.from({length:Tamaño},()=>Array(Tamaño).fill(0)), // 0 vacio, 1 barco, 2 fallo, 3 tocado
    Barcos: [], // {Casillas:[[r,c]], impactos:Set}
    Disparos: new Set()
  };
}

function construirTablero(){
  tableroJugador.innerHTML='';
  tableroBot.innerHTML='';
  for(let r=0;r<Tamaño;r++){
    for(let c=0;c<Tamaño;c++){
      const celdaJugador = document.createElement('div');
      celdaJugador.className='celda jugador';
      celdaJugador.dataset.r=r; celdaJugador.dataset.c=c;
      celdaJugador.onclick=()=>colocarBarco(r,c);
      tableroJugador.appendChild(celdaJugador);

      const celdaBot = document.createElement('div');
      celdaBot.className='celda';
      celdaBot.dataset.r=r; celdaBot.dataset.c=c;
      celdaBot.onclick=()=>diparoBot(r,c);
      tableroBot.appendChild(celdaBot);
    }
  }
}

function colocarBarco(r,c){
  if(inicioJuego) return;
  const Tamaño = +seleccionarBarco.value;

  if(!barcosResatntes[Tamaño])
    { 
    mensajeJuego('No quedan barcos de ese tamaño');
    return;
    }
  const Casillas=[];

  for
  (let i=0;i<Tamaño;i++)
  {
    const nuevaFila = r + (orientation==='V'? i:0);
    const nuevaColumna = c + (orientation==='H'? i:0);
    if(
        nuevaFila>=Tamaño||
        nuevaColumna>=Tamaño||
        jugador.Cuadricula[nuevaFila][nuevaColumna]!==0)

        { 
            mensajeJuego('No cabe aquí'); return; 
        }
    Casillas.push([nuevaFila,nuevaColumna]);
  }
  Casillas.forEach(([nuevaFila,nuevaColumna])=>{
    jugador.Cuadricula[nuevaFila][nuevaColumna]=1;
    obtenerCelda(tableroJugador,nuevaFila,nuevaColumna).classList.add('barco');
  });
  jugador.Barcos.push({Casillas, impactos:new Set()});
  barcosResatntes[Tamaño]--;
  mensajeJuego('Barco colocado');
}

function colocarAleatorio(Estado){
  const plan = [4,3,3,2,2,2,1,1,1,1];
  for(const Tamaño of plan){
    let colocado=false;
    while(!colocado){
      const ori = Math.random()<.5?'H':'V';
      const r = rand(0,Tamaño-1);
      const c = rand(0,Tamaño-1);
      const Casillas=[];
      for(let i=0;i<Tamaño;i++){
        const nuevaFila=r+(ori==='V'?i:0);
        const nuevaColumna=c+(ori==='H'?i:0);
        if
        (
            nuevaFila>=Tamaño||
            nuevaColumna>=Tamaño||
            Estado.Cuadricula[nuevaFila][nuevaColumna]!==0
        )
            { Casillas.length=0; break; }
        Casillas.push([nuevaFila,nuevaColumna]);
      }
      if(Casillas.length){
        Casillas.forEach(([nuevaFila,nuevaColumna])=>Estado.Cuadricula[nuevaFila][nuevaColumna]=1);
        Estado.Barcos.push({Casillas, impactos:new Set()});
        colocado=true;
      }
    }
  }
}

function diparoBot(r,c){
  if(!inicioJuego) return;
  const clave=r+','+c;
  if(jugador.Disparos.has(clave)) return;
  jugador.Disparos.add(clave);
  verDisparo(bot, tableroBot, r, c, false);
  if(!checkWin(bot)) setTimeout(botTurn, 500);
}

function botTurn(){
  let r,c,clave;
  do
    { 
    r=rand(0,Tamaño-1); 
    c=rand(0,Tamaño-1); 
    clave=r+','+c; 
    }
while(bot.Disparos.has(clave));
  bot.Disparos.add(clave);
  verDisparo(jugador, tableroJugador, r, c, true);
}

function verDisparo(Estado, tableroJugador, r, c, mostrarBarcos)
{
  const celda = obtenerCelda(tableroJugador,r,c);
  if(Estado.Cuadricula[r][c]===1)
    {
        Estado.Cuadricula[r][c]=3;
        celda.classList.add('impacto');
        const barco = Estado.Barcos.find(b=>b.Casillas.some(([nuevaFila,nuevaColumna])=>nuevaFila===r&&nuevaColumna===c));
        barco.impactos.add(r+','+c);
        if(barco.impactos.Tamaño===barco.Casillas.length)
        {
            barco.Casillas.forEach(([nuevaFila,nuevaColumna])=>obtenerCelda(tableroJugador,nuevaFila,nuevaColumna).classList.add('sunk'));
            mensajeJuego('Hundido');
        }
        else mensajeJuego('Tocado');
    }
    else
       {
        if(Estado.Cuadricula[r][c]===0){ Estado.Cuadricula[r][c]=2; celda.classList.add('miss'); mensajeJuego('Agua'); }
        }
}

function checkWin(Estado){
  const alive = Estado.Barcos.some(b=>b.impactos.Tamaño < b.Casillas.length);
  if(!alive)
    { 
        mensajeJuego('¡Fin del juego!');
        inicioJuego=false; return true;
    }
  return false;
}

function obtenerCelda(board,r,c){
    return board.children[r*Tamaño+c]; 
}

function rand(a,b){
    return Math.floor(Math.random()*(b-a+1))+a; 
}
function mensajeJuego(t){ 
    mensajeJuego.textContent=t; 
}

botonRotar.onclick=()=>{
  orientation = orientation==='H'?'V':'H';
  botonRotar.textContent = 
  'Rotar barco ('+(orientation==='H'?'Horizontal':'Vertical')+')';
};

document.getElementById('startBtn').onclick=()=>{
  colocarAleatorio(bot);
  inicioJuego=true;
  mensajeJuego('Juego iniciado: dispara al tablero enemigo');
};

document.getElementById('resetBtn').onclick=()=>location.reload();

construirTablero();
