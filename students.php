<?php
include('includes/init.inc.php'); // include the DOCTYPE and opening tags
include('includes/config.inc.php'); // database configuration
?>
<title>ClassCompass - Students Table</title>

<?php
include('includes/head.inc.php');
?>

<?php
$dbOk = false;

/* Create a new database connection object, passing in the host, username,
     password, and database to use. The "@" suppresses errors. */
@$db = new mysqli($GLOBALS['DB_HOST'], $GLOBALS['DB_USERNAME'], $GLOBALS['DB_PASSWORD'], $GLOBALS['DB_NAME']);

if ($db->connect_error) {
   echo '<div class="messages">Could not connect to the database. Error: ';
   echo $db->connect_errno . ' - ' . $db->connect_error . '</div>';
} else {
   $dbOk = true;
}

$havePost = isset($_POST["save"]);

// Let's do some basic validation
$errors = '';
if ($havePost) {

   $firstNames = htmlspecialchars(trim($_POST["firstNames"]));
   $lastName = htmlspecialchars(trim($_POST["lastName"]));
   $grade = htmlspecialchars(trim($_POST["grade"]));
   $status = htmlspecialchars(trim($_POST["status"]));

   $focusId = ''; // trap the first field that needs updating, better would be to save errors in an array

   if ($firstNames == '') {
      $errors .= '<li>First name may not be blank</li>';
      if ($focusId == '') $focusId = '#firstNames';
   }
   if ($lastName == '') {
      $errors .= '<li>Last name may not be blank</li>';
      if ($focusId == '') $focusId = '#lastName';
   }
   if ($grade == '') {
      $errors .= '<li>Grade may not be blank</li>';
      if ($focusId == '') $focusId = '#grade';
   }
   if ($status == '') {
      $errors .= '<li>Status may not be blank</li>';
      if ($focusId == '') $focusId = '#status';
   }

   if ($errors != '') {
      echo '<div class="messages"><h4>Please correct the following errors:</h4><ul>';
      echo $errors;
      echo '</ul></div>';
      echo '<script type="text/javascript">';
      echo '  $(document).ready(function() {';
      echo '    $("' . $focusId . '").focus();';
      echo '  });';
      echo '</script>';
   } else {
      if ($dbOk) {
         
         $firstNamesForDb = trim($_POST["firstNames"]);
         $lastNameForDb = trim($_POST["lastName"]);
         $gradeForDb = trim($_POST["grade"]);
         $statusForDb = trim($_POST["status"]);

         // Setup a prepared statement. Alternately, we could write an insert statement - but
         // *only* if we escape our data using addslashes() or (better) mysqli_real_escape_string().
         $insQuery = "insert into students (`last_name`,`first_names`,`grade`, `status`) values(?,?,?,?)";
         $statement = $db->prepare($insQuery);
         $statement->bind_param("ssss", $lastNameForDb, $firstNamesForDb, $gradeForDb, $statusForDb);
         $statement->execute();

         echo '<div class="messages"><h4>Success: ' . $statement->affected_rows . ' student added to database.</h4>';
         echo $firstNames . ' ' . $lastName . ', with grade ' . $grade . ' and status ' . $status . '</div>';

         $statement->close();
      }
   }
}
?>

<h3>Add Student</h3>
<form id="addForm" name="addForm" action="students.php" method="post" onsubmit="return validate(this);">
   <fieldset>
      <div class="formData">

         <label class="field" for="firstNames">First Name:</label>
         <div class="value"><input type="text" size="60" value="<?php if ($havePost && $errors != '') {
                                                                     echo $firstNames;
                                                                  } ?>" name="firstNames" id="firstNames" /></div>

         <label class="field" for="lastName">Last Name:</label>
         <div class="value"><input type="text" size="60" value="<?php if ($havePost && $errors != '') {
                                                                     echo $lastName;
                                                                  } ?>" name="lastName" id="lastName" /></div>

         <label class="field" for="grade">Grade:</label>
         <div class="value"><input type="text" size="10" maxlength="10" value="<?php if ($havePost && $errors != '') {
                                                                      echo $grade;
                                                                  } ?>" name="grade" id="grade" /> <em>as a %</em></div>

         <label class="field" for="status">Status:</label>
         <div class="value"><input type="text" size="20" maxlength="20" value="<?php if ($havePost && $errors != '') {
                                                                      echo $status;
                                                                  } ?>" name="status" id="status" /> <em>Good (80%+), Needs Attention (70% - 79%), or Struggling (0% - 69%)</em></div>

         <input type="submit" value="save" id="save" name="save" />
      </div>
   </fieldset>
</form>

<h3>Students</h3>
<table id="studentTable">
   <?php
   if ($dbOk) {

      $query = 'select * from students order by CAST(grade AS UNSIGNED) DESC';
      $result = $db->query($query);
      $numRecords = $result->num_rows;

      echo '<tr><th>Name:</th><th>Grade:</th><th>Status:</th><th>Action:</th><th></th></tr>';
      for ($i = 0; $i < $numRecords; $i++) {
         $record = $result->fetch_assoc();
         if ($i % 2 == 0) {
            echo "\n" . '<tr id="student-' . $record['studentid'] . '"><td>';
         } else {
            echo "\n" . '<tr class="odd" id="student-' . $record['studentid'] . '"><td>';
         }
         echo htmlspecialchars($record['last_name']) . ', ';
         echo htmlspecialchars($record['first_names']);
         echo '</td><td>';
         echo htmlspecialchars($record['grade']);
         echo '</td><td>';
         echo htmlspecialchars($record['status']);
         echo '</td><td>';

         echo '<a href="student-profile.php?id=' . $record['studentid'] . '" target="_parent">';
         echo '<button class="view-btn">View Profile</button>';
         echo '</a>';
         echo '</td></tr>';
      }

      $result->free();

      // Finally, let's close the database
      $db->close();
   }

   ?>
</table>

<?php include('includes/foot.inc.php');
?>