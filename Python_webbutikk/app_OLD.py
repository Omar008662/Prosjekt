from flask import Flask, render_template, request, redirect, session
import sqlite3

app = Flask(__name__)
app.secret_key = "superhemmelig"

# Opprett database
def init_db():
    conn = sqlite3.connect("produkter.db")
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS bestilling (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            navn TEXT NOT NULL,
            produkt TEXT NOT NULL,
            pris INTEGER NOT NULL,
            antall INTEGER NOT NULL
        )
    """)
    conn.commit()
    conn.close()

# Liste over produkter
PRODUKTER = [
    {"navn": "Trenings Flaske", "pris": 349, "img": "/static/Svartflaske2.png"},
    {"navn": "Compression Shirt", "pris": 499, "img": "/static/Compression shirt.webp"},
    {"navn": "Lifting Straps", "pris": 299, "img": "/static/Lifting straps.png"},
]

@app.route("/", methods=["GET", "POST"])
def index():
    if "handlekurv" not in session:
        session["handlekurv"] = []

    if request.method == "POST":
        produkt_navn = request.form["produkt_navn"]
        pris = int(request.form["pris"])
        antall = int(request.form.get("antall", 1))
        img = request.form["img"]

        # Legg i handlekurv
        session["handlekurv"].append({
            "produkt": produkt_navn,
            "pris": pris,
            "antall": antall,
            "img": img
        })
        session.modified = True
        return redirect("/")

    return render_template("index.html", produkter=PRODUKTER, handlekurv=session["handlekurv"])

@app.route("/bestill", methods=["POST"])
def bestill():
    navn = request.form["navn"]
    handlekurv = session.get("handlekurv", [])

    if not handlekurv:
        return redirect("/")

    conn = sqlite3.connect("produkter.db")
    c = conn.cursor()
    for item in handlekurv:
        c.execute("INSERT INTO bestilling (navn, produkt, pris, antall) VALUES (?, ?, ?, ?)",
                  (navn, item["produkt"], item["pris"], item["antall"]))
    conn.commit()
    conn.close()

    session["handlekurv"] = []
    return redirect("/")

@app.route("/oversikt")
def oversikt():
    conn = sqlite3.connect("produkter.db")
    c = conn.cursor()
    c.execute("""
        SELECT navn, produkt, SUM(antall) as total, pris
        FROM bestilling
        GROUP BY navn, produkt, pris
        ORDER BY navn
    """)
    bestillinger = c.fetchall()
    conn.close()
    return render_template("oversikt.html", bestillinger=bestillinger)

if __name__ == "__main__":
    init_db()
    app.run(debug=True)
