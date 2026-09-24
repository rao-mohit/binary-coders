const API = "http://127.0.0.1:5000/api";


// =====================================================
// PAGE LOAD
// =====================================================

document.addEventListener("DOMContentLoaded", function () {

    console.log("JavaScript connected successfully!");

    loadStats();
    loadDonations();

});


// =====================================================
// MODAL FUNCTIONS
// =====================================================

function openModal(id) {

    const modal = document.getElementById(id);

    if (modal) {
        modal.classList.add("active");
        modal.style.display = "flex";
    }
}


function closeModal(id) {

    const modal = document.getElementById(id);

    if (modal) {
        modal.classList.remove("active");
        modal.style.display = "none";
    }
}


// Login
function openLogin() {
    openModal("loginModal");
}


// Register
function openRegister() {
    openModal("registerModal");
}


// Donation
function openDonation() {
    openModal("donationModal");
}


// Close functions
function closeLogin() {
    closeModal("loginModal");
}


function closeRegister() {
    closeModal("registerModal");
}


function closeDonation() {
    closeModal("donationModal");
}


// =====================================================
// REGISTER
// =====================================================

const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", async function (e) {

        e.preventDefault();

        const name =
            document.getElementById("registerName").value.trim();

        const email =
            document.getElementById("registerEmail").value.trim();

        const password =
            document.getElementById("registerPassword").value;

        const role =
            document.getElementById("registerRole").value;


        try {

            const response = await fetch(`${API}/register`, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    name: name,
                    email: email,
                    password: password,
                    role: role
                })

            });


            const data = await response.json();

            alert(data.message);


            if (data.success) {

                registerForm.reset();

                closeRegister();

                openLogin();

            }

        }

        catch (error) {

            console.error("Register Error:", error);

            alert("Backend connection failed!");

        }

    });

}


// =====================================================
// LOGIN
// =====================================================

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async function (e) {

        e.preventDefault();


        const email =
            document.getElementById("loginEmail").value.trim();

        const password =
            document.getElementById("loginPassword").value;


        try {

            const response = await fetch(`${API}/login`, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email: email,
                    password: password
                })

            });


            const data = await response.json();

            alert(data.message);


            if (data.success) {

                localStorage.setItem(
                    "user",
                    JSON.stringify(data.user)
                );

                loginForm.reset();

                closeLogin();

                console.log("Logged in:", data.user);

            }

        }

        catch (error) {

            console.error("Login Error:", error);

            alert("Backend connection failed!");

        }

    });

}


// =====================================================
// LOGOUT
// =====================================================

function logout() {

    localStorage.removeItem("user");

    alert("Logged out successfully!");

    location.reload();

}


// =====================================================
// CREATE DONATION
// =====================================================

const donationForm =
    document.getElementById("donationForm");


if (donationForm) {

    donationForm.addEventListener("submit", async function (e) {

        e.preventDefault();


        const user =
            JSON.parse(localStorage.getItem("user"));


        if (!user) {

            alert("Please login first!");

            closeDonation();

            openLogin();

            return;

        }


        const foodName =
            document.getElementById("foodName").value.trim();

        const quantity =
            document.getElementById("foodQuantity").value;

        const location =
            document.getElementById("foodLocation").value.trim();

        const expiryTime =
            document.getElementById("expiryTime").value;


        try {

            const response = await fetch(`${API}/donations`, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    donor_id: user.id,

                    food_name: foodName,

                    quantity: quantity,

                    location: location,

                    expiry_time: expiryTime

                })

            });


            const data = await response.json();

            alert(data.message);


            if (data.success) {

                donationForm.reset();

                closeDonation();

                loadStats();

                loadDonations();

            }

        }

        catch (error) {

            console.error("Donation Error:", error);

            alert("Backend connection failed!");

        }

    });

}


// =====================================================
// LOAD STATS
// =====================================================

async function loadStats() {

    try {

        const response =
            await fetch(`${API}/stats`);

        const data =
            await response.json();


        if (!data.success) return;


        // Hero
        const heroFood =
            document.getElementById("heroFood");

        const heroMeals =
            document.getElementById("heroMeals");

        const heroDeliveries =
            document.getElementById("heroDeliveries");


        if (heroFood)
            heroFood.textContent =
                data.food_rescued + " kg";


        if (heroMeals)
            heroMeals.textContent =
                data.meals_rescued;


        if (heroDeliveries)
            heroDeliveries.textContent =
                data.deliveries;


        // Dashboard
        const foodRescued =
            document.getElementById("foodRescued");

        const mealsRescued =
            document.getElementById("mealsRescued");

        const activeDonations =
            document.getElementById("activeDonations");

        const totalDeliveries =
            document.getElementById("totalDeliveries");


        if (foodRescued)
            foodRescued.textContent =
                data.food_rescued + " kg";


        if (mealsRescued)
            mealsRescued.textContent =
                data.meals_rescued;


        if (activeDonations)
            activeDonations.textContent =
                data.active_donations;


        if (totalDeliveries)
            totalDeliveries.textContent =
                data.deliveries;


        // Impact
        const impactFood =
            document.getElementById("impactFood");

        const impactMeals =
            document.getElementById("impactMeals");

        const impactDeliveries =
            document.getElementById("impactDeliveries");


        if (impactFood)
            impactFood.textContent =
                data.food_rescued + " kg";


        if (impactMeals)
            impactMeals.textContent =
                data.meals_rescued;


        if (impactDeliveries)
            impactDeliveries.textContent =
                data.deliveries;

    }

    catch (error) {

        console.error("Stats Error:", error);

    }

}


// =====================================================
// LOAD DONATIONS
// =====================================================

async function loadDonations() {

    try {

        const response =
            await fetch(`${API}/donations`);

        const data =
            await response.json();


        if (!data.success) return;


        const donationList =
            document.getElementById("donationList");

        const recentDonations =
            document.getElementById("recentDonations");


        if (donationList) {

            donationList.innerHTML = "";


            if (data.donations.length === 0) {

                donationList.innerHTML =
                    "<p>No donations available.</p>";

            }

            else {

                data.donations.forEach(function (donation) {

                    donationList.innerHTML +=
                        createDonationCard(donation);

                });

            }

        }


        if (recentDonations) {

            recentDonations.innerHTML = "";


            if (data.donations.length === 0) {

                recentDonations.innerHTML =
                    "<p>No donations yet.</p>";

            }

            else {

                data.donations
                    .slice(0, 5)
                    .forEach(function (donation) {

                        recentDonations.innerHTML +=
                            createDonationCard(donation);

                    });

            }

        }

    }

    catch (error) {

        console.error("Donation Load Error:", error);

    }

}


// =====================================================
// DONATION CARD
// =====================================================

function createDonationCard(donation) {

    return `

        <div class="donation-card">

            <h3>
                ${escapeHTML(donation.food_name)}
            </h3>

            <p>
                <strong>Quantity:</strong>
                ${donation.quantity} kg
            </p>

            <p>
                <strong>Location:</strong>
                ${escapeHTML(donation.location)}
            </p>

            <p>
                <strong>Donor:</strong>
                ${escapeHTML(donation.donor_name)}
            </p>

            <p>
                <strong>Expiry:</strong>
                ${escapeHTML(donation.expiry_time)}
            </p>

            <p>
                <strong>Status:</strong>
                ${escapeHTML(donation.status)}
            </p>

            <div class="card-buttons">

                <button
                    class="btn-primary"
                    onclick="findMatch(${donation.id})">

                    Find Match

                </button>

                <button
                    class="btn-danger"
                    onclick="deleteDonation(${donation.id})">

                    Delete

                </button>

            </div>

        </div>

    `;

}


// =====================================================
// FIND MATCH
// =====================================================

async function findMatch(id) {

    try {

        const response =
            await fetch(`${API}/matches/${id}`, {

                method: "POST"

            });


        const data =
            await response.json();


        alert(data.message);


        if (data.success) {

            loadDonations();

            loadStats();

        }

    }

    catch (error) {

        console.error("Match Error:", error);

        alert("Matching failed!");

    }

}


// =====================================================
// LOAD MATCHES
// =====================================================

async function loadMatches() {

    try {

        const response =
            await fetch(`${API}/matches`);

        const data =
            await response.json();


        const container =
            document.getElementById("matchesList");


        if (!container) return;


        container.innerHTML = "";


        if (data.matches.length === 0) {

            container.innerHTML =
                "<p>No matches found.</p>";

            return;

        }


        data.matches.forEach(function (match) {

            container.innerHTML += `

                <div class="donation-card">

                    <h3>
                        ${escapeHTML(match.food_name)}
                    </h3>

                    <p>
                        Quantity:
                        ${match.quantity} kg
                    </p>

                    <p>
                        Pickup:
                        ${escapeHTML(match.location)}
                    </p>

                    <p>
                        Recipient:
                        ${escapeHTML(match.recipient_name)}
                    </p>

                    <p>
                        Status:
                        ${escapeHTML(match.status)}
                    </p>

                </div>

            `;

        });

    }

    catch (error) {

        console.error("Matches Error:", error);

    }

}


// =====================================================
// LOAD PICKUPS
// =====================================================

async function loadPickups() {

    try {

        const response =
            await fetch(`${API}/pickups`);

        const data =
            await response.json();


        const container =
            document.getElementById("pickupList");


        if (!container) return;


        container.innerHTML = "";


        if (data.pickups.length === 0) {

            container.innerHTML =
                "<p>No active pickups.</p>";

            return;

        }


        data.pickups.forEach(function (pickup) {

            container.innerHTML += `

                <div class="donation-card">

                    <h3>
                        ${escapeHTML(pickup.food_name)}
                    </h3>

                    <p>
                        Quantity:
                        ${pickup.quantity} kg
                    </p>

                    <p>
                        Location:
                        ${escapeHTML(pickup.location)}
                    </p>

                    <p>
                        Recipient:
                        ${escapeHTML(pickup.recipient_name)}
                    </p>

                    <p>
                        Status:
                        ${escapeHTML(pickup.status)}
                    </p>

                    <button
                        class="btn-primary"
                        onclick="updateStatus(
                            ${pickup.id},
                            'Picked Up'
                        )">

                        Mark Picked Up

                    </button>

                    <button
                        class="btn-primary"
                        onclick="updateStatus(
                            ${pickup.id},
                            'Delivered'
                        )">

                        Mark Delivered

                    </button>

                </div>

            `;

        });

    }

    catch (error) {

        console.error("Pickup Error:", error);

    }

}


// =====================================================
// UPDATE STATUS
// =====================================================

async function updateStatus(id, status) {

    try {

        const response =
            await fetch(
                `${API}/donations/${id}/status`,
                {

                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        status: status
                    })

                }
            );


        const data =
            await response.json();


        alert(data.message);


        if (data.success) {

            loadStats();

            loadDonations();

            loadPickups();

        }

    }

    catch (error) {

        console.error("Status Error:", error);

        alert("Status update failed!");

    }

}


// =====================================================
// DELETE DONATION
// =====================================================

async function deleteDonation(id) {

    if (!confirm("Are you sure you want to delete this donation?")) {
        return;
    }


    try {

        const response =
            await fetch(`${API}/donations/${id}`, {

                method: "DELETE"

            });


        const data =
            await response.json();


        alert(data.message);


        if (data.success) {

            loadDonations();

            loadStats();

        }

    }

    catch (error) {

        console.error("Delete Error:", error);

        alert("Delete failed!");

    }

}


// =====================================================
// DASHBOARD
// =====================================================

function showDashboard(section, button) {

    const content =
        document.getElementById("dashboardContent");


    if (!content) return;


    // Active sidebar button
    document
        .querySelectorAll(".sidebar button")
        .forEach(function (btn) {

            btn.classList.remove("active");

        });


    if (button) {

        button.classList.add("active");

    }


    // ---------------------------------------------
    // OVERVIEW
    // ---------------------------------------------

    if (section === "overview") {

        content.innerHTML = `

            <div class="dashboard-header">

                <h2>Dashboard Overview</h2>

                <p>
                    Monitor your food rescue activities.
                </p>

            </div>


            <div class="stats-grid">

                <div class="stat-card">

                    <h3>Food Rescued</h3>

                    <p id="foodRescued">
                        0 kg
                    </p>

                </div>


                <div class="stat-card">

                    <h3>Meals Rescued</h3>

                    <p id="mealsRescued">
                        0
                    </p>

                </div>


                <div class="stat-card">

                    <h3>Active Donations</h3>

                    <p id="activeDonations">
                        0
                    </p>

                </div>


                <div class="stat-card">

                    <h3>Deliveries</h3>

                    <p id="totalDeliveries">
                        0
                    </p>

                </div>

            </div>


            <div class="dashboard-panel">

                <h3>Recent Donations</h3>

                <div id="recentDonations">
                    Loading...
                </div>

            </div>

        `;


        loadStats();

        loadDonations();

    }


    // ---------------------------------------------
    // DONATIONS
    // ---------------------------------------------

    else if (section === "donations") {

        content.innerHTML = `

            <div class="dashboard-header">

                <h2>Donations</h2>

                <button
                    class="btn-primary"
                    onclick="openDonation()">

                    + Add Donation

                </button>

            </div>


            <div
                id="donationList"
                class="donation-grid">

                Loading donations...

            </div>

        `;


        loadDonations();

    }


    // ---------------------------------------------
    // MATCHES
    // ---------------------------------------------

    else if (section === "matches") {

        content.innerHTML = `

            <div class="dashboard-header">

                <h2>Smart Matches</h2>

                <p>
                    Matched donations and recipients.
                </p>

            </div>


            <div
                id="matchesList"
                class="donation-grid">

                Loading matches...

            </div>

        `;


        loadMatches();

    }


    // ---------------------------------------------
    // PICKUP
    // ---------------------------------------------

    else if (section === "pickup") {

        content.innerHTML = `

            <div class="dashboard-header">

                <h2>Pickup & Delivery</h2>

                <p>
                    Track active food pickups.
                </p>

            </div>


            <div
                id="pickupList"
                class="donation-grid">

                Loading pickups...

            </div>

        `;


        loadPickups();

    }


    // ---------------------------------------------
    // IMPACT
    // ---------------------------------------------

    else if (section === "impact") {

        content.innerHTML = `

            <div class="dashboard-header">

                <h2>Impact Dashboard</h2>

                <p>
                    See the impact created by rescued food.
                </p>

            </div>


            <div class="stats-grid">

                <div class="stat-card">

                    <h3>Food Rescued</h3>

                    <p id="impactFood">
                        0 kg
                    </p>

                </div>


                <div class="stat-card">

                    <h3>Meals Rescued</h3>

                    <p id="impactMeals">
                        0
                    </p>

                </div>


                <div class="stat-card">

                    <h3>Deliveries</h3>

                    <p id="impactDeliveries">
                        0
                    </p>

                </div>

            </div>

        `;


        loadStats();

    }

}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }


    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}


// =====================================================
// MODAL OUTSIDE CLICK
// =====================================================

window.addEventListener("click", function (event) {

    if (event.target.classList.contains("modal")) {

        event.target.classList.remove("active");

        event.target.style.display = "none";

    }

});