document.addEventListener('DOMContentLoaded', () => {
    const testButton = document.getElementById('testButton');
    const statusDiv = document.getElementById('status');

    testButton.addEventListener('click', async () => {
        // Show loading state
        showStatus('Conectando con el backend...', 'info');
        testButton.disabled = true;

        try {
            // Try to fetch from backend API
            const response = await fetch('http://localhost:8000/api/health', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                showStatus('✅ Conexión exitosa con el backend!', 'success');
            } else {
                showStatus('⚠️ Backend respondió con error', 'error');
            }
        } catch (error) {
            showStatus('ℹ️ Backend aún no disponible (esperado en setup inicial)', 'info');
            console.log('Error (esperado):', error.message);
        } finally {
            testButton.disabled = false;
        }
    });

    function showStatus(message, type) {
        statusDiv.textContent = message;
        statusDiv.className = `status visible ${type}`;
    }

    // Show welcome message
    setTimeout(() => {
        showStatus('👋 Frontend listo! Presiona el botón para probar.', 'info');
    }, 500);
});
