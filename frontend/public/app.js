document.addEventListener('DOMContentLoaded', () => {
    // --- Configuración y Elementos DOM ---
    const API_BASE_URL = 'http://localhost:8000/api/v1';

    const loginModal = document.getElementById('loginModal');
    const loginForm = document.getElementById('loginForm');
    const closeModal = document.getElementById('closeModal');

    // Controles
    const showOrdersButton = document.getElementById('showOrdersButton');
    const showFormButton = document.getElementById('showFormButton');

    // Vistas
    const ordersListView = document.getElementById('orders-list-view');
    const orderDetailView = document.getElementById('order-detail-view');
    const createOrderView = document.getElementById('create-order-view');

    // Contenedores de contenido
    const ordersTableContainer = document.getElementById('orders-table-container');
    const orderDetailContent = document.getElementById('order-detail-content');
    const createOrderForm = document.getElementById('create-order-form');
    const formStatusDiv = document.getElementById('form-status');

    // --- Funciones de Navegación ---
    function navigateTo(viewId) {
        // Ocultar todas las vistas
        [ordersListView, orderDetailView, createOrderView].forEach(view => {
            view.style.display = 'none';
        });

        // Mostrar la vista solicitada
        document.getElementById(viewId).style.display = 'block';

        // Ajustar la visibilidad del botón 'Volver'
        if (viewId === 'orders-list-view') {
            showOrdersButton.style.display = 'none';
            showFormButton.style.display = 'block';
        } else {
            showOrdersButton.style.display = 'block';
            showFormButton.style.display = 'none';
        }
    }

    // --- Funciones de Utilidad ---
    function showStatus(divElement, message, type, isPermanent = false) {
        divElement.textContent = message;
        divElement.className = `status visible ${type}`;
        if (!isPermanent) {
            setTimeout(() => {
                divElement.classList.remove('visible');
            }, 5000);
        }
    }

    // --- Lógica de Listado de Pedidos (GET /orders) ---
    async function fetchOrders() {
        // Limpiar contenido y mostrar estado de carga
        ordersTableContainer.innerHTML = '<p class="status info visible">Cargando pedidos...</p>';

        try {
            const response = await fetch(`${API_BASE_URL}/orders`);
            const data = await response.json();

            if (response.ok && Array.isArray(data) && data.length > 0) {
                renderOrdersTable(data);
            } else if (response.ok && Array.isArray(data) && data.length === 0) {
                ordersTableContainer.innerHTML = '<p class="status info visible">No se encontraron pedidos. ¡Crea el primero!</p>';
            } else {
                ordersTableContainer.innerHTML = `<p class="status error visible">Error al cargar pedidos: ${response.status}</p>`;
            }

        } catch (error) {
            ordersTableContainer.innerHTML = '<p class="status error visible">Error de conexión con la API (revisa que el backend esté corriendo en :8000).</p>';
            console.error('Fetch Orders Error:', error);
        }
    }

    function renderOrdersTable(orders) {

        let tableHTML = `
            <table class="orders-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Cliente</th>
                        <th>Acción</th>
                    </tr>
                </thead>
                <tbody>
        `;

        orders.forEach(order => {
            tableHTML += `
                <tr>
                    <td>${order.id}</td>
                    <td>${order.customer_name}</td>
                    <td><button class="btn btn-detail" data-id="${order.id}">Ver Detalle</button></td>
                </tr>
            `;
        });

        tableHTML += `</tbody></table>`;
        ordersTableContainer.innerHTML = tableHTML;

        // Adjuntar eventos a los botones después de que el HTML está en el DOM
        ordersTableContainer.querySelectorAll('.btn-detail').forEach(button => {
            button.addEventListener('click', (e) => {
                const orderId = e.target.getAttribute('data-id');
                console.log(`Intentando ver detalle del pedido ID: ${orderId}`); // Línea de depuración
                fetchOrderDetail(orderId);
            });
        });
    }

    // --- Lógica de Detalle de Pedido (GET /orders/{id}) ---
    async function fetchOrderDetail(id) {
        navigateTo('order-detail-view');
        orderDetailContent.innerHTML = '<p class="status info visible">Cargando detalle del pedido...</p>';

        try {
            const response = await fetch(`${API_BASE_URL}/orders/${id}`);
            const order = await response.json();

            if (response.ok) {
                renderOrderDetail(order);
            } else {
                orderDetailContent.innerHTML = `<p class="status error visible">Error: Pedido #${id} no encontrado.</p>`;
            }
        } catch (error) {
            orderDetailContent.innerHTML = `<p class="status error visible">Error de conexión al obtener detalle.</p>`;
            console.error('Fetch Detail Error:', error);
        }
    }

    function renderOrderDetail(order) {
        let itemsHTML = order.items.map(item => `
            <li>${item.product_name} (${item.quantity} x $${parseFloat(item.price).toFixed(2)})</li>
        `).join('');

        orderDetailContent.innerHTML = `
            <div style="text-align: left;">
                <h3>ID: ${order.id}</h3>
                <p><strong>Cliente:</strong> ${order.customer_name} (${order.customer_email})</p>
                <p><strong>Estado:</strong> <span class="status info">${order.status}</span></p>
                <p><strong>Total:</strong> $${parseFloat(order.total).toFixed(2)}</p>
                
                <h4>Productos:</h4>
                <ul style="list-style: disc; margin-left: 20px;">
                    ${itemsHTML}
                </ul>

                <p style="margin-top: 20px; font-size: 0.8rem;">
                    Creado: ${new Date(order.created_at).toLocaleString()}
                </p>
            </div>
        `;
    }

    // --- Lógica de Creación de Pedido (POST /orders) ---
    function renderCreateOrderForm() {
        createOrderForm.innerHTML = `
            <div class="form-group">
                <label for="customer_name">Nombre del Cliente</label>
                <input type="text" id="customer_name" name="customer_name" value="Cliente de Prueba" required>
            </div>
            <div class="form-group">
                <label for="customer_email">Email del Cliente</label>
                <input type="email" id="customer_email" name="customer_email" value="test@example.com" required>
            </div>
            <div id="items-container">
                <h4 style="margin-bottom: 15px;">Productos (Mínimo 1)</h4>
                <div class="item-group" style="border: 1px solid #ddd; padding: 15px; border-radius: 8px; margin-bottom: 15px; background-color: #f9f9f9;">
                    <div class="form-group">
                        <label>Producto</label>
                    <input type="text" name="product_name" value="Producto A" required>
                    </div>
                    <div class="form-group" style="display: flex; gap: 20px;">
                        <div style="flex: 1;">
                            <label>Cantidad</label>
                            <input type="number" name="quantity" min="1" value="2" required>
                        </div>
                        <div style="flex: 1;">
                            <label>Precio Unitario</label>
                            <input type="number" name="price" step="0.01" min="0.01" value="50.00" required>
                        </div>
                    </div>
                </div>
            </div>
            <button type="button" id="addItemButton" class="btn" style="width: 100%; margin-bottom: 20px;">+ Agregar otro producto</button>
            <button type="submit" class="btn" style="width: 100%;">Enviar Pedido</button>
            <div id="auth-section" style="margin-top: 15px; text-align: center;">
                <button type="button" id="authBtn" class="btn secondary" style="width: 100%;">🔑 Iniciar Sesión</button>
                <p id="auth-error-message" class="status error" style="display: none; margin-top: 10px;"></p>
            </div>`;

        document.getElementById('addItemButton').addEventListener('click', addItemField);
        createOrderForm.onsubmit = handleFormSubmit;
        setupAuthButton(); // Configura el botón de login apenas se crea el form
    }

    let itemCounter = 1;
    function addItemField() {
        itemCounter++;
        const itemHtml = `
            <div class="item-group" style="border: 1px dashed #ccc; padding: 15px; border-radius: 8px; margin-bottom: 15px;background-color: #f9f9f9;">
                <div class="form-group">
                    <label>Producto</label>
                    <input type="text" name="product_name" value="Producto ${itemCounter}" required>
                </div>
                <div class="form-group" style="display: flex; gap: 20px;">
                    <div style="flex: 1;">
                        <label>Cantidad</label>
                        <input type="number" name="quantity" min="1" value="1" required>
                    </div>
                    <div style="flex: 1;">
                        <label>Precio Unitario</label>
                        <input type="number" name="price" step="0.01" min="0.01" value="10.00" required>
                    </div>
                </div>
            </div>
        `;
        document.getElementById('items-container').insertAdjacentHTML('beforeend', itemHtml);
    }

    async function handleFormSubmit(e) {
        if (e) e.preventDefault();
        const token = localStorage.getItem('auth_token');
        const authError = document.getElementById('auth-error-message');
        showStatus(formStatusDiv, 'Enviando...', 'info');

        const formData = new FormData(createOrderForm);
        const requestBody = {
            customer_name: formData.get('customer_name'),
            customer_email: formData.get('customer_email'),
            items: [],
            total: 0.00
        };

        const itemGroups = document.querySelectorAll('#items-container .item-group');
        let calculatedTotal = 0;

        itemGroups.forEach(group => {
            const name = group.querySelector('[name="product_name"]').value;
            const quantity = parseInt(group.querySelector('[name="quantity"]').value);
            const price = parseFloat(group.querySelector('[name="price"]').value);

            calculatedTotal += quantity * price;

            requestBody.items.push({
                product_name: name,
                quantity: quantity,
                price: price.toFixed(2)
            });
        });

        requestBody.total = calculatedTotal.toFixed(2);


        try {
            const headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const response = await fetch(`${API_BASE_URL}/orders`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(requestBody)
            });

            if (response.status === 401 || response.status === 403) {
                authError.textContent = '⚠️ Inicia sesión para enviar pedidos.';
                authError.classList.add('visible');
                authError.style.display = 'block';
                showStatus(formStatusDiv, 'Error: Se requiere autenticación', 'error');
            } else if (response.ok) {
                showStatus(formStatusDiv, '✅ ¡Pedido creado con éxito!', 'success');
                setTimeout(() => { fetchOrders(); navigateTo('orders-list-view'); }, 1500);
            }
        } catch (error) { console.error(error); }
    }

    // --- Autenticación ---
    function updateAuthUI() {
        const authBtn = document.getElementById('authBtn');
        const authError = document.getElementById('auth-error-message');
        const token = localStorage.getItem('auth_token');
        if (!authBtn) return;

        if (token) {
            authBtn.textContent = '🚪 Cerrar Sesión';
            authBtn.style.backgroundColor = '#dc3545';
            if (authError) {
                authError.classList.remove('visible');
                authError.style.display = 'none';
            }
        } else {
            authBtn.textContent = '🔑 Iniciar Sesión';
            authBtn.style.backgroundColor = '#6c757d';
        }
    }

    function setupAuthButton() {
        const authBtn = document.getElementById('authBtn');
        if (!authBtn) return;
        updateAuthUI();
        authBtn.onclick = () => {
            if (localStorage.getItem('auth_token')) {
                localStorage.removeItem('auth_token');
                updateAuthUI();
                showStatus(formStatusDiv, 'Sesión cerrada', 'info');
            } else {
                loginModal.classList.add('visible');
            }
        };
    }

    loginForm.onsubmit = async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        try {
            const response = await fetch('http://localhost:8000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('auth_token', data.access_token);
                loginModal.classList.remove('visible');
                updateAuthUI();
                handleFormSubmit(); // Intenta enviar el pedido automáticamente tras login
            } else {
                alert('Error: ' + data.message);
            }
        } catch (error) { console.error(error); }
    };

    closeModal.onclick = () => loginModal.classList.remove('visible');

    // --- Inicialización ---
    showOrdersButton.onclick = () => { fetchOrders(); navigateTo('orders-list-view'); };
    showFormButton.onclick = () => { navigateTo('create-order-view'); renderCreateOrderForm(); };

    fetchOrders();
    navigateTo('orders-list-view');
});