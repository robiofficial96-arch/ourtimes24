<?php
/**
 * OURTIMES24 - DYNAMIC SOCIAL SHARING & OPEN GRAPH SSR ENGINE
 * Injects real news title, thumbnail image, excerpt & canonical URL
 * for Facebook Crawler (facebookexternalhit), WhatsApp, Twitterbot, LinkedIn
 */

// Handle fatal errors or exceptions gracefully by serving article.html directly
try {
    $articleId = isset($_GET['id']) ? trim($_GET['id']) : '';
    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https://' : 'https://';
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

    $articles = [];
    $jsonPath = __DIR__ . '/news_data.json';
    if (file_exists($jsonPath)) {
        $rawJson = @file_get_contents($jsonPath);
        if ($rawJson) {
            $decoded = json_decode($rawJson, true);
            if (is_array($decoded)) {
                $articles = $decoded;
            }
        }
    }

    // Fallback to news_data.js if json file was empty or failed
    if (empty($articles)) {
        $jsPath = __DIR__ . '/news_data.js';
        if (file_exists($jsPath)) {
            $rawJs = @file_get_contents($jsPath);
            if ($rawJs && preg_match('/window\.RAW_NEWS_DATA\s*=\s*(\[.*?\])\s*;/s', $rawJs, $matches)) {
                $decodedJs = json_decode($matches[1], true);
                if (is_array($decodedJs)) {
                    $articles = $decodedJs;
                }
            }
        }
    }

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
        if (function_exists('mb_strlen') && function_exists('mb_substr')) {
            if (mb_strlen($cleanDesc, 'UTF-8') > 175) {
                $cleanDesc = mb_substr($cleanDesc, 0, 170, 'UTF-8') . '...';
            }
        } else {
            if (strlen($cleanDesc) > 175) {
                $cleanDesc = substr($cleanDesc, 0, 170) . '...';
            }
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

    if (!empty($_GET['title'])) $pageTitle = htmlspecialchars(trim($_GET['title']), ENT_QUOTES, 'UTF-8');
    if (!empty($_GET['img'])) {
        $paramImg = trim($_GET['img']);
        if (strpos($paramImg, 'http://') === 0 || strpos($paramImg, 'https://') === 0) {
            $pageImage = $paramImg;
        } else {
            $pageImage = $baseUrl . '/' . ltrim($paramImg, '/');
        }
    }

    $htmlPath = __DIR__ . '/article.html';
    $html = file_exists($htmlPath) ? file_get_contents($htmlPath) : '';

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

    if ($html) {
        // Safely remove existing default title and meta tags
        $html = preg_replace('~<title[^>]*>.*?</title>~is', '', $html);
        $html = preg_replace('~<meta\s+property=[\'"]og:[^\'"]*[\'"][^>]*>~is', '', $html);
        $html = preg_replace('~<meta\s+name=[\'"]twitter:[^\'"]*[\'"][^>]*>~is', '', $html);
        $html = preg_replace('~<meta\s+name=[\'"]description[\'"][^>]*>~is', '', $html);
        $html = preg_replace('~<head>~i', "<head>\n" . $metaTags, $html, 1);
    } else {
        $html = "<!DOCTYPE html><html lang=\"bn\"><head><meta charset=\"UTF-8\">\n" . $metaTags . "\n</head><body><h1>{$pageTitle}</h1><p>{$pageDesc}</p></body></html>";
    }

    header('Content-Type: text/html; charset=UTF-8');
    header('Cache-Control: public, max-age=300');
    echo $html;
    exit;

} catch (Throwable $e) {
    // Graceful fallback: serve static article.html directly without failing
    header('Content-Type: text/html; charset=UTF-8');
    if (file_exists(__DIR__ . '/article.html')) {
        readfile(__DIR__ . '/article.html');
    }
    exit;
}