// =====================================================================
// Zadatak 1: vanjski modul s podacima
// U predlošku je polje bilo bez id-ja i bez "export". Trebalo je:
//   1) uvesti crypto i svakom zapisu dodati id: crypto.randomUUID()
//   2) na kraju dodati "export default exams" da ga index.js može uvesti
// =====================================================================

// crypto je ugrađeni Node modul - ne instalira se preko npm-a.
import crypto from "crypto";

// crypto.randomUUID() vraća nasumični jedinstveni string, npr.
// "b7c1e8a2-4f3d-4b6a-9e2f-1a2b3c4d5e6f". Na klijentu taj id koristimo i za
// jedinstveni id elementa accordiona (collapse-<id>), pa je jedinstvenost bitna.
//
// date je string "YYYY-MM-DD", ects je broj bodova, passed je true/false.
const exams = [
  { id: crypto.randomUUID(), subject: "Web Programming",   professor: "Dr. Ana Horvat",   date: "2026-11-20", ects: 6, passed: false },
  { id: crypto.randomUUID(), subject: "Databases",         professor: "Dr. Marko Babić",  date: "2026-11-10", ects: 6, passed: true  },
  { id: crypto.randomUUID(), subject: "Mathematics 2",     professor: "Dr. Ivana Kovač",  date: "2026-12-04", ects: 7, passed: false },
  { id: crypto.randomUUID(), subject: "Operating Systems", professor: "Dr. Luka Novak",   date: "2026-11-06", ects: 5, passed: true  },
  { id: crypto.randomUUID(), subject: "Computer Networks", professor: "Dr. Petra Jurić",  date: "2026-12-15", ects: 5, passed: false },
  { id: crypto.randomUUID(), subject: "English for IT",    professor: "Mia Knežević, MA", date: "2027-01-22", ects: 3, passed: false }
];

// "export default" -> u index.js se uvozi s:  import exams from "./exams.js";
// Oba modula dijele ISTO polje u memoriji.
export default exams;
