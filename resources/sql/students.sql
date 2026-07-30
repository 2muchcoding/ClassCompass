-- Students Table
CREATE TABLE `students` (
  `studentid` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `first_names` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `grade` varchar(100) NOT NULL,
  `status` varchar(100) NOT NULL,
  PRIMARY KEY (`studentid`)
);

-- Inserting students into the table
INSERT INTO students(first_names, last_name, grade, status)
VALUES ("Emma", "Johnson", "85%", "Good"),
  ("Michael", "Smith", "92%", "Good"),
  ("Sarah", "Williams", "70%", "Needs Attention"),
  ("James", "Robinson", "88%", "Good"),
  ("David", "Brown", "65%", "Struggling"),
  ("Olivia", "Fitzgerald", "94%", "Good"),
  ("Daniel", "Jones", "68%", "Struggling"),
  ("Ashley", "Miller", "81%", "Good"),
  ("Matthew", "Anderson", "77%", "Needs Attention")
  ("Jennifer", "Kearney", "90%", "Good"),
  ("Andrew", "White", "74%", "Needs Attention"),
  ("Anoua", "Carrie", "90%", "Good");