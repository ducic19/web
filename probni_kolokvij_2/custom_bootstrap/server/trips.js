const crypto = require("crypto");
const trips = [
    { destination: "Pariz", date: "2024-12-02T09:00", visited: true,id:crypto.randomUUID() },
    { destination: "Rim", date: "2024-12-05T07:30", visited: false,id:crypto.randomUUID() },
    { destination: "Lisabon", date: "2024-12-08T11:15", visited: false,id:crypto.randomUUID() },
    { destination: "Beč", date: "2024-12-01T15:00", visited: true,id:crypto.randomUUID() },
    { destination: "Prag", date: "2024-12-11T08:45", visited: false,id:crypto.randomUUID() },
    { destination: "Amsterdam", date: "2024-12-14T10:30", visited: false,id:crypto.randomUUID() },
    { destination: "Barcelona", date: "2024-12-17T12:00", visited: false,id:crypto.randomUUID() },
    { destination: "Budimpešta", date: "2024-12-19T16:20", visited: false,id:crypto.randomUUID() },
    { destination: "Zagreb", date: "2024-12-21T18:00", visited: true,id:crypto.randomUUID() }
];
module.exports = trips; 