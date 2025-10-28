# 🏋️ HabitTracker — Schemat bazy danych i API

Backend aplikacji do śledzenia treningów i nawyków.  
Technologie: **Node.js (Express)**, **SQLite (better-sqlite3)**, **JWT Auth**.

---

## 🗄️ Schemat bazy danych

### **users**
| Kolumna | Typ | Opis |
|----------|-----|------|
| `id` | INTEGER PK | Identyfikator użytkownika |
| `username` | TEXT UNIQUE | Nazwa użytkownika |
| `pin_hash` | TEXT | Hash 4-cyfrowego PINu |
| `created_at` | TEXT | Data utworzenia (ISO datetime) |

---

### **exercises**
| Kolumna | Typ | Opis |
|----------|-----|------|
| `id` | INTEGER PK | Identyfikator ćwiczenia |
| `name` | TEXT | Nazwa ćwiczenia |
| `muscle_group` | TEXT | Grupa mięśniowa (np. Chest, Legs…) |

---

### **plans**
| Kolumna | Typ | Opis |
|----------|-----|------|
| `id` | INTEGER PK | Identyfikator planu |
| `user_id` | INTEGER FK → users.id | Właściciel planu |
| `name` | TEXT | Nazwa planu |
| `created_at` | TEXT | Data utworzenia |

---

### **plan_exercises**
| Kolumna | Typ | Opis |
|----------|-----|------|
| `id` | INTEGER PK | Identyfikator wpisu |
| `plan_id` | INTEGER FK → plans.id | Powiązany plan |
| `exercise_id` | INTEGER FK → exercises.id | Powiązane ćwiczenie |
| `order_index` | INTEGER | Kolejność w planie |
| `sets` | INTEGER | Liczba serii |
| `reps` | TEXT | Liczba powtórzeń (np. "8-12") |

---

### **workout_sessions**
| Kolumna | Typ | Opis |
|----------|-----|------|
| `id` | INTEGER PK | Identyfikator sesji |
| `user_id` | INTEGER FK → users.id | Użytkownik |
| `date` | TEXT | Data (YYYY-MM-DD) |
| `created_at` | TEXT | Data utworzenia |
| UNIQUE(`user_id`, `date`) | | Jedna sesja na dzień |

---

### **workout_session_exercises**
| Kolumna | Typ | Opis |
|----------|-----|------|
| `id` | INTEGER PK | Identyfikator wpisu |
| `session_id` | INTEGER FK → workout_sessions.id | Sesja treningowa |
| `exercise_id` | INTEGER FK → exercises.id | Ćwiczenie |
| `sets` | INTEGER | Serii |
| `reps` | TEXT | Powtórzeń |
| `weight` | REAL | Ciężar (opcjonalnie) |

---

### **habits**
| Kolumna | Typ | Opis |
|----------|-----|------|
| `id` | INTEGER PK | Identyfikator nawyku |
| `user_id` | INTEGER FK → users.id | Użytkownik |
| `name` | TEXT | Nazwa nawyku |
| `target` | INTEGER | Cel dzienny |
| `unit` | TEXT | Jednostka (np. „count”) |
| `created_at` | TEXT | Data utworzenia |

---

### **habit_entries**
| Kolumna | Typ | Opis |
|----------|-----|------|
| `id` | INTEGER PK | Identyfikator wpisu |
| `habit_id` | INTEGER FK → habits.id | Powiązany nawyk |
| `date` | TEXT | Data (YYYY-MM-DD) |
| `value` | INTEGER | Wartość (np. 0/1) |
| UNIQUE(`habit_id`, `date`) | | Jeden wpis na dzień/nawyk |

---

## 🌐 API — Skrót endpointów

### 🔑 Autoryzacja
| Metoda | Endpoint | Body | Opis |
|--------|-----------|------|------|
| **POST** | `/api/auth` | `{ "username": "adam", "pin": "1234" }` | Logowanie lub rejestracja, zwraca token JWT |

---

### 👤 Użytkownik
| Metoda | Endpoint | Body | Opis |
|--------|-----------|------|------|
| **GET** | `/api/me` | — | Zwraca dane aktualnego użytkownika (`{ username }`) |

---

### 🏋️ Ćwiczenia
| Metoda | Endpoint | Body | Opis |
|--------|-----------|------|------|
| **GET** | `/api/exercises` | — | Pobiera listę wszystkich ćwiczeń |
| **POST** | `/api/exercises` | `{ name, category }` | Dodaje nowe ćwiczenie |
| **PATCH** | `/api/exercises/:id` | `{ name?, category? }` | Edytuje istniejące ćwiczenie |
| **DELETE** | `/api/exercises/:id` | — | Usuwa ćwiczenie (409 jeśli jest w planie lub sesji, `?force=true` żeby wymusić) |

---

### 🧩 Plany
| Metoda | Endpoint | Body | Opis |
|--------|-----------|------|------|
| **GET** | `/api/plans` | — | Lista planów użytkownika |
| **GET** | `/api/plans/:id` | — | Szczegóły planu (ćwiczenia) |
| **POST** | `/api/plans` | `{ name, items:[{exercise_id, sets, reps}] }` | Tworzy plan |
| **DELETE** | `/api/plans/:id` | — | Usuwa plan |

---

### 🗓️ Treningi
| Metoda | Endpoint | Body / Query | Opis |
|--------|-----------|--------------|------|
| **GET** | `/api/workouts/days` | `?from=YYYY-MM-DD&to=YYYY-MM-DD` | Zwraca daty dni, w których był trening |
| **POST** | `/api/workouts/sessions` | `{ date: "YYYY-MM-DD" }` | Oznacza dzień jako „trening wykonany” |
| **DELETE** | `/api/workouts/sessions?date=YYYY-MM-DD` | — | Usuwa oznaczenie treningu dla dnia |

---

### 🌱 Nawyki
| Metoda | Endpoint | Body / Query | Opis |
|--------|-----------|--------------|------|
| **GET** | `/api/habits` | — | Lista wszystkich nawyków użytkownika |
| **POST** | `/api/habits` | `{ name, target?, unit? }` | Dodaje nowy nawyk |
| **GET** | `/api/habits/entries` | `?from=YYYY-MM-DD&to=YYYY-MM-DD` | Pobiera wpisy nawyków z zakresu dat |
| **POST** | `/api/habits/:id/entries` | `{ date, value }` | Ustawia wartość nawyku dla dnia |

---

### 🔒 Nagłówki autoryzacji
Większość endpointów wymaga tokenu JWT:

