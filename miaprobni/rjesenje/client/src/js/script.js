// ============================================================
//  script.js — sva klijentska logika
//  Zadatak 1: getTodos, renderTableRows, prettyDate
//  Zadatak 2: modal, hide, openEditModal, submit
// ============================================================

// ZADATAK 1 (3 boda) — jQuery je dodan preko npm-a i uvozi se ovdje.
// $ je jQuery funkcija koja se koristi kroz cijelu datoteku
// ($.get, $.ajax, $("#...")).    -->> npm install jQuery pa ovo 
import $ from "jquery";
// ZADATAK 2 (1 bod) — točno propisani uvoz klase Modal iz Bootstrapa.
import { Modal } from "bootstrap";

// ZADATAK 1 — formatiranje datuma i vremena.
// Doslovno propisana funkcija iz zadatka:
// ISO string "2024-12-03T09:00:00" -> "12/3/24, 9:00 AM".
const prettyDate = (dateStr) => {
    const formatter = new Intl.DateTimeFormat("en-US", {
        dateStyle: "short",
        timeStyle: "short"
    });
    return formatter.format(new Date(dateStr));
}

// ZADATAK 1 (3 boda) — getTodos.
// Prima callback, dohvaća SVE TODO zapise s poslužitelja (GET /api/todos)
// i predaje ih toj funkciji. Time je ispunjen zahtjev da prva funkcija
// poziva drugu i prosljeđuje joj dohvaćene zapise.
const getTodos = (callb) => {
    $.get("/api/todos", (res) => {
        callb(res);
    });
}

// ZADATAK 1 (5 bodova) — renderTableRows.
// Prima polje TODO zapisa i puni <tbody> tablice #todoTable.
const renderTableRows = (todos) => {
    let tbody = $("#todoTable tbody");
    // briše prethodne retke prije ponovnog crtanja
    // (bitno kod ponovnog učitavanja nakon spremanja)
    tbody.empty();
    for (const todo of todos) {
        // NAPOMENA (ne mijenja se): opis se umeće izravno u HTML preko
        // template stringa. Podaci dolaze s vlastitog poslužitelja pa je
        // rizik mali, ali da opis sadrži "<" interpretirao bi se kao oznaka.
        // Sigurnija verzija istog retka izgledala bi ovako:
        //
        //     let tr = $("<tr>");
        //     tr.append($("<td>").text(todo.description));
        //     tr.append($("<td>").text(prettyDate(todo.date)));
        //     tr.append(
        //         $("<td class='text-center'>").html(
        //             todo.completed
        //                 ? '<i class="bi bi-check-circle-fill text-success"></i>'
        //                 : '<i class="bi bi-x-circle-fill text-danger"></i>'
        //         )
        //     );
        //
        // prva tri stupca: opis, formatirani datum, ikona statusa
        let tr = $(`
            <tr>
                <td>${todo.description}</td>
                <td>${prettyDate(todo.date)}</td>
                <td class='text-center'>${ todo.completed ? '<i class="bi bi-check-circle-fill text-success"></i>' : '<i class="bi bi-x-circle-fill text-danger"></i>' }</td>
            </tr>
        `);

        // ZADATAK 2 (1 bod) — ćelija stupca "Modify":
        // centrirana je i sadrži ikonu pencil-square.
        let td = $(`
            <td class='text-center' style='cursor: pointer'><i class="bi bi-pencil-square text-secondary"></i></td>
        `);
        // ZADATAK 2 (3 boda) — event handler na ćeliji.
        // Klik poziva openEditModal s TOČNO TIM todo zapisom (closure).
        td.on("click", () => { openEditModal(todo) });
        
        tr.append(td);
        tbody.append(tr);
        
    }
}

// ZADATAK 2 (5 bodova) — submit.
// 1) parsira vrijednosti forme
// 2) složi nadograđeni TODO zapis
// 3) pošalje ga PUT rutom kao JSON
// 4) nakon uspjeha ponovno učita sve zapise i zatvori modal
const submit = () => {
    const description = $("#editModal form #description").val();
    // NAPOMENA (ne mijenja se): datetime-local vraća "YYYY-MM-DDTHH:mm",
    // pa se sekunde iz izvornog zapisa mogu izgubiti. Ako ih je potrebno
    // zadržati, dovoljno bi bilo dodati sekunde:
    //
    //     const date = $("#editModal form #date").val() + ":00";
    const date = $("#editModal form #date").val();
    const completed = $("#editModal form #completed").prop("checked");
    const id = $("#editModal form #id").val();
    const todo = { description, date, completed, id };
    $.ajax({
        method: "PUT",
        url: "/api/todos",
        // JSON.stringify + contentType sprječavaju neželjenu pretvorbu
        // Booleovih vrijednosti u stringove (fusnota 5).
        data: JSON.stringify(todo),
        dataType: 'json',
        contentType: 'application/json',
        success: (res) => {
            getTodos(renderTableRows);   // ponovno učitavanje svih zapisa
            myModal.hide();              // zatvaranje modala
        }
        // NAPOMENA (nije traženo zadatkom): nema rukovanja greškom, pa se
        // kod neuspjelog PUT-a ne dogodi ništa vidljivo. Dodatak bi izgledao:
        //
        //     error: (xhr) => {
        //         console.error("Spremanje nije uspjelo:", xhr.status);
        //     }
    })
}

// ZADATAK 2 (1 bod) — submit mora biti globalan jer ga HTML poziva
// s onclick="submit()".
window.submit = submit;

// ZADATAK 2 (1 bod) — instanca klase Modal.
// NAPOMENA: zadatak traži instancu "kao globalnu varijablu"; ovdje je
// const na razini modula, pa joj submit/hide/openEditModal pristupaju
// kroz closure.
// Doslovno prema tekstu zadatka izgledalo bi ovako:
//
//     window.myModal = new Modal(document.getElementById("editModal"));
//
// Tada bi modal bio dostupan i izvan ovog modula (npr. u HTML-u ili
// u konzoli), jednako kao window.submit i window.hide.
const myModal = new Modal(document.getElementById('editModal'));

// ZADATAK 2 (1 bod) — hide zatvara modal.
const hide = () => {
    myModal.hide();
}
// ZADATAK 2 (1 bod) — mora biti globalan jer HTML poziva onclick="hide()".
window.hide = hide;

// ZADATAK 2 (5 bodova) — openEditModal.
// Prima todo, puni kontrole forme i otvara modal.
const openEditModal = (todo) => {
    const { description, date, completed, id } = todo;
    $("#editModal form #description").val(description);         // jQuery val
    // NAPOMENA (ne mijenja se): zapis može imati sekunde, npr.
    // "2024-12-06T23:59:59", a datetime-local ih prema zadanim postavkama
    // ne prikazuje. Sigurnija verzija ovog retka bila bi:
    //
    //     $("#editModal form #date").val(date.slice(0, 16));
    $("#editModal form #date").val(date);                       // jQuery val
    $("#editModal form #completed").prop("checked", completed); // jQuery prop
    $("#editModal form #id").val(id);                           // čuvanje id-ja
    myModal.show();                                             // otvaranje modala

}


// Ulazna točka: kada je DOM spreman, dohvati zapise i proslijedi ih
// renderTableRows kao callback (ZADATAK 1 — traženi obrazac).
$(() => {
    getTodos(renderTableRows);
});
