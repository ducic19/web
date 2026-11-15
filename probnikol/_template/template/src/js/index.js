import $ from "jquery";

//3.zad
// lokalna kopija zapisa na klijentu, nadograđuje se zajedno s poslužiteljem
let todoList = [];

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

//3.zad
// broj milisekundi od Unix epohe -> M/D/YYYY (npr. 12/4/2025)
const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString("en-US");
}

//3.zad
// ikona statusa ovisno o tome je li zapis gotov
const statusIcon = (done) => {
    return done
        ? `<i class="bi bi-check-circle-fill text-success"></i>`
        : `<i class="bi bi-x-circle-fill text-danger"></i>`;
}

//3.zad
// jedna kartica prema zakomentiranom prototipu iz index.html (kao createMovieLi na vježbama 3)
const createTodoCard = (todo) => {
    const card = $(`
        <div class="col">
            <div class="card shadow-sm rounded-4 h-100">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title mb-2">${todo.title}</h5>
                    <p class="card-text mb-2">
                        <strong>When:</strong> ${formatDate(todo.timestamp)}
                    </p>
                    <p class="card-text mb-3">
                        <strong>Status:</strong> <span class="status">${statusIcon(todo.done)}</span>
                    </p>
                    <div class="d-flex flex-column flex-md-row gap-2 gap-md-4 mt-auto">
                        <button class="btn btn-light border flex-grow-1 rounded-pill btn-toggle">Toggle</button>
                        <button class="btn btn-light border flex-grow-1 rounded-pill btn-remove">Remove</button>
                    </div>
                </div>
            </div>
        </div>
    `);

    // gumbe vežemo ovdje, dok još znamo todo.id
    card.find(".btn-toggle").on("click", () => {
        toggle(todo.id, card);
    });

    card.find(".btn-remove").on("click", () => {
        remove(todo.id, card);
    });

    return card;
}

//3.zad
// iscrtava sve zapise dohvaćene preko get_todos (kao renderMovies na vježbama 3)
export const render_todos = (todos) => {
    todoList = todos;

    const todosContainer = $("#todos-container");
    todosContainer.empty();

    todos.forEach(todo => {
        const card = createTodoCard(todo);
        // fade-in: kartica se sakrije, doda u kontejner i postupno pojavi
        card.hide();
        todosContainer.append(card);
        card.fadeIn(800);
    });
}

//3.zad
// mijenja status na poslužitelju (PUT), zatim na klijentu i ikonu u prikazu
export const toggle = (id, card) => {
    const todo = todoList.find(t => t.id === id);

    $.ajax({
        method: "PUT",
        url: `/api/todos/${id}`,
        contentType: "application/json",
        // PUT na poslužitelju očekuje cijeli objekt, mijenjamo samo done
        data: JSON.stringify({ ...todo, done: !todo.done }),
        success: (res) => {
            todo.done = res.done;
            card.find(".status").html(statusIcon(res.done));
        }
    });
}

//3.zad
// briše zapis na poslužitelju (DELETE), zatim na klijentu i iz prikaza
export const remove = (id, card) => {
    $.ajax({
        method: "DELETE",
        url: `/api/todos/${id}`,
        success: () => {
            todoList = todoList.filter(t => t.id !== id);
            card.remove();
        }
    });
}

$(() => {
    $.get("/api/hello", (res) => {
        console.log(res);
    });

    //3.zad
    // pri učitavanju stranice dohvati zapise i predaj ih render_todos
    get_todos().done(render_todos);
});
