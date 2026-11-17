// ============================================================
//  server/index.js — Express poslužitelj
//  ZADATAK 1: inicijalizacija, port 3000, todos.js, GET ruta
//  ZADATAK 2: middleware za JSON i PUT ruta
// ============================================================
// u package.jsonu dodati poslije test nodemon:nodemon 

// ZADATAK 1 (2 boda) — inicijalizacija Express poslužitelja.
const express = require("express");
const app = express();

// ZADATAK 1 (2 boda) — vanjski modul todos.js s poljem TODO zapisa.
let todos = require("./todos");

// NAPOMENA — JEDINI NEDOSTATAK U RJEŠENJU (1 bod).
// Zadatak traži i da statična mapa poslužitelja bude mapa klijenta.
// Ta linija ovdje nedostaje. Ispravno bi izgledalo ovako:
//
//     const path = require("path");
//     app.use(express.static(path.join(__dirname, "../client")));
//
// ili jednostavnije, relativno na mapu iz koje se pokreće poslužitelj:
//
//     app.use(express.static("../client"));
//
// Bez toga se klijent i dalje ispravno poslužuje preko Vitea na portu
// 8080, pa se nedostatak ne vidi u radu — samo u bodovanju.

// ZADATAK 1 (2 boda) — GET ruta šalje klijentu SVE TODO zapise.
app.get("/api/todos", (req, res) => {
    res.send(todos);
});

// ZADATAK 2 — middleware za parsiranje podataka poslanih s klijenta.
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ZADATAK 2 (3 boda) — PUT ruta za nadogradnju zapisa.
// Prima cijeli TODO zapis u tijelu zahtjeva i pronalazi ga po id-u.
app.put("/api/todos", (req, res) => {
    const todo = req.body;
    console.log(todo);
    for (let i in todos)
        if (todos[i].id === todo.id)
            todos[i] = todo;   // zapis se zamjenjuje nadograđenim

    res.send({ message: "Modified" });
});

// NAPOMENA (ne mijenja se): petlja se ne prekida nakon pronalaska zapisa,
// a ako zapis s tim id-em ne postoji, ruta svejedno vraća 200.
// Robusnija verzija istog zahtjeva izgledala bi ovako:
//
//     app.put("/api/todos", (req, res) => {
//         const todo = req.body;
//         const index = todos.findIndex((t) => t.id === todo.id);
//         if (index === -1) {
//             return res.status(404).send({ message: "Not found" });
//         }
//         todos[index] = todo;
//         res.send(todos[index]);
//     });
//
// Za bodovanje nije potrebno — traži se samo da ruta prihvati TODO zapis
// i promijeni ga u polju.

// ZADATAK 1 (2 boda) — poslužitelj sluša na portu 3000.
app.listen(3000);
