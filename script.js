document.getElementById('subnetForm').addEventListener('submit', function(event) {
    // Prevenir que el formulario se envíe de la forma tradicional
    event.preventDefault();

    const networkStr = document.getElementById('network_address').value;
    const numSubnets = parseInt(document.getElementById('num_subnets').value, 10);
    const resultsContainer = document.getElementById('results-container');
    
    // Limpiar resultados anteriores
    resultsContainer.innerHTML = '';

    // --- Funciones auxiliares para convertir IP ---
    const ipToLong = (ip) => {
        return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
    };

    const longToIp = (long) => {
        return [ (long >>> 24), (long >>> 16) & 255, (long >>> 8) & 255, long & 255 ].join('.');
    };
    
    // --- Comienzo de la lógica de cálculo ---
    const [ip, cidrStr] = networkStr.split('/');
    const originalCidr = parseInt(cidrStr, 10);
    
    if (isNaN(originalCidr) || numSubnets < 2) {
        resultsContainer.innerHTML = "<div class='error'>Por favor, ingrese datos válidos.</div>";
        return;
    }
    
    // Calcular bits necesarios para las subredes
    const bitsNeeded = Math.ceil(Math.log2(numSubnets));
    const newCidr = originalCidr + bitsNeeded;

    if (newCidr > 32) {
        resultsContainer.innerHTML = `<div class='error'>No es posible crear ${numSubnets} subredes con la dirección de red proporcionada. Se excede el límite de direcciones.</div>`;
        return;
    }

    // Calcular la nueva máscara de subred
    const newMaskLong = ( (2**32 - 1) << (32 - newCidr) ) >>> 0;
    const newMaskIp = longToIp(newMaskLong);
    
    const originalIpLong = ipToLong(ip);
    const originalMaskLong = ( (2**32 - 1) << (32 - originalCidr) ) >>> 0;
    
    // Asegurarse de que estamos trabajando con la dirección de red inicial
    const networkLongStart = originalIpLong & originalMaskLong;
    const subnetSize = 2**(32 - newCidr);

    // --- Crear la tabla de resultados dinámicamente ---
    let tableHTML = `
        <h2>Resultados del Subneteo:</h2>
        <table>
            <thead>
                <tr>
                    <th># Subred</th>
                    <th>Dirección de Red</th>
                    <th>Rango de Hosts</th>
                    <th>Dirección de Broadcast</th>
                    <th>Máscara de Subred</th>
                </tr>
            </thead>
            <tbody>
    `;

    for (let i = 0; i < numSubnets; i++) {
        const currentNetworkLong = networkLongStart + (i * subnetSize);
        const broadcastLong = currentNetworkLong + subnetSize - 1;
        
        const networkAddr = longToIp(currentNetworkLong);
        const firstHost = longToIp(currentNetworkLong + 1);
        const broadcastAddr = longToIp(broadcastLong);
        // El último host solo es válido si el tamaño de la subred es mayor a 2 (/31 o /32)
        const lastHost = (subnetSize > 2) ? longToIp(broadcastLong - 1) : "N/A";

        tableHTML += `
            <tr>
                <td>${i + 1}</td>
                <td>${networkAddr}/${newCidr}</td>
                <td>${(subnetSize > 2) ? firstHost + ' - ' + lastHost : 'N/A'}</td>
                <td>${broadcastAddr}</td>
                <td>${newMaskIp}</td>
            </tr>
        `;
    }
    
    tableHTML += `</tbody></table>`;
    resultsContainer.innerHTML = tableHTML;
});