document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('subnetForm');
    const networkInput = document.getElementById('network_address');

    form.addEventListener('submit', function(event) {
        // Expresión regular para validar el formato CIDR (ej: 192.168.1.0/24)
        const cidrRegex = /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/;
        
        if (!cidrRegex.test(networkInput.value)) {
            // Si el formato es incorrecto, previene el envío del formulario
            event.preventDefault();
            alert('Por favor, ingrese una dirección de red en un formato CIDR válido (ejemplo: 192.168.1.0/24).');
            networkInput.focus();
        }
    });
});