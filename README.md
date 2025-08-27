
# 📦InvSys - Inventory Management System

A simple, locally runnable Inventory Management System built with Python Flask for the backend and plain HTML, CSS, and JavaScript for the frontend. This application helps track employees, suppliers, categories, and products, including stock levels and restock alerts.

## ✨ Features

* **User Authentication:**
    * **Sign Up:** Create new employee accounts with Employee ID and password.
    * **Login:** Securely log in with validated credentials.
    * **Logout:** End your session securely.
* **Dashboard Overview:**
    * View real-time summaries of total employees, categories, suppliers, and products.
    * **Restock Alert:** Instantly see the number of products needing restock based on a dynamic "safe stock" level.
* **Inventory Management (CRUD Operations):**
    * **Suppliers:** Add, update, and delete supplier information.
    * **Categories:** Add, update, and delete product categories.
    * **Products:** Add, update, and delete product details, including name, description, price, currency, stock, safe stock, category, and supplier.
    * **Dynamic Restock Flagging:** Products are automatically flagged if their current stock is less than 50% of their defined safe stock level.
* **Modular Architecture:** Clean separation of backend (Python) and frontend (HTML/CSS/JS) code.
* **Dark Mode UI:** A sleek, dark-themed user interface.
* **SQLite Database:** Lightweight, file-based database for local data storage.

## 🚀 Technologies Used

* **Backend:**
    * **Python 3.x**
    * **Flask:** Web framework
    * **Werkzeug:** (Used by Flask for security utilities like password hashing)
    * **SQLite3:** Database
* **Frontend:**
    * **HTML5:** Structure
    * **CSS3:** Styling (custom dark theme, no frameworks)
    * **JavaScript (Vanilla JS):** Client-side interactivity and API calls

## 📁 Project Structure

The project follows a modular design for easy understanding and maintenance:

```

inventory-system/
├── backend/
│   ├── app.py           \# Main Flask application with API endpoints
│   ├── database.py      \# Database initialization and connection utilities
│   └── inventory.db     \# SQLite database file (generated automatically)
└── frontend/
├── index.html       \# Sign Up and Login page
├── dashboard.html   \# Main dashboard and inventory management page
├── style.css        \# Custom dark mode styling
└── script.js        \# Frontend logic, API calls, and UI interactions

````

## ⚙️ Setup Instructions

Follow these steps to get the Inventory Management System running on your local machine.

### 1. Clone or Download the Project

First, create a directory for your project and place all the files inside it according to the structure described above.

```bash
# Example: Create the main directory
mkdir inventory-system
cd inventory-system

# Manually create backend/ and frontend/
mkdir backend frontend

# Then place the files you received into these folders.
````

### 2\. Install Python Dependencies

Open your terminal or command prompt, navigate to the **root of the `inventory-system` directory**, and install the required Python packages:

```bash
pip install Flask Werkzeug
```

### 3\. Initialize the Database

The `inventory.db` file will be created automatically when you run the Flask app for the first time. To ensure you get the latest database structure (with the currency and safe stock fields), you should **delete any old `inventory.db` file** you have before running the app.

### 4\. Run the Backend Server

Navigate into the `backend` directory from your terminal:

```bash
cd backend
```

Then, run the Flask application:

```bash
python app.py
```

You should see output similar to this, indicating the server is running:

```
 * Debug mode: on
 * Running on [http://127.0.0.1:5000](http://127.0.0.1:5000)
```

## 🌐 Usage

1.  **Access the Application:** Open your web browser and navigate to: `http://localhost:5000/`

2.  **Sign Up:** On the initial page, you'll find options to **Sign Up** or **Login**. If you're a new user, create an account by providing an Employee ID and a password.

3.  **Login:** After signing up (or if you already have an account), log in with your credentials.

4.  **Dashboard:** Upon successful login, you'll be redirected to the **Dashboard**. Here, you'll see summary statistics and various sections for managing your inventory.

5.  **Inventory Management:**

      * Use the toggle buttons (`Suppliers`, `Categories`, `Products`) to switch between different management sections.
      * **Add:** Fill out the form fields and click the "Add" button to create a new entry.
      * **Update:** Click the **"Edit"** button next to an existing entry in the table. The form fields will populate with the existing data. Make your changes and click the **"Update"** button.
      * **Delete:** Click the **"Delete"** button next to an entry in the table. You'll be prompted for confirmation before deletion.

## 🛠️ Customization and Extension

Feel free to modify and extend this project\! Here are some ideas:

  * **Enhanced UI:** While deliberately minimal, you could integrate a lightweight CSS framework or add more interactive elements with JavaScript.
  * **Advanced Reports:** Implement more complex reporting features for inventory trends, sales, etc.
  * **User Roles:** Introduce different user roles (e.g., admin, manager, employee) with varying permissions.
  * **Search and Filtering:** Add search bars and filter options to the tables for easier data navigation.
  * **Image Uploads:** Allow product images to be uploaded and stored.

<!-- end list -->

```
```
