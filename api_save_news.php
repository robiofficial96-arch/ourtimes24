<?php
/**
 * OURTIMES24 - REAL-TIME ARTICLE SYNC API
 * Automatically persists new articles from admin panel into news_data.json and news_data.js
 */

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$input = file_get_contents('php://input');
if (!$input) {
    echo json_encode(['status' => 'error', 'message' => 'No payload']);
    exit;
}

$newsItem = json_decode($input, true);
if (!$newsItem || empty($newsItem['id']) || empty($newsItem['title'])) {
    echo json_encode(['status' => 'error', 'message' => 'Invalid article data']);
    exit;
}

$jsonFile = __DIR__ . '/news_data.json';
$allNews = [];
if (file_exists($jsonFile)) {
    $existing = json_decode(file_get_contents($jsonFile), true);
    if (is_array($existing)) {
        $allNews = $existing;
    }
}

$foundIdx = -1;
foreach ($allNews as $i => $n) {
    if (isset($n['id']) && (string)$n['id'] === (string)$newsItem['id']) {
        $foundIdx = $i;
        break;
    }
}

if ($foundIdx >= 0) {
    $allNews[$foundIdx] = array_merge($allNews[$foundIdx], $newsItem);
} else {
    array_unshift($allNews, $newsItem);
}

@file_put_contents($jsonFile, json_encode($allNews, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

$jsFile = __DIR__ . '/news_data.js';
$jsContent = "window.RAW_NEWS_DATA = " . json_encode($allNews, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . ";\n";
@file_put_contents($jsFile, $jsContent);

echo json_encode(['status' => 'success', 'id' => $newsItem['id'], 'total' => count($allNews)]);
exit;