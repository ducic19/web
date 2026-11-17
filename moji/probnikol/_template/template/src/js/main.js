import "../scss/style.scss"
import * as bootstrap from "bootstrap"
/* 1.zad zadnje al na cudniji nacin
// definiramo konstantnu varijablu s URL-om našeg Express poslužitelja i rute za todo zapise
const API_URL = "http://localhost:3000/api/todos"; 

//dohvaćanje asinkrone funkcije get_todos za get svih zapisa s poslužitelja
export async function get_todos() {
  try {
    // slanje HTTP GET zahtjeva na poslužitelja pomoću fetch API-ja i čekanje odgovora (await)
    const response = await fetch(API_URL);

    //je li HTTP odgovor uspješan
    if (!response.ok) {
      //ručno bacamo (throw) grešku s kodom statusa
      throw new Error(`Greška pri dohvaćanju: ${response.status}`);
    }
    
    // pretvaramo dobiveni odgovor iz JSON formata u običan JavaScript objekt/polje i čekamo rezultat
    const data = await response.json();
    
    // vraćamo dohvaćene podatke tamo gdje je funkcija pozvana
    return data;
  } catch (error) {
    // ako dođe do greške u try bloku (npr. server je ugašen), hvatamo je ovdje i ispisujemo u konzolu
    console.error("Neuspješno dohvaćanje todos zapisa:", error);
    
    // vraćamo prazno polje kako aplikacija ne bi pukla (undefined) u nastavku koda
    return [];
  }
}

// Pozivamo funkciju odmah kako ne bi ostala neiskorištena (zadovoljavamo pravilo da se kod mora izvršavati)
// .then() hvata vraćene podatke (todos) i ispisuje ih u konzolu preglednika kao provjeru
get_todos().then(todos => console.log("Dohvaćeni todosi:", todos));
*/