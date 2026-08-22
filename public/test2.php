<?php
$pdo = new PDO('sqlite:' . __DIR__ . '/../database/database.sqlite');
$stmt = $pdo->query('SELECT slug FROM categories');
print_r($stmt->fetchAll(PDO::FETCH_COLUMN));
