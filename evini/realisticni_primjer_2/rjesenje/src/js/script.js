// =====================================================================
// KLIJENT - sva logika stranice
// Datoteka je uključena kao <script type="module">, pa se izvršava tek kad
// je HTML učitan. Varijable iz modula nisu globalne, zato gumbe povezujemo
// s .on(...) ovdje, a ne s onclick="..." u HTML-u.
//
// Otvaranje/zatvaranje stavki accordiona NE pišemo sami: to radi Bootstrap
// JS (uvezen u main.js) preko atributa data-bs-toggle="collapse". Bootstrap
// "sluša" klikove na cijelom dokumentu, pa radi i za stavke koje dodamo
// naknadno iz JS-a.
// =====================================================================

import $ from "jquery";

// =====================================================================
// Zadatak 1: dohvaćanje podataka
// =====================================================================

// getExams prima CALLBACK - funkciju koja se pozove kad podaci stignu.
// $.get je ASINKRON: JS ne čeka odgovor, nego nastavlja dalje. Podaci
// postoje tek unutar funkcije koju jQuery pozove kad odgovor stigne.
// Test: getExams(console.log) ispiše polje u konzolu (F12).
const getExams = (callback) => {
    $.get("/api/exams", (exams) => {
        callback(exams);
    });
};

// =====================================================================
// Zadatak 3: prikaz, ECTS, promjena statusa, brisanje
// =====================================================================

// Datum "2026-11-20" -> "petak, 20. studenoga 2026."
// toLocaleDateString prima i OBJEKT OPCIJA koji kaže koje dijelove datuma
// prikazati i kako: weekday "long" = puni naziv dana, month "long" = puni
// naziv mjeseca, day/year "numeric" = brojem.
const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString("hr-HR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
});

// Koliko je dana do ispita, kao tekst: "in 4 days", "today" ili "finished".
const daysUntil = (dateStr) => {
    // Današnji datum u ponoć, kako sat ne bi utjecao na računicu
    // (setHours(0,0,0,0) postavlja sate, minute, sekunde i ms na 0).
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // new Date("2026-11-20T00:00") -> ponoć tog dana po LOKALNOM vremenu.
    // (Bez "T00:00" string bi se tumačio kao UTC i mogao bi se pomaknuti za sat.)
    const examDay = new Date(dateStr + "T00:00");

    // Oduzimanjem dva Date objekta dobivamo razliku u MILISEKUNDAMA.
    // Jedan dan = 1000 ms * 60 s * 60 min * 24 h = 86 400 000 ms.
    // Math.round zaokruži (npr. zbog prelaska na zimsko vrijeme dan ima 25 h).
    const days = Math.round((examDay - today) / (1000 * 60 * 60 * 24));

    if (days > 1) return `in ${days} days`;
    if (days === 1) return "tomorrow";
    if (days === 0) return "today";
    return "finished";
};

// Stvara jednu stavku accordiona za jedan ispit.
// Vraća jQuery objekt kako bismo na gumbe mogli zakačiti event handlere.
const createItem = (exam) => {
    // Sve što ovisi o statusu izračunamo unaprijed (ternarni operator).
    const badge = exam.passed
        ? `<span class="badge rounded-pill text-bg-success me-2"><i class="bi bi-check-circle-fill me-1"></i>Passed</span>`
        : `<span class="badge rounded-pill text-bg-warning me-2"><i class="bi bi-hourglass-split me-1"></i>Pending</span>`;
    const button = exam.passed
        ? `<button type="button" class="btn btn-sm btn-outline-secondary js-toggle">Mark as pending</button>`
        : `<button type="button" class="btn btn-sm btn-outline-success js-toggle">Mark as passed</button>`;

    // id elementa koji se otvara MORA biti jedinstven za svaku stavku -
    // inače bi klik na bilo koje zaglavlje otvarao uvijek prvu stavku.
    // Zato ga slažemo iz id-ja ispita. (HTML id ne smije počinjati brojem,
    // a UUID može - prefiks "collapse-" rješava i to.)
    const collapseId = `collapse-${exam.id}`;

    // HTML je kopiran iz zakomentiranog prototipa u index.html, a fiksne
    // vrijednosti zamijenjene su s ${...}.
    // flex-grow-1 na naslovu: naslov zauzme sav slobodan prostor u gumbu
    // zaglavlja, pa je značka uvijek desno, odmah do strelice.
    const item = $(`
        <div class="accordion-item">
            <h2 class="accordion-header">
                <button class="accordion-button collapsed gap-2" type="button"
                        data-bs-toggle="collapse" data-bs-target="#${collapseId}">
                    <span class="fw-semibold flex-grow-1">${exam.subject}</span>
                    ${badge}
                </button>
            </h2>
            <div id="${collapseId}" class="accordion-collapse collapse">
                <div class="accordion-body">
                    <div class="row g-2 small mb-3">
                        <div class="col-12 col-md-4"><i class="bi bi-calendar-event text-primary me-1"></i>${formatDate(exam.date)}</div>
                        <div class="col-12 col-md-4"><i class="bi bi-person text-primary me-1"></i>${exam.professor}</div>
                        <div class="col-12 col-md-4"><i class="bi bi-award text-primary me-1"></i>${exam.ects} ECTS</div>
                    </div>
                    <div class="d-flex align-items-center gap-2">
                        ${button}
                        <button type="button" class="btn btn-sm btn-outline-danger js-remove"><i class="bi bi-trash3"></i></button>
                        <span class="small text-primary ms-auto">${daysUntil(exam.date)}</span>
                    </div>
                </div>
            </div>
        </div>
    `);

    // item.find(...) traži SAMO unutar ove stavke; arrow funkcija "pamti"
    // (closure) baš ovaj exam i ovaj item.
    item.find(".js-toggle").on("click", () => toggleExam(exam.id));
    item.find(".js-remove").on("click", () => removeExam(exam.id, item));
    return item;
};

// Prikazuje sve ispite, broj ispita i ECTS brojač.
// Callback za getExams.
const renderExams = (exams) => {
    // Broj ispita (s ispravnim jednina/množina oblikom).
    $("#count").text(`${exams.length} ${exams.length === 1 ? "exam" : "exams"}`);

    // ECTS: zbroj bodova POLOŽENIH ispita / zbroj bodova SVIH ispita.
    // reduce "sažme" polje u jednu vrijednost: kreće od 0 i svakom
    // elementu dodaje njegove bodove.
    const total = exams.reduce((sum, e) => sum + e.ects, 0);
    const earned = exams
        .filter(e => e.passed)               // samo položeni
        .reduce((sum, e) => sum + e.ects, 0);
    $("#ects").text(`ECTS ${earned} / ${total}`);

    const container = $("#exams");
    // empty() obriše stare stavke - bez toga bi se svaki render DODAO
    // ispod prethodnog i stavke bi se duplicirale.
    container.empty();
    exams.forEach(exam => container.append(createItem(exam)));
};

// Mijenja status položen / na čekanju.
// Za PATCH i DELETE koristi se $.ajax s opcijom method ($.get je samo za GET).
const toggleExam = (id) => {
    $.ajax({
        method: "PATCH",
        url: `/api/exams/${id}`,   // id ide u putanju -> req.params.id na poslužitelju
        success: () => {
            // Nakon promjene na poslužitelju dohvatimo svježe podatke.
            // (Napomena: ponovni render zatvori otvorenu stavku jer se sve
            // stavke iznova grade sa "collapsed" - to je očekivano ponašanje.)
            getExams(renderExams);
        }
    });
};

// Briše ispit. item je jQuery objekt stavke - prosljeđuje ga createItem
// kako bismo baš tu stavku mogli animirati.
const removeExam = (id, item) => {
    $.ajax({
        method: "DELETE",
        url: `/api/exams/${id}`,
        success: () => {
            // Animacija tek NAKON uspješnog odgovora.
            // slideUp(300, callback): stavka se 300 ms "zatvara" prema gore,
            // a callback se izvrši kad animacija završi. Novi dohvat je u
            // callbacku jer bi empty() u renderu odmah prekinuo animaciju.
            item.slideUp(300, () => {
                getExams(renderExams);
            });
        }
    });
};

// $(() => {...}) = $(document).ready: kad je DOM spreman, prvi put
// dohvatimo i prikažemo ispite.
$(() => {
    getExams(renderExams);
});
