<?php
$conexion = new mysqli("localhost", "root", "", "dbalumnos");

if ($conexion->connect_error) {
    die("Error de conexión: " . $conexion->connect_error);
}

$sql = "SELECT * FROM alumnos";
$resultado = $conexion->query($sql);
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Alumnos</title>
    <style>
        table {
            border-collapse: collapse;
            width: 80%;
            margin: 20px auto;
            font-family: Arial, sans-serif;
        }
        th, td {
            border: 1px solid #dddddd;
            text-align: left;
            padding: 8px;
        }
        th {
            background-color: #f2f2f2;
        }
        h2 {
            text-align: center;
            font-family: Arial, sans-serif;
        }
    </style>
</head>
<body>

<h2>Lista de alumnos</h2>

<?php
    if ($resultado && $resultado->num_rows > 0) {
        echo "<table>";
        // Obtener los nombres de las columnas dinámicamente
        $campos = $resultado->fetch_fields();
        echo "<tr>";
        foreach ($campos as $campo) {
            echo "<th>" . htmlspecialchars(ucfirst($campo->name)) . "</th>";
        }
        echo "</tr>";

        // Imprimir los datos de cada fila
        while($fila = $resultado->fetch_assoc()) {
            echo "<tr>";
            foreach ($fila as $valor) {
                echo "<td>" . htmlspecialchars((string)$valor) . "</td>";
            }
            echo "</tr>";
        }
        echo "</table>";
    } else {
        echo "<p style='text-align: center;'>No se encontraron resultados en la tabla alumnos.</p>";
    }
    $conexion->close();
?>

</body>
</html>