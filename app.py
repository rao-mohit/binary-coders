from flask import Flask, request, jsonify
from flask_cors import CORS
from database import get_db, init_db
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Initialize database
init_db()


# =========================================================
# HOME
# =========================================================

@app.route("/")
def home():
    return jsonify({
        "success": True,
        "message": "SurplusToShelter Backend is Running!"
    })


# =========================================================
# API TEST
# =========================================================

@app.route("/api/test", methods=["GET"])
def test():
    return jsonify({
        "success": True,
        "message": "Backend connected successfully"
    })


# =========================================================
# REGISTER
# =========================================================

@app.route("/api/register", methods=["POST"])
def register():

    data = request.get_json()

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role", "donor")

    if not name or not email or not password:
        return jsonify({
            "success": False,
            "message": "All fields are required"
        }), 400

    conn = get_db()

    existing = conn.execute(
        "SELECT id FROM users WHERE email = ?",
        (email,)
    ).fetchone()

    if existing:
        conn.close()

        return jsonify({
            "success": False,
            "message": "Email already registered"
        }), 409

    cursor = conn.execute("""
        INSERT INTO users
        (name, email, password, role)
        VALUES (?, ?, ?, ?)
    """, (name, email, password, role))

    conn.commit()

    user_id = cursor.lastrowid

    conn.close()

    return jsonify({
        "success": True,
        "message": "Registration successful",
        "user": {
            "id": user_id,
            "name": name,
            "email": email,
            "role": role
        }
    })


# =========================================================
# LOGIN
# =========================================================

@app.route("/api/login", methods=["POST"])
def login():

    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({
            "success": False,
            "message": "Email and password are required"
        }), 400

    conn = get_db()

    user = conn.execute("""
        SELECT *
        FROM users
        WHERE email = ? AND password = ?
    """, (email, password)).fetchone()

    conn.close()

    if not user:
        return jsonify({
            "success": False,
            "message": "Invalid email or password"
        }), 401

    return jsonify({
        "success": True,
        "message": "Login successful",
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "role": user["role"]
        }
    })


# =========================================================
# CREATE DONATION
# =========================================================

@app.route("/api/donations", methods=["POST"])
def create_donation():

    data = request.get_json()

    donor_id = data.get("donor_id")
    food_name = data.get("food_name")
    quantity = data.get("quantity")
    location = data.get("location")
    expiry_time = data.get("expiry_time")

    if not food_name or not quantity or not location or not expiry_time:
        return jsonify({
            "success": False,
            "message": "All donation fields are required"
        }), 400

    try:
        quantity = float(quantity)
    except (ValueError, TypeError):
        return jsonify({
            "success": False,
            "message": "Quantity must be a number"
        }), 400

    conn = get_db()

    cursor = conn.execute("""
        INSERT INTO donations
        (donor_id, food_name, quantity, location, expiry_time, status)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (
        donor_id,
        food_name,
        quantity,
        location,
        expiry_time,
        "Posted"
    ))

    donation_id = cursor.lastrowid

    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "message": "Donation posted successfully",
        "donation_id": donation_id
    })


# =========================================================
# GET DONATIONS
# =========================================================

@app.route("/api/donations", methods=["GET"])
def get_donations():

    conn = get_db()

    donations = conn.execute("""
        SELECT
            donations.*,
            users.name AS donor_name
        FROM donations
        LEFT JOIN users
        ON donations.donor_id = users.id
        ORDER BY donations.id DESC
    """).fetchall()

    conn.close()

    result = []

    for donation in donations:

        result.append({
            "id": donation["id"],
            "food_name": donation["food_name"],
            "quantity": donation["quantity"],
            "location": donation["location"],
            "expiry_time": donation["expiry_time"],
            "status": donation["status"],
            "donor_name": donation["donor_name"] or "Anonymous",
            "created_at": donation["created_at"]
        })

    return jsonify({
        "success": True,
        "donations": result
    })


# =========================================================
# DASHBOARD STATISTICS
# =========================================================

@app.route("/api/stats", methods=["GET"])
def stats():

    conn = get_db()

    food = conn.execute("""
        SELECT COALESCE(SUM(quantity), 0)
        FROM donations
    """).fetchone()[0]

    active = conn.execute("""
        SELECT COUNT(*)
        FROM donations
        WHERE status != 'Delivered'
    """).fetchone()[0]

    delivered = conn.execute("""
        SELECT COUNT(*)
        FROM donations
        WHERE status = 'Delivered'
    """).fetchone()[0]

    donations = conn.execute("""
        SELECT COUNT(*)
        FROM donations
    """).fetchone()[0]

    conn.close()

    # Demo conversion:
    # 1 kg food = 2.5 meals
    meals = round(food * 2.5)

    return jsonify({
        "success": True,
        "food_rescued": round(food, 2),
        "meals_rescued": meals,
        "active_donations": active,
        "deliveries": delivered,
        "total_donations": donations
    })


# =========================================================
# SMART MATCHING
# =========================================================

@app.route("/api/matches/<int:donation_id>", methods=["POST"])
def create_match(donation_id):

    conn = get_db()

    donation = conn.execute("""
        SELECT *
        FROM donations
        WHERE id = ?
    """, (donation_id,)).fetchone()

    if not donation:
        conn.close()

        return jsonify({
            "success": False,
            "message": "Donation not found"
        }), 404

    # Demo recipient matching
    recipient = "Community Food Shelter"

    cursor = conn.execute("""
        INSERT INTO matches
        (donation_id, recipient_name, status)
        VALUES (?, ?, ?)
    """, (
        donation_id,
        recipient,
        "Matched"
    ))

    match_id = cursor.lastrowid

    conn.execute("""
        UPDATE donations
        SET status = 'Matched'
        WHERE id = ?
    """, (donation_id,))

    conn.execute("""
        INSERT INTO deliveries
        (match_id, pickup_status, delivery_status)
        VALUES (?, ?, ?)
    """, (
        match_id,
        "Pending",
        "Pending"
    ))

    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "message": "Donation matched successfully",
        "recipient": recipient,
        "match_id": match_id
    })


# =========================================================
# GET MATCHES
# =========================================================

@app.route("/api/matches", methods=["GET"])
def get_matches():

    conn = get_db()

    matches = conn.execute("""
        SELECT
            matches.*,
            donations.food_name,
            donations.quantity,
            donations.location
        FROM matches
        JOIN donations
        ON matches.donation_id = donations.id
        ORDER BY matches.id DESC
    """).fetchall()

    conn.close()

    result = []

    for match in matches:

        result.append({
            "id": match["id"],
            "donation_id": match["donation_id"],
            "food_name": match["food_name"],
            "quantity": match["quantity"],
            "location": match["location"],
            "recipient_name": match["recipient_name"],
            "status": match["status"]
        })

    return jsonify({
        "success": True,
        "matches": result
    })


# =========================================================
# UPDATE DONATION STATUS
# =========================================================

@app.route("/api/donations/<int:donation_id>/status", methods=["PUT"])
def update_status(donation_id):

    data = request.get_json()

    status = data.get("status")

    allowed_statuses = [
        "Posted",
        "Matched",
        "Picked Up",
        "Delivered"
    ]

    if status not in allowed_statuses:

        return jsonify({
            "success": False,
            "message": "Invalid status"
        }), 400

    conn = get_db()

    donation = conn.execute("""
        SELECT id
        FROM donations
        WHERE id = ?
    """, (donation_id,)).fetchone()

    if not donation:

        conn.close()

        return jsonify({
            "success": False,
            "message": "Donation not found"
        }), 404

    conn.execute("""
        UPDATE donations
        SET status = ?
        WHERE id = ?
    """, (status, donation_id))

    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "message": f"Donation status updated to {status}"
    })


# =========================================================
# GET PICKUP ROUTES
# =========================================================

@app.route("/api/pickups", methods=["GET"])
def get_pickups():

    conn = get_db()

    pickups = conn.execute("""
        SELECT
            donations.id,
            donations.food_name,
            donations.quantity,
            donations.location,
            donations.status,
            matches.recipient_name
        FROM donations
        LEFT JOIN matches
        ON donations.id = matches.donation_id
        WHERE donations.status IN
        ('Matched', 'Picked Up')
        ORDER BY donations.id DESC
    """).fetchall()

    conn.close()

    result = []

    for pickup in pickups:

        result.append({
            "id": pickup["id"],
            "food_name": pickup["food_name"],
            "quantity": pickup["quantity"],
            "location": pickup["location"],
            "status": pickup["status"],
            "recipient_name": pickup["recipient_name"] or "Not matched"
        })

    return jsonify({
        "success": True,
        "pickups": result
    })


# =========================================================
# DELETE DONATION
# =========================================================

@app.route("/api/donations/<int:donation_id>", methods=["DELETE"])
def delete_donation(donation_id):

    conn = get_db()

    donation = conn.execute("""
        SELECT id
        FROM donations
        WHERE id = ?
    """, (donation_id,)).fetchone()

    if not donation:

        conn.close()

        return jsonify({
            "success": False,
            "message": "Donation not found"
        }), 404

    conn.execute("""
        DELETE FROM donations
        WHERE id = ?
    """, (donation_id,))

    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "message": "Donation deleted"
    })


# =========================================================
# RUN SERVER
# =========================================================

if __name__ == "__main__":

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )