import $ from "jquery";
import { Modal } from "bootstrap";


let filter="all";
const getBooks = (callb) => {
    const filt= filter==="all" ? "/api/books" : `/api/books?read=${filter}`;//ako je filter=all uzmi /api/books inace filtrirane
    $.get(filt, (res) => {
        callb(res);
    });
};


const formatDate = (ms) => new Date(ms).toLocaleDateString("hr-HR");

const createCard = (book) => {
    const badge = book.read
        ? `<span class="badge rounded-pill text-bg-success"><i class="bi bi-bookmark-check-fill"></i> Read</span>`
        : `<span class="badge rounded-pill text-bg-secondary"><i class="bi bi-bookmark"></i> To read</span>`;

    const toggleBtn = book.read
        ? `<button class="btn btn-sm btn-outline-secondary flex-fill js-toggle">Mark as unread</button>`
        : `<button class="btn btn-sm btn-outline-success flex-fill js-toggle">Mark as read</button>`;

    const col = $(`
        <div class="col-12 col-sm-6 col-lg-4 col-xxl-3">
                <div class="card h-100 shadow-sm border-0 rounded-4">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start gap-2">
                            <div>
                                <h5 class="card-title">
                                    ${book.title}     
                                </h5>
                                <p class="fst-italic text-secondary">${book.author}</p>
                            </div>
                            ${badge}
                        </div>
                        <div>
                            <ul class="list-unstyled small mb-0">
                                <li><i class="bi bi-file-earmark-text me-1"></i>${book.pages} pages</li>
                                <li><i class="bi bi-calendar-event me-1"></i>Added: ${formatDate(book.addedAt)}</li>
                            </ul>
                        </div>
                    </div>
                    <div class="d-flex card-footer bg-transparent border-0 pb-3 gap-2">
                        ${toggleBtn}
                        <button class="btn btn-sm btn-outline-danger js-remove">
                            <i class="bi bi-trash3"></i>
                        </button>
                    </div>   
                </div>
        </div>
    `);


    col.find(".js-toggle").on("click", () => toggleRead(book.id));
    col.find(".js-remove").on("click", () => removeBook(book.id, col));
    return col;
};


let firstLoad = true;

const renderBooks = (books) => {
    const container = $("#books");
    container.empty();

    books.forEach((book, i) => {
        const card = createCard(book);
        container.append(card);
        if (firstLoad) {
            // kartice se pojavljuju jedna za drugom
            card.hide().delay(i * 150).fadeIn(500);
        }
    });
    firstLoad = false;
};

const updateStats = () => {
    $.get("/api/stats", ({ total, read }) => {
        $("#count").text(`${total} books`);
        $("#progress-text").text(`${read} / ${total}`);
        const percent = total === 0 ? 0 : Math.round(read / total * 100);
        $("#progress-bar").css("width", `${percent}%`);
    });
};
const refresh = () => {
    getBooks(renderBooks);
    updateStats();
};


const toggleRead = (id) => {
    $.ajax({
        method: "PATCH",
        url: `/api/books/${id}`,
        success: refresh
    });
};

const removeBook = (id, col) => {
    $.ajax({
        method: "DELETE",
        url: `/api/books/${id}`,
        success: () => {
            col.fadeOut(400, () => {
                col.remove();
                updateStats();
            });
        }
    });
};

$(".js-filter").on("click", function () {
    $(".js-filter").removeClass("active");
    $(this).addClass("active");
    filter = $(this).data("filter").toString();
    getBooks(renderBooks);
});



// ---------- Zadatak 4 ----------
const addModal = new Modal(document.getElementById("addModal"));

const validate = () => {
    let valid = true;
    const fields = [
        ["#title", $("#title").val().trim() !== ""],
        ["#author", $("#author").val().trim() !== ""],
        ["#pages", Number($("#pages").val()) > 0]
    ];
    fields.forEach(([selector, ok]) => {
        $(selector).toggleClass("is-invalid", !ok);
        if (!ok) valid = false;
    });
    return valid;
};

const addBook = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const book = {
        title: $("#title").val().trim(),
        author: $("#author").val().trim(),
        pages: Number($("#pages").val()),
        read: $("#read").prop("checked")
    };

    $.ajax({
        method: "POST",
        url: "/api/books",
        contentType: "application/json",
        data: JSON.stringify(book),
        success: () => {
            $("#add-form")[0].reset();
            $("#add-form .is-invalid").removeClass("is-invalid");
            addModal.hide();
            refresh();
        }
    });
};

$("#add-form").on("submit", addBook);

// čim korisnik počne ispravljati polje, makni oznaku greške
$("#add-form input").on("input", function () {
    $(this).removeClass("is-invalid");
});



$(() => {
    refresh();
});