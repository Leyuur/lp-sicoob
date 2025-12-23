<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
$DB_HOST = 'localhost';
$DB_USER = 'u165205582_sicoob';
$DB_PASS = '!8!@8^;z5Rt';
$DB_NAME = 'u165205582_sicoob';

$conn = new mysqli($DB_HOST, $DB_USER, $DB_PASS, $DB_NAME);
if ($conn->connect_errno) {
	die('Erro ao conectar ao banco de dados: ' . $conn->connect_error);
}
$conn->set_charset('utf8mb4');