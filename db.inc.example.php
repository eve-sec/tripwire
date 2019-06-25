<?php

try {
    $mysql = new PDO(
        'mysql:host=localhost;dbname=tripwire_database;charset=utf8',
        'username',
        'password',
        Array(
            PDO::ATTR_PERSISTENT     => true
        )
    );
} catch (PDOException $error) {
    error_log($error->getMessage());
}
