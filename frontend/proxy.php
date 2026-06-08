<?php
$path = isset($_GET['path']) ? $_GET['path'] : '/';

$other_params = array_filter($_GET, fn($k) => $k !== 'path', ARRAY_FILTER_USE_KEY);
$query_string = !empty($other_params) ? '?' . http_build_query($other_params) : '';

$url = 'http://localhost:8080' . $path . $query_string;


$method = isset($_GET['_method']) ? strtoupper($_GET['_method']) : $_SERVER['REQUEST_METHOD'];
$body = file_get_contents('php://input');

$response_headers = [];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false);


curl_setopt($ch, CURLOPT_HEADERFUNCTION, function($ch, $header) use (&$response_headers) {
    $response_headers[] = trim($header);
    return strlen($header);
});

if (!empty($body)) {
    curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
}

$headers = [];
foreach (getallheaders() as $name => $value) {
    if (strtolower($name) !== 'host') {
        $headers[] = "$name: $value";
    }
}
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
curl_close($ch);

http_response_code($httpCode);

foreach ($response_headers as $header) {
    if (stripos($header, 'Location:') === 0 || stripos($header, 'Set-Cookie:') === 0) {
        header($header, false);
    }
}

if ($contentType) {
    header('Content-Type: ' . $contentType);
}
header('Access-Control-Allow-Origin: *');
echo $response;
