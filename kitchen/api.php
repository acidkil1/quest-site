<?php
/**
 * Наша кухня — API
 * Токен-авторизация (без cookie-сессий, работает везде).
 * Данные хранятся в JSON-файле.
 */

error_reporting(E_ALL & ~E_DEPRECATED & ~E_NOTICE & ~E_WARNING);
ini_set('display_errors', '0');

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store, no-cache, must-revalidate');

$DATA_FILE   = __DIR__ . '/kitchen_data.json';
$TOKENS_FILE = __DIR__ . '/kitchen_tokens.json';

// Пароли — только на сервере, в клиентский код не попадают
$PASSWORDS = [
  'elya'  => 'glasha',
  'sanya' => 'glafira',
];

/* ---------- Чтение / запись данных ---------- */

function defaultData() {
  return [
    'customDishes'   => [],
    'editedDishes'   => new stdClass(),
    'deletedDishIds' => [],
    'dishNotes'      => new stdClass(),
    'userData' => [
      'elya'  => ['favorites' => [], 'ratings' => new stdClass(), 'reviews' => new stdClass()],
      'sanya' => ['favorites' => [], 'ratings' => new stdClass(), 'reviews' => new stdClass()],
    ],
  ];
}

function loadData($file) {
  if (!file_exists($file)) {
    $data = defaultData();
    @file_put_contents($file, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT), LOCK_EX);
    return $data;
  }
  $raw = @file_get_contents($file);
  $data = json_decode($raw, true);
  if (!is_array($data)) return defaultData();

  // Гарантируем наличие всех ключей
  if (!isset($data['customDishes']))   $data['customDishes'] = [];
  if (!isset($data['editedDishes']))   $data['editedDishes'] = new stdClass();
  if (!isset($data['deletedDishIds'])) $data['deletedDishIds'] = [];
  if (!isset($data['dishNotes']))      $data['dishNotes'] = new stdClass();
  if (!isset($data['userData']))       $data['userData'] = [];
  foreach (['elya', 'sanya'] as $u) {
    if (!isset($data['userData'][$u])) {
      $data['userData'][$u] = ['favorites' => [], 'ratings' => new stdClass(), 'reviews' => new stdClass()];
    }
  }
  return $data;
}

function saveDataToFile($file, $data) {
  $json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
  if ($json === false) return false;
  $tmp = $file . '.tmp';
  if (@file_put_contents($tmp, $json, LOCK_EX) === false) return false;
  @chmod($tmp, 0644);
  return @rename($tmp, $file); // атомарная замена
}

/* ---------- Токены ---------- */

function loadTokens($file) {
  if (!file_exists($file)) return [];
  $raw = @file_get_contents($file);
  $t = json_decode($raw, true);
  return is_array($t) ? $t : [];
}

function saveTokens($file, $tokens) {
  $json = json_encode($tokens, JSON_UNESCAPED_UNICODE);
  if ($json === false) return false;
  $tmp = $file . '.tmp';
  if (@file_put_contents($tmp, $json, LOCK_EX) === false) return false;
  @chmod($tmp, 0644);
  return @rename($tmp, $file);
}

// Токен приходит в заголовке X-Auth-Token (или в GET-параметре auth для диагностики)
function getToken() {
  // 1. Заголовок
  if (function_exists('getallheaders')) {
    foreach (getallheaders() as $k => $v) {
      if (strtolower($k) === 'x-auth-token') return trim($v);
    }
  }
  // 1b. Запасной вариант чтения заголовка (для nginx и т.п.)
  if (isset($_SERVER['HTTP_X_AUTH_TOKEN'])) return trim($_SERVER['HTTP_X_AUTH_TOKEN']);
  // 2. GET-параметр
  if (isset($_GET['auth'])) return trim($_GET['auth']);
  return null;
}

function currentUser() {
  global $TOKENS_FILE;
  $token = getToken();
  if (!$token) return 'guest';
  $tokens = loadTokens($TOKENS_FILE);
  if (isset($tokens[$token]) && in_array($tokens[$token], ['elya', 'sanya'], true)) {
    return $tokens[$token];
  }
  return 'guest';
}

function isLoggedIn() {
  return currentUser() !== 'guest';
}

function generateToken() {
  return bin2hex(random_bytes(24));
}

/* ---------- Ответы ---------- */

function respond($data, $code = 200) {
  http_response_code($code);
  echo json_encode($data, JSON_UNESCAPED_UNICODE);
  exit;
}

/* ---------- Роутинг ---------- */

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// Читаем JSON-тело для POST
$body = null;
if ($method === 'POST') {
  $raw = file_get_contents('php://input');
  $body = json_decode($raw, true);
}

switch ($action) {

  case 'ping':
    respond(['ok' => true, 'php' => PHP_VERSION, 'time' => date('c')]);
    break;

  case 'login':
    $user = $body['user'] ?? '';
    $pass = $body['password'] ?? '';
    if (isset($PASSWORDS[$user]) && hash_equals($PASSWORDS[$user], $pass)) {
      $tokens = loadTokens($TOKENS_FILE);
      $token = generateToken();
      $tokens[$token] = $user;
      if (!saveTokens($TOKENS_FILE, $tokens)) {
        respond(['ok' => false, 'error' => 'write_failed',
                 'message' => 'Не удалось записать файл токенов. Проверьте права на папку kitchen/ (нужна запись, напр. 775 или 755).'],
                500);
      }
      respond(['ok' => true, 'user' => $user, 'token' => $token]);
    }
    respond(['ok' => false], 401);
    break;

  case 'logout':
    $token = getToken();
    if ($token) {
      $tokens = loadTokens($TOKENS_FILE);
      unset($tokens[$token]);
      saveTokens($TOKENS_FILE, $tokens);
    }
    respond(['ok' => true]);
    break;

  case 'init':
  case 'poll':
    $data = loadData($DATA_FILE);
    respond([
      'data'    => $data,
      'session' => ['user' => currentUser()],
    ]);
    break;

  case 'save':
    if (!isLoggedIn()) {
      respond(['ok' => false, 'error' => 'not_authorized'], 403);
    }
    if (!is_array($body) || !isset($body['data'])) {
      respond(['ok' => false, 'error' => 'no_data'], 400);
    }
    // Сохраняем только разрешённые ключи
    $newData = $body['data'];
    $clean = defaultData();
    if (isset($newData['customDishes']) && is_array($newData['customDishes']))
      $clean['customDishes'] = $newData['customDishes'];
    if (isset($newData['editedDishes']))
      $clean['editedDishes'] = $newData['editedDishes'];
    if (isset($newData['deletedDishIds']) && is_array($newData['deletedDishIds']))
      $clean['deletedDishIds'] = $newData['deletedDishIds'];
    if (isset($newData['dishNotes']))
      $clean['dishNotes'] = $newData['dishNotes'];
    if (isset($newData['userData']) && is_array($newData['userData'])) {
      foreach (['elya', 'sanya'] as $u) {
        if (isset($newData['userData'][$u])) {
          $clean['userData'][$u] = $newData['userData'][$u];
        }
      }
    }
    saveDataToFile($DATA_FILE, $clean)
      ? respond(['ok' => true])
      : respond(['ok' => false, 'error' => 'write_failed',
                 'message' => 'Не удалось записать файл данных. Проверьте права на папку kitchen/.'], 500);
    break;

  default:
    respond(['error' => 'unknown_action'], 404);
    break;
}
