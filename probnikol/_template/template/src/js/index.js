import $ from "jquery";
// $.get vraća jqXHR objekt (thenable), pa se na njega može lančati .done() ili await-ati
export function get_todos() {
  return $.get("/api/todos");
}
// Testni poziv da provjeriš radi li dohvat u konzoli
/*
get_todos()
  .done(todos => {
    console.log("Uspješno dohvaćeni todosi:", todos);
  })
  .fail(error => {
    console.error("Greška pri dohvatu:", error);
  });
*/
$(() => {
    $.get("/api/hello", (res) => {
        console.log(res);
    });
});