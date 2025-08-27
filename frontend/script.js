// frontend/script.js

document.addEventListener('DOMContentLoaded', () => {
    const messageBox = document.getElementById('message-box');
    const loginSection = document.getElementById('login-section');
    const signupSection = document.getElementById('signup-section');
    const showSignupLink = document.getElementById('show-signup');
    const showLoginLink = document.getElementById('show-login');

    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const logoutButton = document.getElementById('logout-button');

    // Main title elements
    const mainTitle = document.getElementById('main-title');
    const mainSubtitle = document.getElementById('main-subtitle');

    // Dashboard elements
    const totalEmployees = document.getElementById('total-employees');
    const totalCategories = document.getElementById('total-categories');
    const totalSuppliers = document.getElementById('total-suppliers');
    const totalProducts = document.getElementById('total-products');
    const productsNeedingRestock = document.getElementById('products-needing-restock');

    // Inventory management elements
    const showDashboardBtn = document.getElementById('show-dashboard-btn');
    const showSupplierBtn = document.getElementById('show-supplier-btn');
    const showCategoryBtn = document.getElementById('show-category-btn');
    const showProductBtn = document.getElementById('show-product-btn');
    const dashboardSection = document.getElementById('dashboard-section');
    const supplierSection = document.getElementById('supplier-section');
    const categorySection = document.getElementById('category-section');
    const productSection = document.getElementById('product-section');

    const supplierForm = document.getElementById('supplier-form');
    const categoryForm = document.getElementById('category-form');
    const productForm = document.getElementById('product-form');

    const suppliersTableBody = document.querySelector('#suppliers-table tbody');
    const categoriesTableBody = document.querySelector('#categories-table tbody');
    const productsTableBody = document.querySelector('#products-table tbody');

    const productCategorySelect = document.getElementById('product-category');
    const productSupplierSelect = document.getElementById('product-supplier');
    const productCurrencySelect = document.getElementById('product-currency');
    const productSafeStockInput = document.getElementById('product-safe-stock');

    // --- Global Currency Data ---
    // A comprehensive list of common global currencies and their symbols
    const currencies = {
        'USD': { symbol: '$', name: 'US Dollar' },
        'EUR': { symbol: '€', name: 'Euro' },
        'GBP': { symbol: '£', name: 'British Pound' },
        'JPY': { symbol: '¥', name: 'Japanese Yen' },
        'CAD': { symbol: 'C$', name: 'Canadian Dollar' },
        'AUD': { symbol: 'A$', name: 'Australian Dollar' },
        'CHF': { symbol: 'CHF', name: 'Swiss Franc' },
        'CNY': { symbol: '¥', name: 'Chinese Yuan' },
        'INR': { symbol: '₹', name: 'Indian Rupee' },
        'BRL': { symbol: 'R$', name: 'Brazilian Real' },
        'ZAR': { symbol: 'R', name: 'South African Rand' },
        'AED': { symbol: 'د.إ', name: 'UAE Dirham' },
        'SAR': { symbol: '﷼', name: 'Saudi Riyal' },
        'MXN': { symbol: 'Mex$', name: 'Mexican Peso' },
        'SGD': { symbol: 'S$', name: 'Singapore Dollar' },
        'NZD': { symbol: 'NZ$', name: 'New Zealand Dollar' },
        'KRW': { symbol: '₩', name: 'South Korean Won' },
        'SEK': { symbol: 'kr', name: 'Swedish Krona' },
        'RUB': { symbol: '₽', name: 'Russian Ruble' },
        'TRY': { symbol: '₺', name: 'Turkish Lira' },
        'THB': { symbol: '฿', name: 'Thai Baht' },
        'IDR': { symbol: 'Rp', name: 'Indonesian Rupiah' },
        'PLN': { symbol: 'zł', name: 'Polish Złoty' },
        'CZK': { symbol: 'Kč', name: 'Czech Koruna' },
        'DKK': { symbol: 'kr', name: 'Danish Krone' },
        'NOK': { symbol: 'kr', name: 'Norwegian Krone' },
        'MYR': { symbol: 'RM', name: 'Malaysian Ringgit' },
        'PHP': { symbol: '₱', name: 'Philippine Peso' },
        'EGP': { symbol: 'E£', name: 'Egyptian Pound' },
        'CLF': { symbol: 'UF', name: 'Chilean Unidad de Fomento' }, // Special currency
        'KWD': { symbol: 'KD', name: 'Kuwaiti Dinar' },
        'OMR': { symbol: 'ر.ع.', name: 'Omani Rial' },
        'QAR': { symbol: 'ر.ق', name: 'Qatari Riyal' },
        // Add more currencies here as needed
    };

    /**
     * Gets the currency symbol for a given currency code.
     * @param {string} code - The ISO 4217 currency code (e.g., 'USD').
     * @returns {string} The currency symbol or the code itself if not found.
     */
    function getCurrencySymbol(code) {
        return currencies[code] ? currencies[code].symbol : code;
    }

    /**
     * Formats a price with its currency symbol.
     * @param {number} price - The price value.
     * @param {string} currencyCode - The ISO 4217 currency code.
     * @returns {string} Formatted price string (e.g., "$100.00").
     */
    function formatPrice(price, currencyCode) {
        const symbol = getCurrencySymbol(currencyCode);
        return `${symbol}${price.toFixed(2)}`;
    }

    // --- Utility Functions ---
    /**
     * Displays a message in the message box.
     * @param {string} message - The message to display.
     * @param {string} type - 'success' or 'error'.
     */
    function showMessage(message, type) {
        messageBox.textContent = message;
        messageBox.className = `message ${type}`;
        messageBox.style.display = 'block';
        setTimeout(() => {
            messageBox.style.display = 'none';
        }, 5000); // Hide after 5 seconds
    }

    /**
     * Handles API requests.
     * @param {string} url - The API endpoint URL.
     * @param {string} method - HTTP method (GET, POST, PUT, DELETE).
     * @param {Object} [data=null] - Request body data for POST/PUT.
     * @returns {Promise<Object>} - The JSON response from the API.
     */
    async function apiRequest(url, method, data = null) {
        try {
            const options = {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            if (data) {
                options.body = JSON.stringify(data);
            }

            const response = await fetch(url, options);
            if (response.redirected) {
                window.location.href = response.url; // Handle Flask redirects
                return null;
            }
            const responseData = await response.json();

            if (!response.ok) {
                // If not OK, it's an API error from our Flask app
                throw new Error(responseData.message || 'Something went wrong');
            }
            return responseData;

        } catch (error) {
            console.error('API Request Error:', error);
            showMessage(error.message || 'Network error, please try again.', 'error');
            throw error; // Re-throw to be caught by specific form handlers
        }
    }

    // --- Authentication Logic (for index.html) ---
    if (loginForm && signupForm) { // Only run this block on index.html
        showSignupLink.addEventListener('click', (e) => {
            e.preventDefault();
            loginSection.style.display = 'none';
            signupSection.style.display = 'block';
            messageBox.style.display = 'none';
        });

        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            signupSection.style.display = 'none';
            loginSection.style.display = 'block';
            messageBox.style.display = 'none';
        });

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(loginForm);
            const data = Object.fromEntries(formData.entries());

            try {
                await apiRequest('/api/login', 'POST', data);
                showMessage('Login successful! Redirecting...', 'success');
                window.location.href = '/dashboard'; // Redirect on successful login
            } catch (error) {
                // Error message already shown by apiRequest
            }
        });

        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(signupForm);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await apiRequest('/api/register', 'POST', data);
                showMessage(response.message, 'success');
                signupForm.reset();
                // Optionally switch back to login form
                showLoginLink.click();
            } catch (error) {
                // Error message already shown by apiRequest
            }
        });
    }

    // --- Dashboard & Inventory Management Logic (for dashboard.html) ---
    if (logoutButton) { // Only run this block on dashboard.html
        logoutButton.addEventListener('click', async () => {
            try {
                await apiRequest('/api/logout', 'POST');
                showMessage('Logged out successfully. Redirecting...', 'success');
                window.location.href = '/'; // Redirect to login page after logout
            } catch (error) {
                // Error message already shown by apiRequest
            }
        });

        // --- Dashboard Summary Loading ---
        async function loadDashboardSummary() {
            try {
                const summary = await apiRequest('/api/dashboard_summary', 'GET');
                if (summary) {
                    totalEmployees.textContent = summary.total_employees;
                    totalCategories.textContent = summary.total_categories;
                    totalSuppliers.textContent = summary.total_suppliers;
                    totalProducts.textContent = summary.total_products;
                    productsNeedingRestock.textContent = summary.products_needing_restock;
                }
            }
            catch (error) {
                // Error handled by apiRequest
            }
        }

        // --- Sidebar Navigation Logic ---
        const contentSections = {
            'dashboard': { element: dashboardSection, title: 'Dashboard', subtitle: 'Overview of your inventory system' },
            'supplier': { element: supplierSection, title: 'Supplier Management', subtitle: 'Add, update, and view your suppliers' },
            'category': { element: categorySection, title: 'Category Management', subtitle: 'Organize your products with categories' },
            'product': { element: productSection, title: 'Product Management', subtitle: 'Track all your products in one place' }
        };
        const sectionButtons = {
            'dashboard': showDashboardBtn,
            'supplier': showSupplierBtn,
            'category': showCategoryBtn,
            'product': showProductBtn
        };

        function showSection(sectionName) {
            // Hide all sections and deactivate all buttons
            Object.keys(contentSections).forEach(key => {
                contentSections[key].element.classList.remove('active');
                sectionButtons[key].classList.remove('active');
            });
            // Show the requested section and activate its button
            contentSections[sectionName].element.classList.add('active');
            sectionButtons[sectionName].classList.add('active');
            
            // Update the main title and subtitle
            mainTitle.textContent = contentSections[sectionName].title;
            mainSubtitle.textContent = contentSections[sectionName].subtitle;

            // Load data specific to the new section
            if (sectionName === 'dashboard') {
                loadDashboardSummary();
            } else if (sectionName === 'supplier') {
                loadSuppliers();
            } else if (sectionName === 'category') {
                loadCategories();
            } else if (sectionName === 'product') {
                loadProducts();
                populateProductDropdowns();
                populateCurrencyDropdown();
            }
        }
        
        // --- Event Listeners for Sidebar Buttons ---
        showDashboardBtn.addEventListener('click', () => showSection('dashboard'));
        showSupplierBtn.addEventListener('click', () => showSection('supplier'));
        showCategoryBtn.addEventListener('click', () => showSection('category'));
        showProductBtn.addEventListener('click', () => showSection('product'));


        // --- Supplier Management ---
        async function loadSuppliers() {
            try {
                const suppliers = await apiRequest('/api/suppliers', 'GET');
                suppliersTableBody.innerHTML = '';
                suppliers.forEach(supplier => {
                    const row = suppliersTableBody.insertRow();
                    row.insertCell().textContent = supplier.id;
                    row.insertCell().textContent = supplier.name;
                    row.insertCell().textContent = supplier.contact_person || 'N/A';
                    row.insertCell().textContent = supplier.phone || 'N/A';
                    row.insertCell().textContent = supplier.email || 'N/A';
                    const actionsCell = row.insertCell();
                    actionsCell.classList.add('action-buttons');
                    actionsCell.innerHTML = `
                        <button class="edit-btn" data-id="${supplier.id}" data-name="${supplier.name}" data-contact="${supplier.contact_person || ''}" data-phone="${supplier.phone || ''}" data-email="${supplier.email || ''}"><i class="fas fa-edit"></i> Edit</button>
                        <button class="delete-btn" data-id="${supplier.id}"><i class="fas fa-trash-alt"></i> Delete</button>
                    `;
                });
                attachSupplierEventListeners();
            } catch (error) {
                // Error handled by apiRequest
            }
        }

        function attachSupplierEventListeners() {
            document.querySelectorAll('#suppliers-table .edit-btn').forEach(button => {
                button.onclick = (e) => {
                    const { id, name, contact, phone, email } = e.currentTarget.dataset;
                    document.getElementById('supplier-id').value = id;
                    document.getElementById('supplier-name').value = name;
                    document.getElementById('supplier-contact-person').value = contact;
                    document.getElementById('supplier-phone').value = phone;
                    document.getElementById('supplier-email').value = email;
                    document.getElementById('add-update-supplier-btn').textContent = 'Update Supplier';
                };
            });

            document.querySelectorAll('#suppliers-table .delete-btn').forEach(button => {
                button.onclick = async (e) => {
                    const supplierId = e.currentTarget.dataset.id;
                    if (confirm('Are you sure you want to delete this supplier?')) {
                        try {
                            const response = await apiRequest(`/api/suppliers/${supplierId}`, 'DELETE');
                            showMessage(response.message, 'success');
                            loadSuppliers();
                            loadDashboardSummary();
                        } catch (error) {
                            // Error handled by apiRequest
                        }
                    }
                };
            });
        }

        supplierForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const supplierId = document.getElementById('supplier-id').value;
            const formData = new FormData(supplierForm);
            const data = Object.fromEntries(formData.entries());

            try {
                let response;
                if (supplierId) {
                    response = await apiRequest(`/api/suppliers/${supplierId}`, 'PUT', data);
                    document.getElementById('add-update-supplier-btn').textContent = 'Add Supplier';
                } else {
                    response = await apiRequest('/api/suppliers', 'POST', data);
                }
                showMessage(response.message, 'success');
                supplierForm.reset();
                document.getElementById('supplier-id').value = '';
                loadSuppliers();
                loadDashboardSummary();
            } catch (error) {
                // Error handled by apiRequest
            }
        });

        document.getElementById('clear-supplier-form-btn').addEventListener('click', () => {
            supplierForm.reset();
            document.getElementById('supplier-id').value = '';
            document.getElementById('add-update-supplier-btn').textContent = 'Add Supplier';
        });

        // --- Category Management ---
        async function loadCategories() {
            try {
                const categories = await apiRequest('/api/categories', 'GET');
                categoriesTableBody.innerHTML = '';
                categories.forEach(category => {
                    const row = categoriesTableBody.insertRow();
                    row.insertCell().textContent = category.id;
                    row.insertCell().textContent = category.name;
                    row.insertCell().textContent = category.description || 'N/A';
                    const actionsCell = row.insertCell();
                    actionsCell.classList.add('action-buttons');
                    actionsCell.innerHTML = `
                        <button class="edit-btn" data-id="${category.id}" data-name="${category.name}" data-description="${category.description || ''}"><i class="fas fa-edit"></i> Edit</button>
                        <button class="delete-btn" data-id="${category.id}"><i class="fas fa-trash-alt"></i> Delete</button>
                    `;
                });
                attachCategoryEventListeners();
            } catch (error) {
                // Error handled by apiRequest
            }
        }

        function attachCategoryEventListeners() {
            document.querySelectorAll('#categories-table .edit-btn').forEach(button => {
                button.onclick = (e) => {
                    const { id, name, description } = e.currentTarget.dataset;
                    document.getElementById('category-id').value = id;
                    document.getElementById('category-name').value = name;
                    document.getElementById('category-description').value = description;
                    document.getElementById('add-update-category-btn').textContent = 'Update Category';
                };
            });

            document.querySelectorAll('#categories-table .delete-btn').forEach(button => {
                button.onclick = async (e) => {
                    const categoryId = e.currentTarget.dataset.id;
                    if (confirm('Are you sure you want to delete this category?')) {
                        try {
                            const response = await apiRequest(`/api/categories/${categoryId}`, 'DELETE');
                            showMessage(response.message, 'success');
                            loadCategories();
                            loadDashboardSummary();
                        } catch (error) {
                            // Error handled by apiRequest
                        }
                    }
                };
            });
        }

        categoryForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const categoryId = document.getElementById('category-id').value;
            const formData = new FormData(categoryForm);
            const data = Object.fromEntries(formData.entries());

            try {
                let response;
                if (categoryId) {
                    response = await apiRequest(`/api/categories/${categoryId}`, 'PUT', data);
                    document.getElementById('add-update-category-btn').textContent = 'Add Category';
                } else {
                    response = await apiRequest('/api/categories', 'POST', data);
                }
                showMessage(response.message, 'success');
                categoryForm.reset();
                document.getElementById('category-id').value = '';
                loadCategories();
                loadDashboardSummary();
            } catch (error) {
                // Error handled by apiRequest
            }
        });

        document.getElementById('clear-category-form-btn').addEventListener('click', () => {
            categoryForm.reset();
            document.getElementById('category-id').value = '';
            document.getElementById('add-update-category-btn').textContent = 'Add Category';
        });

        // --- Product Management ---
        async function loadProducts() {
            try {
                const products = await apiRequest('/api/products', 'GET');
                productsTableBody.innerHTML = '';
                products.forEach(product => {
                    const row = productsTableBody.insertRow();
                    row.insertCell().textContent = product.id;
                    row.insertCell().textContent = product.name;
                    row.insertCell().textContent = product.description || 'N/A';
                    row.insertCell().textContent = formatPrice(product.price, product.currency_code);
                    row.insertCell().textContent = product.currency_code;
                    const stockCell = row.insertCell();
                    stockCell.textContent = product.stock;
                    row.insertCell().textContent = product.safe_stock;

                    if (product.safe_stock > 0 && product.stock < (product.safe_stock * 0.5)) {
                        stockCell.classList.add('low-stock');
                    }
                    row.insertCell().textContent = product.category_name || 'N/A';
                    row.insertCell().textContent = product.supplier_name || 'N/A';

                    const actionsCell = row.insertCell();
                    actionsCell.classList.add('action-buttons');
                    actionsCell.innerHTML = `
                        <button class="edit-btn" data-id="${product.id}"
                            data-name="${product.name}"
                            data-description="${product.description || ''}"
                            data-price="${product.price}"
                            data-currency-code="${product.currency_code}"
                            data-stock="${product.stock}"
                            data-safe-stock="${product.safe_stock}"
                            data-category-id="${product.category_id || ''}"
                            data-supplier-id="${product.supplier_id || ''}"><i class="fas fa-edit"></i> Edit</button>
                        <button class="delete-btn" data-id="${product.id}"><i class="fas fa-trash-alt"></i> Delete</button>
                    `;
                });
                attachProductEventListeners();
            } catch (error) {
                // Error handled by apiRequest
            }
        }

        async function populateProductDropdowns() {
            try {
                const categories = await apiRequest('/api/categories', 'GET');
                const suppliers = await apiRequest('/api/suppliers', 'GET');

                productCategorySelect.innerHTML = '<option value="">-- Select Category --</option>';
                categories.forEach(cat => {
                    const option = document.createElement('option');
                    option.value = cat.id;
                    option.textContent = cat.name;
                    productCategorySelect.appendChild(option);
                });

                productSupplierSelect.innerHTML = '<option value="">-- Select Supplier --</option>';
                suppliers.forEach(sup => {
                    const option = document.createElement('option');
                    option.value = sup.id;
                    option.textContent = sup.name;
                    productSupplierSelect.appendChild(option);
                });

            } catch (error) {
                // Error handled by apiRequest
            }
        }

        function populateCurrencyDropdown() {
            productCurrencySelect.innerHTML = '';
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = '-- Select Currency --';
            productCurrencySelect.appendChild(defaultOption);

            const sortedCurrencyCodes = Object.keys(currencies).sort((a, b) =>
                currencies[a].name.localeCompare(currencies[b].name)
            );

            sortedCurrencyCodes.forEach(code => {
                const option = document.createElement('option');
                option.value = code;
                option.textContent = `${code} - ${currencies[code].symbol} ${currencies[code].name}`;
                productCurrencySelect.appendChild(option);
            });
            productCurrencySelect.value = 'USD';
        }

        function attachProductEventListeners() {
            document.querySelectorAll('#products-table .edit-btn').forEach(button => {
                button.onclick = (e) => {
                    const { id, name, description, price, currencyCode, stock, safeStock, categoryId, supplierId } = e.currentTarget.dataset;
                    document.getElementById('product-id').value = id;
                    document.getElementById('product-name').value = name;
                    document.getElementById('product-description').value = description;
                    document.getElementById('product-price').value = price;
                    document.getElementById('product-currency').value = currencyCode;
                    document.getElementById('product-stock').value = stock;
                    document.getElementById('product-safe-stock').value = safeStock;
                    document.getElementById('product-category').value = categoryId;
                    document.getElementById('product-supplier').value = supplierId;
                    document.getElementById('add-update-product-btn').textContent = 'Update Product';
                };
            });

            document.querySelectorAll('#products-table .delete-btn').forEach(button => {
                button.onclick = async (e) => {
                    const productId = e.currentTarget.dataset.id;
                    if (confirm('Are you sure you want to delete this product?')) {
                        try {
                            const response = await apiRequest(`/api/products/${productId}`, 'DELETE');
                            showMessage(response.message, 'success');
                            loadProducts();
                            loadDashboardSummary();
                        } catch (error) {
                            // Error handled by apiRequest
                        }
                    }
                };
            });
        }

        productForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const productId = document.getElementById('product-id').value;
            const formData = new FormData(productForm);
            const data = Object.fromEntries(formData.entries());

            data.price = parseFloat(data.price);
            data.stock = parseInt(data.stock, 10);
            data.safe_stock = parseInt(data.safe_stock, 10);

            data.category_id = data.category_id === "" ? null : parseInt(data.category_id, 10);
            data.supplier_id = data.supplier_id === "" ? null : parseInt(data.supplier_id, 10);
            data.currency_code = data.currency_code || 'USD';

            try {
                let response;
                if (productId) {
                    response = await apiRequest(`/api/products/${productId}`, 'PUT', data);
                    document.getElementById('add-update-product-btn').textContent = 'Add Product';
                } else {
                    response = await apiRequest('/api/products', 'POST', data);
                }
                showMessage(response.message, 'success');
                productForm.reset();
                document.getElementById('product-id').value = '';
                populateCurrencyDropdown();
                loadProducts();
                loadDashboardSummary();
            } catch (error) {
                // Error handled by apiRequest
            }
        });

        document.getElementById('clear-product-form-btn').addEventListener('click', () => {
            productForm.reset();
            document.getElementById('product-id').value = '';
            document.getElementById('add-update-product-btn').textContent = 'Add Product';
            populateCurrencyDropdown();
        });


        // --- Initial Load Logic ---
        // This is the initial setup. We start with the dashboard view.
        loadDashboardSummary();
        showSection('dashboard');
    }
});
