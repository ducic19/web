// =====================================================================
// POSLUŽITELJ (Express.js)
// Pokretanje: u mapi server -> "node index.js" ili "npm run nodemon"
// Poslužitelj NE poslužuje HTML stranicu - to radi Vite na portu 8080.
// Ovdje su samo API rute (/api/...) koje vraćaju i primaju JSON podatke.
// Vite (vite.config.js -> server.proxy) sve zahtjeve na /api prosljeđuje
// na http://localhost:3000, zato klijent piše samo "/api/expenses".
// =====================================================================

// "import" radi jer u server/package.json piše "type": "module" (ES moduli).
import express from "express";
// crypto je ugrađeni Node modul (ne treba ga instalirati) - koristimo ga za
// crypto.randomUUID() kod dodavanja novog troška (POST ruta).
import crypto from "crypto";
// Zadatak 1: uvoz polja troškova iz vanjskog modula.
// Radi samo zato što expenses.js ima "export default expenses".
// Putanja mora počinjati s "./" i imati nastavak ".js".
import expenses from "./expenses.js";

// app je naša aplikacija - na nju "kačimo" middleware-e i rute.
const app = express();

// ---------------------------------------------------------------------
// Zadatak 1: middleware-i
// Middleware je funkcija koja se izvrši za SVAKI zahtjev prije rute.
// express.json() čita tijelo zahtjeva s Content-Type: application/json
// i sprema ga kao JS objekt u req.body. Bez toga bi req.body u POST i PUT
// rutama bio undefined.
// express.urlencoded() radi isto za podatke poslane klasičnom HTML formom
// (Content-Type: application/x-www-form-urlencoded).
// ---------------------------------------------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Popis dopuštenih kategorija - koristi se u validaciji ispod.
const CATEGORIES = ["food", "transport", "bills", "fun"];

// ---------------------------------------------------------------------
// Pomoćna funkcija za validaciju (Zadatak 4) - koriste je i POST i PUT,
// pa je izdvojena kako se isti kod ne bi pisao dvaput.
// Parametar je odmah "raspakiran" (destrukturiranje): umjesto body.title
// pišemo samo title.
// Na poslužitelju se UVIJEK provjeravaju podaci, čak i ako ih klijent već
// provjerava - zahtjev se može poslati i mimo naše forme (npr. curl, Postman).
// ---------------------------------------------------------------------
const isValid = ({ title, amount, category, date }) =>
    typeof title === "string" && title.trim() !== "" &&   // naslov postoji i nije samo razmaci
    Number(amount) > 0 &&                                  // Number("abc") je NaN, a NaN > 0 je false
    CATEGORIES.includes(category) &&                       // samo jedna od 4 dopuštene kategorije
    typeof date === "string" && date !== "";               // datum je zadan

// ---------------------------------------------------------------------
// Zadatak 1: GET /api/expenses
//   ?category=food        -> samo troškovi te kategorije
//   ?sort=amount          -> od najvećeg prema najmanjem iznosu
//   bez sort ili bilo što drugo -> po datumu, najnoviji prvi
// Parametri se mogu kombinirati: /api/expenses?category=food&sort=amount
// ---------------------------------------------------------------------
app.get("/api/expenses", (req, res) => {
    // req.query je objekt sa svim parametrima iz URL-a iza znaka "?".
    // Za /api/expenses?category=food&sort=amount -> { category: "food", sort: "amount" }
    // Parametar koji nije poslan je undefined. Sve vrijednosti su STRINGOVI.
    const { category, sort } = req.query;

    // VAŽNO: Array.sort() mijenja polje NAD KOJIM je pozvan. Kad bismo sortirali
    // direktno "expenses", trajno bismo promijenili redoslijed podataka na poslužitelju.
    // Zato radimo kopiju:
    //  - filter() uvijek vraća NOVO polje,
    //  - [...expenses] (spread) pravi plitku kopiju kad ne filtriramo.
    // Ako category nije zadan (undefined ili ""), uvjet je false i uzimamo sve.
    let result = category ? expenses.filter(e => e.category === category) : [...expenses];

    if (sort === "amount") {
        // Funkcija usporedbe vraća broj:
        //   < 0 -> a ide prije b,  > 0 -> b ide prije a,  0 -> isti poredak.
        // b.amount - a.amount daje SILAZNI poredak (najveći prvi).
        // (a.amount - b.amount bi dao uzlazni.)
        result.sort((a, b) => b.amount - a.amount);
    } else {
        // Datumi su stringovi "YYYY-MM-DD". Kod takvog oblika abecedni poredak
        // je isti kao kronološki ("2026-11-15" > "2026-11-02"), pa ih ne moramo
        // pretvarati u Date. localeCompare vraća -1/0/1, a b/a poredak daje
        // najnoviji datum prvi.
        result.sort((a, b) => b.date.localeCompare(a.date));
    }

    // res.send s objektom/poljem automatski šalje JSON i postavlja Content-Type.
    res.send(result);
});

// ---------------------------------------------------------------------
// Zadatak 1: GET /api/summary -> { total, count, top }
//   total - zbroj svih iznosa (zaokružen na 2 decimale)
//   count - broj zapisa
//   top   - kategorija s najvećim ukupnim iznosom ili null ako nema zapisa
// Statistika se računa na poslužitelju iz SVIH zapisa, neovisno o tome
// koji je filter odabran na klijentu.
// ---------------------------------------------------------------------
app.get("/api/summary", (req, res) => {
    // 1) Zbrojimo iznose po kategoriji u objekt, npr. { food: 70.65, bills: 91.19, ... }
    const byCategory = {};
    expenses.forEach(e => {
        // Prvi put kad naiđemo na kategoriju, byCategory[e.category] je undefined,
        // pa "|| 0" daje početnu vrijednost 0.
        byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
    });

    // 2) Pronađemo ključ s najvećom vrijednošću.
    // for...in prolazi kroz KLJUČEVE objekta ("food", "bills", ...).
    // Ako je polje prazno, petlja se ne izvrši i top ostaje null.
    let top = null;
    for (const cat in byCategory) {
        if (top === null || byCategory[cat] > byCategory[top]) top = cat;
    }

    res.send({
        // reduce "sažme" polje u jednu vrijednost: kreće od 0 i svakom
        // elementu dodaje iznos. Zbrajanje decimalnih brojeva u računalu nije
        // potpuno precizno (npr. 0.1 + 0.2 = 0.30000000000000004), pa rezultat
        // zaokružimo na 2 decimale: *100 -> zaokruži na cijeli broj -> /100.
        total: Math.round(expenses.reduce((sum, e) => sum + e.amount, 0) * 100) / 100,
        count: expenses.length,
        top
    });
});

// ---------------------------------------------------------------------
// Zadatak 4: POST /api/expenses -> dodaje novi trošak
// POST se koristi za STVARANJE novog resursa. Klijent šalje podatke bez id-ja,
// a id i konačni oblik zapisa određuje poslužitelj.
// ---------------------------------------------------------------------
app.post("/api/expenses", (req, res) => {
    // req.body postoji samo zahvaljujući express.json() iznad.
    if (!isValid(req.body)) {
        // 400 Bad Request = klijent je poslao neispravne podatke.
        // "return" je bitan: bez njega bi se nastavio izvršavati kod ispod
        // i pokušali bismo poslati drugi odgovor (greška "headers already sent").
        res.status(400).send({ error: "Invalid data" });
        return;
    }

    const { title, amount, category, date } = req.body;

    // Novi objekt slažemo ručno, polje po polje, umjesto da spremimo cijeli req.body.
    // Tako u bazu (polje) ne može ući ništa osim ovih 5 svojstava, a vrijednosti
    // su "očišćene": naslov bez razmaka na rubovima, iznos sigurno broj.
    const expense = {
        id: crypto.randomUUID(),   // jedinstveni identifikator, npr. "3f2b...-...."
        title: title.trim(),
        amount: Number(amount),
        category,
        date
    };
    expenses.push(expense);

    // 201 Created = uspješno stvoren novi resurs. Vraćamo ga klijentu
    // kako bi znao koji je id dobio.
    res.status(201).send(expense);
});

// ---------------------------------------------------------------------
// Zadatak 4: PUT /api/expenses/:id -> zamjenjuje postojeći trošak
// PUT se koristi za ZAMJENU cijelog postojećeg resursa (za razliku od PATCH-a
// koji mijenja samo dio). ":id" je parametar putanje - Express ga sprema u
// req.params.id. Za /api/expenses/abc-123 -> req.params.id === "abc-123".
// ---------------------------------------------------------------------
app.put("/api/expenses/:id", (req, res) => {
    // findIndex vraća poziciju prvog elementa za koji je uvjet true, ili -1.
    // Treba nam INDEKS (a ne sam objekt) jer na tu poziciju upisujemo novi objekt.
    const index = expenses.findIndex(e => e.id === req.params.id);

    // Redoslijed provjera: prvo postoji li zapis (404 Not Found), pa tek onda
    // jesu li podaci ispravni (400).
    if (index === -1) {
        res.status(404).send({ error: "Not found" });
        return;
    }
    if (!isValid(req.body)) {
        res.status(400).send({ error: "Invalid data" });
        return;
    }

    const { title, amount, category, date } = req.body;
    // id se uzima iz URL-a (req.params.id), a NE iz tijela zahtjeva.
    // Da uzimamo id iz req.body, klijent bi mogao poslati drugi id i tako
    // "pregaziti" ili duplicirati identifikator.
    expenses[index] = { id: req.params.id, title: title.trim(), amount: Number(amount), category, date };

    // Status 200 OK je zadani, ne treba ga posebno postavljati.
    res.send(expenses[index]);
});

// ---------------------------------------------------------------------
// Zadatak 3: DELETE /api/expenses/:id -> briše trošak
// ---------------------------------------------------------------------
app.delete("/api/expenses/:id", (req, res) => {
    const index = expenses.findIndex(e => e.id === req.params.id);
    if (index === -1) {
        res.status(404).send({ error: "Not found" });
        return;
    }
    // splice(index, 1) uklanja 1 element na poziciji index i to DIREKTNO iz
    // originalnog polja (za razliku od filter-a koji vraća novo polje).
    // Vraća polje obrisanih elemenata, pa s [deleted] uzimamo prvi (jedini).
    const [deleted] = expenses.splice(index, 1);
    res.send(deleted);
});

// ---------------------------------------------------------------------
// Zadatak 1: poslužitelj sluša na portu 3000.
// Port mora odgovarati onom u vite.config.js (proxy "/api" -> localhost:3000).
// Callback se izvrši jednom, kad se poslužitelj uspješno pokrene.
// ---------------------------------------------------------------------
app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});
