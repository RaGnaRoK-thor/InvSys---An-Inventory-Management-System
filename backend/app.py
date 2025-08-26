from flask import Flask, request, jsonify, session, redirect, url_for, send_from_directory
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import timedelta
from functools import wraps
from database import init_db, get_db_connection
import os
import sqlite3 # Import sqlite3 here to catch IntegrityError

app = Flask(__name__, static_folder='../frontend', static_url_path='/')
app.secret_key = os.urandom(24) # A strong secret key for session management
app.permanent_session_lifetime = timedelta(minutes=30) # Session lasts for 30 minutes

# Initialize the database when the app starts
with app.app_context():
    init_db()

# --- Authentication Decorator ---
def login_required(f):
    """
    Decorator to ensure a user is logged in before accessing certain routes.
    Redirects to the login page if not authenticated.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'employee_id' not in session:
            # If not logged in, return an unauthorized JSON response
            return jsonify({'message': 'Unauthorized, please log in.'}), 401
        return f(*args, **kwargs)
    return decorated_function

# --- Frontend Routes ---
@app.route('/')
def index():
    """Serves the main index.html (login/signup) page."""
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/dashboard')
@login_required
def dashboard():
    """Serves the dashboard.html page if the user is logged in."""
    return send_from_directory(app.static_folder, 'dashboard.html')

@app.route('/<path:path>')
def serve_static_files(path):
    """Serves other static files (CSS, JS) from the frontend directory."""
    return send_from_directory(app.static_folder, path)

# --- Authentication API Endpoints ---
@app.route('/api/register', methods=['POST'])
def register():
    """Registers a new user (employee)."""
    data = request.get_json()
    employee_id = data.get('employee_id')
    password = data.get('password')
    confirm_password = data.get('confirm_password')

    if not employee_id or not password or not confirm_password:
        return jsonify({'message': 'Missing required fields'}), 400

    if password != confirm_password:
        return jsonify({'message': 'Passwords do not match'}), 400

    hashed_password = generate_password_hash(password)

    conn = get_db_connection()
    try:
        conn.execute('INSERT INTO users (employee_id, password) VALUES (?, ?)',
                     (employee_id, hashed_password))
        conn.commit()
        return jsonify({'message': 'User registered successfully'}), 201
    except sqlite3.IntegrityError:
        return jsonify({'message': 'Employee ID already exists'}), 409
    finally:
        conn.close()

@app.route('/api/login', methods=['POST'])
def login():
    """Authenticates a user."""
    data = request.get_json()
    employee_id = data.get('employee_id')
    password = data.get('password')

    if not employee_id or not password:
        return jsonify({'message': 'Missing employee ID or password'}), 400

    conn = get_db_connection()
    user = conn.execute('SELECT * FROM users WHERE employee_id = ?', (employee_id,)).fetchone()
    conn.close()

    if user and check_password_hash(user['password'], password):
        session.permanent = True
        session['employee_id'] = user['employee_id']
        return jsonify({'message': 'Login successful'}), 200
    else:
        return jsonify({'message': 'Invalid credentials'}), 401

@app.route('/api/logout', methods=['POST'])
@login_required
def logout():
    """Logs out the current user."""
    session.pop('employee_id', None)
    return jsonify({'message': 'Logged out successfully'}), 200

# --- Dashboard Summary API Endpoint ---
@app.route('/api/dashboard_summary', methods=['GET'])
@login_required
def dashboard_summary():
    """Provides summary statistics for the dashboard."""
    conn = get_db_connection()

    total_employees = conn.execute('SELECT COUNT(*) FROM users').fetchone()[0]
    total_categories = conn.execute('SELECT COUNT(*) FROM categories').fetchone()[0]
    total_suppliers = conn.execute('SELECT COUNT(*) FROM suppliers').fetchone()[0]
    total_products = conn.execute('SELECT COUNT(*) FROM products').fetchone()[0]

    # Products needing restock: current stock is less than 50% of safe stock
    # Also ensure safe_stock is not 0 to avoid division by zero or nonsensical results
    products_needing_restock = conn.execute(
        'SELECT COUNT(*) FROM products WHERE stock < (safe_stock * 0.5) AND safe_stock > 0'
    ).fetchone()[0]

    conn.close()

    return jsonify({
        'total_employees': total_employees,
        'total_categories': total_categories,
        'total_suppliers': total_suppliers,
        'total_products': total_products,
        'products_needing_restock': products_needing_restock
    }), 200

# --- Suppliers API Endpoints ---
@app.route('/api/suppliers', methods=['GET', 'POST'])
@login_required
def suppliers():
    conn = get_db_connection()
    if request.method == 'POST':
        data = request.get_json()
        name = data.get('name')
        contact_person = data.get('contact_person')
        phone = data.get('phone')
        email = data.get('email')

        if not name:
            return jsonify({'message': 'Supplier name is required'}), 400

        try:
            conn.execute('INSERT INTO suppliers (name, contact_person, phone, email) VALUES (?, ?, ?, ?)',
                         (name, contact_person, phone, email))
            conn.commit()
            return jsonify({'message': 'Supplier added successfully'}), 201
        except sqlite3.IntegrityError:
            return jsonify({'message': 'Supplier with this name already exists'}), 409
        finally:
            conn.close()
    else: # GET
        suppliers = conn.execute('SELECT * FROM suppliers').fetchall()
        conn.close()
        return jsonify([dict(s) for s in suppliers]), 200

@app.route('/api/suppliers/<int:supplier_id>', methods=['PUT', 'DELETE'])
@login_required
def supplier_detail(supplier_id):
    conn = get_db_connection()
    cursor = conn.cursor() # Get a cursor
    try:
        if request.method == 'PUT':
            data = request.get_json()
            name = data.get('name')
            contact_person = data.get('contact_person')
            phone = data.get('phone')
            email = data.get('email')

            if not name:
                return jsonify({'message': 'Supplier name is required'}), 400

            cursor.execute('UPDATE suppliers SET name = ?, contact_person = ?, phone = ?, email = ? WHERE id = ?',
                           (name, contact_person, phone, email, supplier_id))
            conn.commit()
            if cursor.rowcount == 0: # Check rowcount on the cursor
                return jsonify({'message': 'Supplier not found'}), 404
            return jsonify({'message': 'Supplier updated successfully'}), 200
        elif request.method == 'DELETE':
            cursor.execute('DELETE FROM suppliers WHERE id = ?', (supplier_id,))
            conn.commit()
            if cursor.rowcount == 0: # Check rowcount on the cursor
                return jsonify({'message': 'Supplier not found'}), 404
            return jsonify({'message': 'Supplier deleted successfully'}), 200
    except sqlite3.IntegrityError:
        return jsonify({'message': 'Supplier with this name already exists'}), 409
    finally:
        conn.close()

# --- Categories API Endpoints ---
@app.route('/api/categories', methods=['GET', 'POST'])
@login_required
def categories():
    conn = get_db_connection()
    if request.method == 'POST':
        data = request.get_json()
        name = data.get('name')
        description = data.get('description')

        if not name:
            return jsonify({'message': 'Category name is required'}), 400

        try:
            conn.execute('INSERT INTO categories (name, description) VALUES (?, ?)',
                         (name, description))
            conn.commit()
            return jsonify({'message': 'Category added successfully'}), 201
        except sqlite3.IntegrityError:
            return jsonify({'message': 'Category with this name already exists'}), 409
        finally:
            conn.close()
    else: # GET
        categories = conn.execute('SELECT * FROM categories').fetchall()
        conn.close()
        return jsonify([dict(c) for c in categories]), 200

@app.route('/api/categories/<int:category_id>', methods=['PUT', 'DELETE'])
@login_required
def category_detail(category_id):
    conn = get_db_connection()
    cursor = conn.cursor() # Get a cursor
    try:
        if request.method == 'PUT':
            data = request.get_json()
            name = data.get('name')
            description = data.get('description')

            if not name:
                return jsonify({'message': 'Category name is required'}), 400

            cursor.execute('UPDATE categories SET name = ?, description = ? WHERE id = ?',
                           (name, description, category_id))
            conn.commit()
            if cursor.rowcount == 0: # Check rowcount on the cursor
                return jsonify({'message': 'Category not found'}), 404
            return jsonify({'message': 'Category updated successfully'}), 200
        elif request.method == 'DELETE':
            cursor.execute('DELETE FROM categories WHERE id = ?', (category_id,))
            conn.commit()
            if cursor.rowcount == 0: # Check rowcount on the cursor
                return jsonify({'message': 'Category not found'}), 404
            return jsonify({'message': 'Category deleted successfully'}), 200
    except sqlite3.IntegrityError:
        return jsonify({'message': 'Category with this name already exists'}), 409
    finally:
        conn.close()

# --- Products API Endpoints ---
@app.route('/api/products', methods=['GET', 'POST'])
@login_required
def products():
    conn = get_db_connection()
    if request.method == 'POST':
        data = request.get_json()
        name = data.get('name')
        description = data.get('description')
        price = data.get('price')
        currency_code = data.get('currency_code', 'USD')
        stock = data.get('stock')
        safe_stock = data.get('safe_stock', 100) # Get safe stock, default to 100
        category_id = data.get('category_id')
        supplier_id = data.get('supplier_id')

        if not name or price is None or currency_code is None or stock is None or safe_stock is None:
            return jsonify({'message': 'Product name, price, currency, stock, and safe stock are required'}), 400
        if not isinstance(price, (int, float)) or price < 0:
            return jsonify({'message': 'Price must be a non-negative number'}), 400
        if not isinstance(stock, int) or stock < 0:
            return jsonify({'message': 'Stock must be a non-negative integer'}), 400
        if not isinstance(safe_stock, int) or safe_stock < 0:
            return jsonify({'message': 'Safe Stock must be a non-negative integer'}), 400


        try:
            conn.execute('INSERT INTO products (name, description, price, currency_code, stock, safe_stock, category_id, supplier_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                         (name, description, price, currency_code, stock, safe_stock, category_id, supplier_id))
            conn.commit()
            return jsonify({'message': 'Product added successfully'}), 201
        except sqlite3.IntegrityError:
            return jsonify({'message': 'Product with this name already exists'}), 409
        finally:
            conn.close()
    else: # GET
        products = conn.execute('''
            SELECT p.id, p.name, p.description, p.price, p.currency_code, p.stock, p.safe_stock,
                   c.name AS category_name, s.name AS supplier_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN suppliers s ON p.supplier_id = s.id
        ''').fetchall()
        conn.close()
        return jsonify([dict(p) for p in products]), 200

@app.route('/api/products/<int:product_id>', methods=['PUT', 'DELETE'])
@login_required
def product_detail(product_id):
    conn = get_db_connection()
    cursor = conn.cursor() # Get a cursor
    try:
        if request.method == 'PUT':
            data = request.get_json()
            name = data.get('name')
            description = data.get('description')
            price = data.get('price')
            currency_code = data.get('currency_code', 'USD')
            stock = data.get('stock')
            safe_stock = data.get('safe_stock', 100)
            category_id = data.get('category_id')
            supplier_id = data.get('supplier_id')

            if not name or price is None or currency_code is None or stock is None or safe_stock is None:
                return jsonify({'message': 'Product name, price, currency, stock, and safe stock are required'}), 400
            if not isinstance(price, (int, float)) or price < 0:
                return jsonify({'message': 'Price must be a non-negative number'}), 400
            if not isinstance(stock, int) or stock < 0:
                return jsonify({'message': 'Stock must be a non-negative integer'}), 400
            if not isinstance(safe_stock, int) or safe_stock < 0:
                return jsonify({'message': 'Safe Stock must be a non-negative integer'}), 400

            cursor.execute('UPDATE products SET name = ?, description = ?, price = ?, currency_code = ?, stock = ?, safe_stock = ?, category_id = ?, supplier_id = ? WHERE id = ?',
                           (name, description, price, currency_code, stock, safe_stock, category_id, supplier_id, product_id))
            conn.commit()
            if cursor.rowcount == 0: # Check rowcount on the cursor
                return jsonify({'message': 'Product not found'}), 404
            return jsonify({'message': 'Product updated successfully'}), 200
        elif request.method == 'DELETE':
            cursor.execute('DELETE FROM products WHERE id = ?', (product_id,))
            conn.commit()
            if cursor.rowcount == 0: # Check rowcount on the cursor
                return jsonify({'message': 'Product not found'}), 404
            return jsonify({'message': 'Product deleted successfully'}), 200
    except sqlite3.IntegrityError:
        return jsonify({'message': 'Product with this name already exists'}), 409
    finally:
        conn.close()

if __name__ == '__main__':
    # Run the Flask app on localhost:5000
    app.run(debug=True, port=5000)

