<?php
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo 'Only POST requests are allowed.';
  exit;
}

$receiving_email_address = 'hamidrezarahimian15@gmail.com';

$name = trim($_POST['name'] ?? '');
$email = trim($_POST['email'] ?? '');
$subject = trim($_POST['subject'] ?? '');
$message = trim($_POST['message'] ?? '');

if ($name === '' || $email === '' || $subject === '' || $message === '') {
  http_response_code(400);
  echo 'Please fill in all fields.';
  exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  http_response_code(400);
  echo 'Please enter a valid email address.';
  exit;
}

$safe_subject = preg_replace('/[\r\n]+/', ' ', $subject);
$email_body = "New message from your website contact form:\n\n";
$email_body .= "Name: {$name}\n";
$email_body .= "Email: {$email}\n";
$email_body .= "Subject: {$safe_subject}\n\n";
$email_body .= "Message:\n{$message}\n";

$headers = [
  'From: Website Contact <no-reply@' . ($_SERVER['HTTP_HOST'] ?? 'localhost') . '>',
  'Reply-To: ' . $name . ' <' . $email . '>',
  'Content-Type: text/plain; charset=UTF-8'
];

if (mail($receiving_email_address, 'Website contact: ' . $safe_subject, $email_body, implode("\r\n", $headers))) {
  echo 'OK';
} else {
  http_response_code(500);
  echo 'The message could not be sent. Please try again later.';
}
?>
