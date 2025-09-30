<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Calculadora de Subredes</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <h1>Calculadora de Subredes</h1>
        <form id="subnetForm" action="index.php" method="post">
            <div class="form-group">
                <label for="network_address">Dirección de Red (ej: 192.168.1.0/24):</label>
                <input type="text" id="network_address" name="network_address" required pattern="\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\/\d{1,2}" title="Ingrese una dirección de red en formato CIDR, ej: 192.168.1.0/24">
            </div>
            <div class="form-group">
                <label for="num_subnets">Número de Subredes a generar:</label>
                <input type="number" id="num_subnets" name="num_subnets" min="2" required>
            </div>
            <button type="submit">Calcular</button>
        </form>

        <?php
        if ($_SERVER["REQUEST_METHOD"] == "POST") {
            // Recibir y validar los datos de entrada
            $network_str = trim($_POST['network_address']);
            $num_subnets = intval($_POST['num_subnets']);

            if (!empty($network_str) && $num_subnets > 1) {
                // Separar la dirección IP y la máscara CIDR original
                list($ip, $cidr) = explode('/', $network_str);

                // Calcular el número de bits necesarios para las nuevas subredes
                $bits_needed = ceil(log($num_subnets) / log(2));

                // Calcular la nueva máscara de subred
                $new_cidr = $cidr + $bits_needed;

                if ($new_cidr > 32) {
                    echo "<div class='error'>No es posible crear $num_subnets subredes con la dirección de red proporcionada. Se excede el límite de direcciones.</div>";
                } else {
                    $new_mask = long2ip( (2**32 - 1) << (32 - $new_cidr) );
                    $ip_long = ip2long($ip);
                    
                    // Asegurarse de que estamos trabajando con la dirección de red inicial
                    $network_long_start = $ip_long & ( (2**32 - 1) << (32 - $cidr) );

                    echo "<h2>Resultados del Subneteo:</h2>";
                    echo "<table>";
                    echo "<thead>";
                    echo "<tr>";
                    echo "<th># Subred</th>";
                    echo "<th>Dirección de Red</th>";
                    echo "<th>Rango de Hosts</th>";
                    echo "<th>Dirección de Broadcast</th>";
                    echo "<th>Máscara de Subred</th>";
                    echo "</tr>";
                    echo "</thead>";
                    echo "<tbody>";

                    $subnet_size = 2**(32 - $new_cidr);
                    
                    for ($i = 0; $i < $num_subnets; $i++) {
                        $current_network_long = $network_long_start + ($i * $subnet_size);
                        $network_addr = long2ip($current_network_long);
                        $first_host = long2ip($current_network_long + 1);
                        $broadcast_addr_long = $current_network_long + $subnet_size - 1;
                        $broadcast_addr = long2ip($broadcast_addr_long);
                        $last_host = long2ip($broadcast_addr_long - 1);
                        
                        echo "<tr>";
                        echo "<td>" . ($i + 1) . "</td>";
                        echo "<td>$network_addr/$new_cidr</td>";
                        echo "<td>$first_host - $last_host</td>";
                        echo "<td>$broadcast_addr</td>";
                        echo "<td>$new_mask</td>";
                        echo "</tr>";
                    }

                    echo "</tbody>";
                    echo "</table>";
                }
            } else {
                echo "<div class='error'>Por favor, ingrese datos válidos.</div>";
            }
        }
        ?>
    </div>
    <script src="js/script.js"></script>
</body>
</html>