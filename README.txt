# Discord Applicatie - Installatiehandleiding

Deze repository bevat de broncode en database voor de Discord-applicatie. Volg onderstaande stappen om de applicatie lokaal te draaien.

## 1. Vereisten

Zorg ervoor dat je de volgende software geïnstalleerd hebt:

* **Node.js** (voor de backend/frontend)
* **MySQL Workbench** (voor het beheren van de database)

## 2. Database installatie

Om de database op te zetten:

1. Open MySQL Workbench en maak verbinding met je lokale database-server.

2. Open een nieuw SQL-query tabblad (klik op het icoontje met het plusje op een SQL-document linksboven).

3. Kopieer en plak de sql code (helemaal onderaan in dit bestandje) in het venster.

4. Klik op het bliksemschichtje (Execute) in de werkbalk om de code uit te voeren, 
   eerst moet je create database uitvoeren, daarna use database en tenslotte kun je derest uitvoeren.

5. Ververs de lijst met schema's links (klik op het icoontje met de twee pijltjes). Je ziet nu discord_db in de lijst staan.

## 3. Applicatie starten

Voordat je de app start, moet de verbinding met de database geconfigureerd zijn:

1. Open je backend-map in je code-editor.
2. Controleer het configuratiebestand (bijv. `.env` of `db.js`) en zorg dat de database-credentials (`user`, `password`, `host`) overeenkomen met jouw lokale MySQL-instellingen.
3. Open een terminal in de projectmap en voer de volgende commando's uit:

```bash
# Installeer de nodige packages
npm install

# Start de applicatie
npm start

```

## 4. Gebruik

Zodra de applicatie draait, kun je deze bereiken via `http://localhost:3000` (of de poort die in jouw code staat ingesteld).

---

SQL Code Databank:

CREATE DATABASE IF NOT EXISTS discord_db;
USE discord_db;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    message_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (receiver_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS friendships (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    friend_id INT NOT NULL,
    status ENUM('pending', 'accepted') DEFAULT 'pending'
);