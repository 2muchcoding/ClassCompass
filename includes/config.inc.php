<?php

if ($_SERVER["HTTP_HOST"] == 'localhost' || $_SERVER["HTTP_HOST"] == 'localhost:8080') {
   $GLOBALS['HOSTNAME'] = 'localhost';
   $GLOBALS['DB_NAME']  = 'team11';
   $GLOBALS['DB_HOST']  = 'localhost';
   $GLOBALS['DB_USERNAME'] = 'root';
   $GLOBALS['DB_PASSWORD'] = 'root';
} else {
   $GLOBALS['HOSTNAME'] = 'localhost';
   $GLOBALS['DB_NAME']  = 'team11';
   $GLOBALS['DB_HOST']  = 'localhost';
   $GLOBALS['DB_USERNAME'] = 'phpmyadmin';
   $GLOBALS['DB_PASSWORD'] = 'ITL@bF0rVM$#24';
}