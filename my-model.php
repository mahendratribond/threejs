<?php
require_once 'connection.php';

// Check if an 'id' parameter is present in the URL
if (isset($_GET['id'])) {
    $id = $_GET['id'];

    // Prepare the DELETE SQL statement
    $sql = "DELETE FROM threejs_models WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id);

    // Execute the query and check if it was successful
    if ($stmt->execute()) {
        // Redirect to the list page after successful deletion
        header("Location: my-model.php"); // Replace 'list.php' with your actual list page file name
        exit();
    } else {
        echo "Error: Could not delete the record.";
    }

    // Close statement
    $stmt->close();
} 

// Fetch data from the database
$sql = "SELECT * FROM threejs_models"; // Change 'your_table' to your actual table name
$result = $conn->query($sql);



?>

<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Data List</title>
  <link href="assets/plugins/bootstrap/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="assets/plugins/fontawesome/css/all.min.css">
  <link href="assets/plugins/cropperjs/cropper.min.css" rel="stylesheet">
  <link href="style.css" rel="stylesheet">

</head>

<body class="">
  <div class="container mt-5">
    <h2>Data List</h2>
    <table class="table table-bordered">
      <thead>
        <tr>
          <th>#</th>
          <th>Name</th> 
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
            <?php if ($result->num_rows > 0): ?>
                <?php $index = 1; ?>
                <?php while ($row = $result->fetch_assoc()): ?>
                    <tr>
                        <td><?php echo $index++; ?></td>
                        <td><?php echo htmlspecialchars($row['name']); ?></td> <!-- Change 'column1' to your actual column names -->
                        <td>
                            <a href="test5.html?id=<?php echo $row['id']; ?>" class="btn btn-primary btn-sm">View</a> <!-- Change 'id' to your primary key -->
                            <a href="my-model.php?id=<?php echo $row['id']; ?>" class="btn btn-danger btn-sm">Delete</a>
                        </td>
                    </tr>
                <?php endwhile; ?>
            <?php else: ?>
                <tr>
                    <td colspan="5" class="text-center">No records found.</td>
                </tr>
            <?php endif; ?>
        </tbody>
    </table>
  </div>
  <script src="assets/plugins/bootstrap/js/bootstrap.min.js" defer></script>
</body>

</html>