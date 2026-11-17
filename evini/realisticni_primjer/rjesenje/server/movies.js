// =====================================================================
// Zadatak 1: vanjski modul s podacima
// U predlošku je polje bilo bez id-ja i bez "export". Trebalo je:
//   1) uvesti crypto i svakom zapisu dodati id: crypto.randomUUID()
//   2) na kraju dodati "export default movies" da ga index.js može uvesti
// =====================================================================

// crypto je ugrađeni Node modul - ne instalira se preko npm-a.
import crypto from "crypto";

// crypto.randomUUID() vraća nasumični jedinstveni string, npr.
// "b7c1e8a2-4f3d-4b6a-9e2f-1a2b3c4d5e6f". Generira se pri SVAKOM pokretanju
// poslužitelja, pa se id-jevi mijenjaju nakon restarta - klijent ih uvijek
// dobije s poslužitelja i nikad ih ne "izmišlja" sam.
//
// rating je cijeli broj od 1 do 5 (broj zvjezdica), watched je true/false.
const movies = [
  { id: crypto.randomUUID(), title: "Interstellar",          year: 2014, genre: "Sci-Fi",    rating: 5, watched: true  },
  { id: crypto.randomUUID(), title: "The Grand Budapest Hotel", year: 2014, genre: "Comedy", rating: 4, watched: false },
  { id: crypto.randomUUID(), title: "Parasite",              year: 2019, genre: "Thriller",  rating: 5, watched: true  },
  { id: crypto.randomUUID(), title: "Spirited Away",         year: 2001, genre: "Animation", rating: 5, watched: false },
  { id: crypto.randomUUID(), title: "Mad Max: Fury Road",    year: 2015, genre: "Action",    rating: 4, watched: false },
  { id: crypto.randomUUID(), title: "La La Land",            year: 2016, genre: "Musical",   rating: 3, watched: true  },
  { id: crypto.randomUUID(), title: "Arrival",               year: 2016, genre: "Sci-Fi",    rating: 4, watched: false },
  { id: crypto.randomUUID(), title: "Knives Out",            year: 2019, genre: "Mystery",   rating: 3, watched: false },
  { id: crypto.randomUUID(), title: "Dune: Part Two",        year: 2024, genre: "Sci-Fi",    rating: 4, watched: true  }
];

// "export default" -> u index.js se uvozi s:  import movies from "./movies.js";
// Oba modula dijele ISTO polje u memoriji: kad index.js promijeni neki film
// ili ga obriše (splice), mijenja upravo ovo polje.
export default movies;
