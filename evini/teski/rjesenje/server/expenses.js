// =====================================================================
// Zadatak 1: vanjski modul s podacima
// U predlošku je ovo polje bilo bez id-ja i bez "export". Trebalo je:
//   1) uvesti crypto i svakom zapisu dodati id: crypto.randomUUID()
//   2) na kraju dodati "export default expenses" da ga index.js može uvesti
// =====================================================================

// crypto je ugrađeni Node modul - ne treba ga instalirati preko npm-a.
import crypto from "crypto";

// crypto.randomUUID() vraća nasumični jedinstveni string, npr.
// "b7c1e8a2-4f3d-4b6a-9e2f-1a2b3c4d5e6f". Generira se pri SVAKOM pokretanju
// poslužitelja, pa se id-jevi mijenjaju nakon restarta - zato ih klijent
// nikad ne "pamti" trajno, nego ih uvijek dobije s poslužitelja.
//
// date je string oblika "YYYY-MM-DD" - to je isti oblik koji koristi
// <input type="date">, pa ga na klijentu možemo direktno upisati u formu.
const expenses = [
  { id: crypto.randomUUID(), title: "Groceries at Konzum",   amount: 42.35, category: "food",      date: "2026-11-02" },
  { id: crypto.randomUUID(), title: "Monthly tram pass",     amount: 15.00, category: "transport", date: "2026-11-01" },
  { id: crypto.randomUUID(), title: "Electricity bill",      amount: 61.20, category: "bills",     date: "2026-11-05" },
  { id: crypto.randomUUID(), title: "Cinema tickets",        amount: 14.00, category: "fun",       date: "2026-11-07" },
  { id: crypto.randomUUID(), title: "Pizza with friends",    amount: 23.50, category: "food",      date: "2026-11-08" },
  { id: crypto.randomUUID(), title: "Internet subscription", amount: 29.99, category: "bills",     date: "2026-11-10" },
  { id: crypto.randomUUID(), title: "Taxi to the airport",   amount: 32.00, category: "transport", date: "2026-11-12" },
  { id: crypto.randomUUID(), title: "Concert ticket",        amount: 45.00, category: "fun",       date: "2026-11-14" },
  { id: crypto.randomUUID(), title: "Coffee and croissant",  amount: 4.80,  category: "food",      date: "2026-11-15" }
];

// "export default" znači da se pri uvozu može dati bilo koje ime:
//   import expenses from "./expenses.js";
// Polje je isti objekt u memoriji u oba modula - kad index.js napravi push
// ili splice, mijenja upravo ovo polje (podaci postoje dok server radi).
export default expenses;
