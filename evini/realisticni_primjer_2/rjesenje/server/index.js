// =====================================================================
// POSLUŽITELJ (Express.js)
// Pokretanje: u mapi server -> "npm run nodemon" (ili "node index.js")
// Ovaj poslužitelj NE poslužuje HTML stranicu - to radi Vite na portu 8080.
// Ovdje su samo API rute (/api/...) koje vraćaju JSON podatke.
// =====================================================================

// "import" radi jer u server/package.json piše "type": "module".
import express from "express";
// Zadatak 1: uvoz polja ispita iz vanjskog modula.
// Radi samo zato što exams.js ima "export default exams".
import exams from "./exams.js";

const app = express();

// (dano u predlošku) middleware-i za čitanje tijela zahtjeva u req.body
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ---------------------------------------------------------------------
// Zadatak 1: GET /api/exams -> svi ispiti, sortirani po datumu (najraniji prvi)
// ---------------------------------------------------------------------
app.get("/api/exams", (req, res) => {
    // VAŽNO: sort() mijenja polje nad kojim je pozvan. Kad bismo sortirali
    // direktno "exams", trajno bismo promijenili redoslijed na poslužitelju.
    // Zato prvo napravimo kopiju s [...exams] (spread operator).
    //
    // Datumi su stringovi "YYYY-MM-DD" - u tom obliku abecedni poredak je
    // isti kao kronološki ("2026-11-06" < "2026-11-20"). localeCompare vraća
    // negativan broj ako a ide prije b, pa a.localeCompare(b) daje UZLAZNI
    // poredak (najraniji ispit prvi).
    const sorted = [...exams].sort((a, b) => a.date.localeCompare(b.date));

    // res.send s poljem automatski šalje JSON.
    res.send(sorted);
});

// ---------------------------------------------------------------------
// Zadatak 1: PATCH /api/exams/:id -> mijenja passed u suprotnu vrijednost
// PATCH = mijenjamo samo DIO zapisa (jedno svojstvo). Klijent ne šalje
// tijelo zahtjeva - poslužitelj sam okreće vrijednost.
// ":id" je parametar putanje: za /api/exams/abc -> req.params.id === "abc"
// ---------------------------------------------------------------------
app.patch("/api/exams/:id", (req, res) => {
    // find vraća SAM OBJEKT iz polja (referencu), pa promjena exam.passed
    // mijenja i ispit u polju exams.
    const exam = exams.find(e => e.id === req.params.id);

    if (!exam) {
        // 404 = ne postoji. "return" je obavezan, inače bi se kod nastavio
        // i Express bi pokušao poslati drugi odgovor ("headers already sent").
        res.status(404).send({ error: "Not found" });
        return;
    }

    exam.passed = !exam.passed;   // true -> false, false -> true
    res.send(exam);
});

// ---------------------------------------------------------------------
// Zadatak 1: DELETE /api/exams/:id -> briše ispit
// ---------------------------------------------------------------------
app.delete("/api/exams/:id", (req, res) => {
    // Za brisanje treba POZICIJA u polju (splice briše po indeksu).
    // findIndex vraća -1 ako ništa ne nađe.
    const index = exams.findIndex(e => e.id === req.params.id);

    if (index === -1) {
        res.status(404).send({ error: "Not found" });
        return;
    }

    // splice(index, 1) uklanja 1 element DIREKTNO iz originalnog polja i
    // vraća polje obrisanih; [deleted] uzima prvi (jedini).
    const [deleted] = exams.splice(index, 1);
    res.send(deleted);
});

// (dano u predlošku) port 3000 - isti kao u proxy postavci u vite.config.js
app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});
