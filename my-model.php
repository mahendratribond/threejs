<?php
require_once 'connection.php';
// Start session
session_start();

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

// Handle deletion for selected models
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['selected_ids'])) {
    $selectedIds = $_POST['selected_ids'];
    if (!empty($selectedIds)) {
        $placeholders = implode(',', array_fill(0, count($selectedIds), '?'));
        $sql = "DELETE FROM threejs_models WHERE id IN ($placeholders)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param(str_repeat('i', count($selectedIds)), ...$selectedIds);

        if ($stmt->execute()) {
            // Redirect to refresh the page after deletion
            header("Location: my-model.php");
            exit();
        } else {
            echo "Error: Could not delete the selected records.";
        }
    }
}

// Fetch data from the database
$sql = "SELECT * FROM threejs_models WHERE user_id = ?"; // Change 'your_table' to your actual table name
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $_SESSION['user_id']);  
$stmt->execute();
$result = $stmt->get_result();



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
     <form method="POST" action="">
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
                              <a href="test6.html?id=<?php echo $row['id']; ?>" class="btn btn-primary btn-sm">View</a> <!-- Change 'id' to your primary key -->
                              <a href="my-model.php?id=<?php echo $row['id']; ?>" class="btn btn-danger btn-sm">Delete</a>
                          </td>
                          <td>
                              <input type="checkbox" name="selected_ids[]" value="<?php echo $row['id']; ?>">
                          </td>
                      </tr>
                  <?php endwhile; ?>
                  <tr>
                    <td colspan="4">
                      <button type="submit" style="float:right" class="btn btn-danger btn-sm">Delete Selected Model</button>
                    </td>
                  </tr>
              <?php else: ?>
                  <tr>
                      <td colspan="4" class="text-center">No records found.</td>
                  </tr>
              <?php endif; ?>
          </tbody>
      </table>
    </form>
  </div>
  <script src="assets/plugins/bootstrap/js/bootstrap.min.js" defer></script>
</body>

</html>