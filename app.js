class Ticket {
    constructor(title, desc, priority) {
        this.id = "ZGL-" + Date.now();
        this.title = title;
        this.desc = desc;
        this.priority = priority;
        this.status = "nowe";
        this.date = new Date().toLocaleString("pl-PL");
    }
}

var currentFilter = "wszystkie";

function getTickets() {
    var data = sessionStorage.getItem("tickets");
    if (data) {
        return JSON.parse(data);
    }
    return [];
}

function saveTickets(tickets) {
    sessionStorage.setItem("tickets", JSON.stringify(tickets));
}

function addTicket(title, desc, priority) {
    var tickets = getTickets();
    var ticket = new Ticket(title, desc, priority);
    tickets.unshift(ticket);
    saveTickets(tickets);
}

function deleteTicket(id) {
    var tickets = getTickets();
    var nowe = [];
    for (var i = 0; i < tickets.length; i++) {
        if (tickets[i].id !== id) {
            nowe.push(tickets[i]);
        }
    }
    saveTickets(nowe);
    render();
}

function changeStatus(id, status) {
    var tickets = getTickets();
    for (var i = 0; i < tickets.length; i++) {
        if (tickets[i].id === id) {
            tickets[i].status = status;
        }
    }
    saveTickets(tickets);
    render();
}

function setFilter(filter) {
    currentFilter = filter;
    render();
}

function render() {
    var tickets = getTickets();

    var nowe = 0;
    var wtrakcie = 0;
    var zamkniete = 0;

    for (var i = 0; i < tickets.length; i++) {
        if (tickets[i].status === "nowe") nowe++;
        if (tickets[i].status === "w trakcie") wtrakcie++;
        if (tickets[i].status === "zamknięte") zamkniete++;
    }

    document.getElementById("statNowe").textContent = nowe;
    document.getElementById("statWtrakcie").textContent = wtrakcie;
    document.getElementById("statZamkniete").textContent = zamkniete;

    var filtered = [];
    for (var i = 0; i < tickets.length; i++) {
        if (currentFilter === "wszystkie" || tickets[i].status === currentFilter) {
            filtered.push(tickets[i]);
        }
    }

    var list = document.getElementById("ticketList");
    list.innerHTML = "";

    if (filtered.length === 0) {
        var empty = document.createElement("div");
        empty.className = "empty-state";
        empty.textContent = "Brak zgłoszeń";
        list.appendChild(empty);
        return;
    }

    for (var i = 0; i < filtered.length; i++) {
        var t = filtered[i];

        var card = document.createElement("div");
        card.className = "ticket";

        var badgeClass = "badge-nowe";
        if (t.status === "w trakcie") badgeClass = "badge-wtrakcie";
        if (t.status === "zamknięte") badgeClass = "badge-zamkniete";

        var prioHtml = "";
        if (t.priority === "wysoki") {
            prioHtml = '<span class="badge badge-wysoki">wysoki</span>';
        }
        if (t.priority === "krytyczny") {
            prioHtml = '<span class="badge badge-krytyczny">krytyczny</span>';
        }

        var descHtml = "";
        if (t.desc) {
            descHtml = '<div class="ticket-desc">' + t.desc + '</div>';
        }

        card.innerHTML =
            '<div class="ticket-header">' +
                '<div><span class="ticket-title">' + t.title + '</span> <span class="ticket-id">' + t.id + '</span></div>' +
                '<div class="ticket-badges"><span class="badge ' + badgeClass + '">' + t.status + '</span>' + prioHtml + '</div>' +
            '</div>' +
            descHtml +
            '<div class="ticket-footer">' +
                '<span class="ticket-date">' + t.date + '</span>' +
                '<div class="ticket-actions" id="actions-' + t.id + '"></div>' +
            '</div>';

        list.appendChild(card);

        var actions = document.getElementById("actions-" + t.id);

        if (t.status !== "nowe") {
            var b1 = document.createElement("button");
            b1.className = "btn-sm";
            b1.textContent = "Nowe";
            b1.setAttribute("data-id", t.id);
            b1.addEventListener("click", function() {
                changeStatus(this.getAttribute("data-id"), "nowe");
            });
            actions.appendChild(b1);
        }

        if (t.status !== "w trakcie") {
            var b2 = document.createElement("button");
            b2.className = "btn-sm";
            b2.textContent = "W trakcie";
            b2.setAttribute("data-id", t.id);
            b2.addEventListener("click", function() {
                changeStatus(this.getAttribute("data-id"), "w trakcie");
            });
            actions.appendChild(b2);
        }

        if (t.status !== "zamknięte") {
            var b3 = document.createElement("button");
            b3.className = "btn-sm";
            b3.textContent = "Zamknij";
            b3.setAttribute("data-id", t.id);
            b3.addEventListener("click", function() {
                changeStatus(this.getAttribute("data-id"), "zamknięte");
            });
            actions.appendChild(b3);
        }

        var del = document.createElement("button");
        del.className = "btn-sm btn-delete";
        del.textContent = "Usuń";
        del.setAttribute("data-id", t.id);
        del.addEventListener("click", function() {
            deleteTicket(this.getAttribute("data-id"));
        });
        actions.appendChild(del);
    }
}

document.querySelectorAll(".nav-link").forEach(function(link) {
    link.addEventListener("click", function(e) {
        e.preventDefault();
        var target = this.getAttribute("href");
        document.querySelector(target).scrollIntoView({ behavior: "smooth" });
    });
});

document.querySelector(".arrow-down").addEventListener("click", function(e) {
    e.preventDefault();
    document.querySelector("#tickets").scrollIntoView({ behavior: "smooth" });
});

document.querySelectorAll(".filter-btn").forEach(function(btn) {
    btn.addEventListener("click", function() {
        var btns = document.getElementsByClassName("filter-btn");
        for (var i = 0; i < btns.length; i++) {
            btns[i].classList.remove("active");
        }
        this.classList.add("active");
        setFilter(this.getAttribute("data-filter"));
    });
});

document.querySelector("#ticketForm").addEventListener("submit", function(e) {
    e.preventDefault();

    var title = document.getElementById("inputTitle").value.trim();
    var desc = document.getElementById("inputDesc").value.trim();
    var priority = document.getElementById("inputPriority").value;

    if (title.length === 0) {
        document.getElementById("inputTitle").focus();
        return;
    }

    addTicket(title, desc, priority);

    document.getElementById("inputTitle").value = "";
    document.getElementById("inputDesc").value = "";
    document.getElementById("inputPriority").value = "normalny";

    render();
});

render();
