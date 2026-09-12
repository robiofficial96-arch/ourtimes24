<?php
/**
 * OURTIMES24 - DYNAMIC SOCIAL SHARING & OPEN GRAPH SSR ENGINE
 * Injects real news title, thumbnail image, excerpt & canonical URL
 * for Facebook Crawler (facebookexternalhit), WhatsApp, Twitterbot, LinkedIn
 */

error_reporting(0);
@ini_set('display_errors', '0');

$articleId = isset($_GET['id']) ? trim($_GET['id']) : '';
$protocol = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') ? 'https://' : 'https://';
$host = !empty($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : 'ourtimes24.com';
$baseUrl = rtrim($protocol . $host, '/');

$siteName = 'আওয়ার টাইমস২৪ | Ourtimes24';
$pageTitle = 'সংবাদ বিস্তারিত - আওয়ার টাইমস২৪';
$pageDesc = 'সত্য ও বস্তুনিষ্ঠ সংবাদের সার্বক্ষণিক ঠিকানা - আওয়ার টাইমস২৪। দেশ ও বিদেশের সর্বশেষ তাজা খবর।';
$pageImage = $baseUrl . '/logo.png';
$pageUrl = $baseUrl . '/article.html' . ($articleId ? '?id=' . urlencode($articleId) : '');
$publishDate = date('c');
$authorName = 'আওয়ার টাইমস২৪ ডেস্ক';
$category = 'জাতীয়';

$jsonPath = __DIR__ . '/news_data.json';
if (file_exists($jsonPath)) {
    $rawJson = @file_get_contents($jsonPath);
    if ($rawJson) {
        $articles = json_decode($rawJson, true);
        if (is_array($articles)) {
            $found = null;
            if ($articleId !== '') {
                foreach ($articles as $art) {
                    if (isset($art['id']) && (string)$art['id'] === (string)$articleId) {
                        $found = $art;
                        break;
                    }
                }
            }
            if (!$found && count($articles) > 0) {
                $found = $articles[0];
            }
            if ($found) {
                if (!empty($found['title'])) {
                    $pageTitle = htmlspecialchars(trim($found['title']), ENT_QUOTES, 'UTF-8');
                }
                $rawDesc = !empty($found['excerpt']) ? $found['excerpt'] : (!empty($found['content']) ? $found['content'] : '');
                $cleanDesc = trim(preg_replace('/\s+/', ' ', strip_tags($rawDesc)));
                if (mb_strlen($cleanDesc, 'UTF-8') > 175) {
                    $cleanDesc = mb_substr($cleanDesc, 0, 170, 'UTF-8') . '...';
                }
                if ($cleanDesc) {
                    $pageDesc = htmlspecialchars($cleanDesc, ENT_QUOTES, 'UTF-8');
                }
                if (!empty($found['image'])) {
                    $img = trim($found['image']);
                    if (strpos($img, 'http://') === 0 || strpos($img, 'https://') === 0) {
                        $pageImage = $img;
                    } else {
                        $pageImage = $baseUrl . '/' . ltrim($img, '/');
                    }
                }
                if (!empty($found['author'])) $authorName = htmlspecialchars($found['author'], ENT_QUOTES, 'UTF-8');
                if (!empty($found['category'])) $category = htmlspecialchars($found['category'], ENT_QUOTES, 'UTF-8');
                if (!empty($found['date'])) $publishDate = htmlspecialchars($found['date'], ENT_QUOTES, 'UTF-8');
                if (!empty($found['id'])) $pageUrl = $baseUrl . '/article.html?id=' . urlencode($found['id']);
            }
        }
    }
}

if (!empty($_GET['title'])) $pageTitle = htmlspecialchars(trim($_GET['title']), ENT_QUOTES, 'UTF-8');
if (!empty($_GET['img'])) {
    $paramImg = trim($_GET['img']);
    if (strpos($paramImg, 'http://') === 0 || strpos($paramImg, 'https://') === 0) {
        $pageImage = $paramImg;
    }
}

$htmlPath = __DIR__ . '/article.html';
if (!file_exists($htmlPath)) die('article.html template not found.');
$html = file_get_contents($htmlPath);

$metaTags = <<<HTML
    <!-- DYNAMIC SOCIAL SHARING METATAGS (SSR GENERATED) -->
    <title>{$pageTitle} - আওয়ার টাইমস২৪</title>
    <meta name="description" content="{$pageDesc}">
    <meta name="author" content="{$authorName}">

    <!-- OPEN GRAPH (FACEBOOK, WHATSAPP, LINKEDIN) -->
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="{$siteName}">
    <meta property="og:title" content="{$pageTitle}">
    <meta property="og:description" content="{$pageDesc}">
    <meta property="og:image" content="{$pageImage}">
    <meta property="og:image:secure_url" content="{$pageImage}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="{$pageTitle}">
    <meta property="og:url" content="{$pageUrl}">
    <meta property="article:published_time" content="{$publishDate}">
    <meta property="article:section" content="{$category}">
    <meta property="article:author" content="{$authorName}">

    <!-- TWITTER CARD (X / TWITTER) -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:site" content="@ourtimes24">
    <meta name="twitter:creator" content="@ourtimes24">
    <meta name="twitter:title" content="{$pageTitle}">
    <meta name="twitter:description" content="{$pageDesc}">
    <meta name="twitter:image" content="{$pageImage}">
HTML;

$html = preg_replace('/<title[^>]*>.*?<\/title>/is', '', $html);
$html = preg_replace('/<meta\s+property=["']og:[^"']*["'][^>]*>/is', '', $html);
$html = preg_replace('/<meta\s+name=["']twitter:[^"']*["'][^>]*>/is', '', $html);
$html = preg_replace('/<meta\s+name=["']description["'][^>]*>/is', '', $html);
$html = preg_replace('/<head>/i', "<head>\n" . $metaTags, $html, 1);

header('Content-Type: text/html; charset=UTF-8');
header('Cache-Control: public, max-age=300');
echo $html;
exit;