<?php
include('includes/init.inc.php');
include('includes/config.inc.php');
include('includes/head.inc.php');

// Connect to DB
$dbOk = false;
@$db = new mysqli($GLOBALS['DB_HOST'], $GLOBALS['DB_USERNAME'], $GLOBALS['DB_PASSWORD'], $GLOBALS['DB_NAME']);

if ($db->connect_error) {
   echo '<div class="messages">Could not connect to the database. Error: ';
   echo $db->connect_errno . ' - ' . $db->connect_error . '</div>';
} else {
   $dbOk = true;
}

// Validate ID
if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
  die("<h3>Invalid student ID.</h3>");
}

$studentId = intval($_GET['id']);

// Fetch student
$query = "SELECT * FROM students WHERE studentid = ?";
$stmt = $db->prepare($query);
$stmt->bind_param("i", $studentId);
$stmt->execute();
$result = $stmt->get_result();
$student = $result->fetch_assoc();

if (!$student) {
  die("<h3>Student not found.</h3>");
}
?>

<header class="main-header">
  <div class="logo-area">
    <div class="logo-box"></div>
    <span class="site-title">ClassCompass</span>
  </div>

  <nav class="main-nav">
    <a href="index.html">Dashboard</a>
    <a href="analytics.html">Analytics &amp; Insights</a>
    <a href="my-profile.html">My Profile</a>
    <a href="feedback-forum.html">Feedback Forum</a>
    <a href="settings.html">Settings</a>
  </nav>

  <div class="header-right">
      <input type="search" class="search-input" placeholder="search" />
      <span class="user-email">username@gmail.com</span>
      <button class="logout-btn">Logout</button>
    </div>
</header>

<main class="page-content">
  <div class="container">
    <h1>Student Profile</h1>

    <div class="profile-card">
      <h2><?= htmlspecialchars($student['first_names']) . ' ' . htmlspecialchars($student['last_name']) ?></h2>

      <p><strong>Student ID Number:</strong> <?= htmlspecialchars($student['studentid']) ?></p>
      <p><strong>Grade:</strong> <?= htmlspecialchars($student['grade']) ?></p>
      <p><strong>Status:</strong> <?= htmlspecialchars($student['status']) ?></p>

      <a href="landing_pages/class-overview.html" class="back-btn">← Back to Class Overview</a>
    </div>
  </div>
</main>

<footer class="page-footer">
  <a href="#">The Friday Institute</a>
  <span> • </span>
  <a href="#">Privacy &amp; Terms</a>
</footer>

<?php include('includes/foot.inc.php');
?>