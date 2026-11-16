// U script.js napišite i upotrijebite funkcije getTrips (3 boda) i renderTripCards (5 bodova):
import $ from "jquery";

const prettyDate = (dateStr) => {
    const formatter = new Intl.DateTimeFormat("en-US",{
        dateStyle: "short",
        timeStyle: "short"
    });
return formatter.format(new Date(dateStr));
}

const getTrips = (callb) => {
    $.get("/api/trips", (res) => {
        callb(res);
    });
} 

function statusIcon(done) {
  return done
    ? '<i class="bi bi-check-circle-fill text-success"></i>'
    : '<i class="bi bi-x-circle-fill text-primary"></i>';
}

const renderTripCards = (trips) => {
    const container = $("#trips");
    container.empty();
    for (const trip of trips) {
        const status = trip.visited
            ? '<i class="bi bi-check-circle-fill text-success fs-5"></i>'
            : '<i class="bi bi-x-circle-fill text-danger fs-5"></i>';
        const card = $(`
        <div class="col">
            <div class="card h-100 shadow-sm">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start">
                        <h5 class="card-title mb-1">${trip.destination}</h5>
                        ${status}
                    </div>
                    <p class="card-text text-muted small mb-0">${prettyDate(trip.date)}</p>
                </div>
                <div class="card-footer bg-white border-0 text-end">
                    <button type="button" class="btn btn-sm btn-outline-primary">
                        <i class="bi bi-pencil"></i>
                    </button>
                </div>
            </div>
        </div>
        `);
            card.find("button").on("click", () => { openEditModal(trip) });
            container.append(card);
        }
    }
$(() => {
    getTrips((trips) => {
        renderTripCards(trips);
    });
});