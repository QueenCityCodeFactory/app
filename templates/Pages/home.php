<?php
/**
 * Application Health Check & Welcome Page
 *
 * This page is only displayed in debug mode. It provides system health
 * checks and quick links for developers. Replace this with your own
 * landing page for production use.
 *
 * @var \App\View\AppView $this
 */
use Cake\Cache\Cache;
use Cake\Core\Configure;
use Cake\Core\Plugin;
use Cake\Datasource\ConnectionManager;
use Cake\Error\Debugger;
use Cake\Http\Exception\NotFoundException;

if (!Configure::read('debug')) :
    throw new NotFoundException(
        'Please replace templates/Pages/home.php with your own version or re-enable debug mode.'
    );
endif;

$this->disableAutoLayout();

$checkConnection = function (string $name): array {
    $error = null;
    $connected = false;
    try {
        ConnectionManager::get($name)->getDriver()->connect();
        $connected = true;
    } catch (\Exception $connectionError) {
        $error = $connectionError->getMessage();
        if (method_exists($connectionError, 'getAttributes')) {
            $attributes = $connectionError->getAttributes();
            if (isset($attributes['message'])) {
                $error .= '<br />' . $attributes['message'];
            }
        }
        if ($name === 'debug_kit') {
            $error = 'Try adding your current <b>top level domain</b> to the '
                . '<a href="https://book.cakephp.org/debugkit/5/en/index.html#configuration" target="_blank">DebugKit.safeTld</a> '
                . 'config and reload.';
            if (!in_array('sqlite', \PDO::getAvailableDrivers())) {
                $error .= '<br />Install the PHP extension <code>pdo_sqlite</code> so DebugKit can work properly.';
            }
        }
    }

    return compact('connected', 'error');
};

$statusIcon = function (bool $pass): string {
    return $pass
        ? '<i class="fa-solid fa-circle-check text-success me-2"></i>'
        : '<i class="fa-solid fa-circle-xmark text-danger me-2"></i>';
};

$requiredExtensions = ['mbstring', 'openssl', 'intl', 'pdo', 'curl', 'xml'];
$requiredPlugins = ['ButterCream', 'DebugKit'];
$dbResult = $checkConnection('default');
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <?= $this->Html->charset() ?>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title><?= h(Configure::read('App.title', 'ButterCream')) ?> &mdash; Health Check</title>
    <?= $this->Html->meta('icon') ?>
    <?php if (Configure::read('debug') === true) : ?>
        <?= $this->Html->css(['app.css?cb=' . Configure::read('CacheBuster.cssCB')]) ?>
    <?php else : ?>
        <?= $this->Html->css(['app.min.css?cb=' . Configure::read('CacheBuster.cssCB')]) ?>
    <?php endif; ?>
    <style>
        body { background: #f0f2f5; }
        .health-header { background: linear-gradient(135deg, #1a3a5c 0%, #2a5a8c 100%); color: #fff; padding: 2.5rem 0 2rem; }
        .health-header .tagline { font-size: .85rem; letter-spacing: .15em; text-transform: uppercase; opacity: .8; }
        .health-card { border: none; border-radius: .5rem; box-shadow: 0 1px 3px rgba(0,0,0,.08); }
        .check-item { padding: .5rem 0; border-bottom: 1px solid #f0f0f0; }
        .check-item:last-child { border-bottom: none; }
        .version-pills .badge { font-size: .8rem; font-weight: 500; }
    </style>
</head>
<body>
    <header class="health-header">
        <div class="container text-center">
            <a href="https://www.willettstech.com/" target="_blank" rel="noopener" class="text-decoration-none text-white">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60" width="64" height="64" class="mb-3">
                    <rect width="60" height="60" rx="12" fill="#fff"/>
                    <text x="30" y="42" font-family="Arial,Helvetica,sans-serif" font-size="36" font-weight="bold" fill="#1a3a5c" text-anchor="middle">W</text>
                </svg>
            </a>
            <h1 class="h3 fw-bold mb-1">Willetts Tech</h1>
            <p class="tagline mb-3">I.T. for Human Service</p>
            <div class="version-pills d-flex justify-content-center gap-2 flex-wrap">
                <span class="badge bg-light text-dark">CakePHP <?= h(Configure::version()) ?></span>
                <span class="badge bg-light text-dark">PHP <?= PHP_VERSION ?></span>
                <span class="badge bg-light text-dark"><?= h(Configure::read('App.environment', 'unknown')) ?></span>
            </div>
        </div>
    </header>

    <main class="container py-4">
        <div class="alert alert-info text-center small mb-4">
            <i class="fa-solid fa-eye-slash me-1"></i>
            This page is only visible in debug mode. Replace <code>templates/Pages/home.php</code> with your own landing page for production.
        </div>

        <?php Debugger::checkSecurityKeys(); ?>

        <div class="row g-4">
            <!-- Environment -->
            <div class="col-md-6">
                <div class="card health-card h-100">
                    <div class="card-header fw-semibold"><i class="fa-solid fa-server me-2"></i>Environment</div>
                    <div class="card-body">
                        <div class="check-item">
                            <?= $statusIcon(version_compare(PHP_VERSION, '8.4.0', '>=')) ?>
                            PHP &ge; 8.4.0
                            <span class="text-muted small">(<?= PHP_VERSION ?>)</span>
                        </div>
                        <?php foreach ($requiredExtensions as $ext) : ?>
                        <div class="check-item">
                            <?= $statusIcon(extension_loaded($ext)) ?>
                            ext-<?= h($ext) ?>
                        </div>
                        <?php endforeach; ?>
                        <div class="check-item">
                            <?= $statusIcon(ini_get('zend.assertions') === '1') ?>
                            zend.assertions = 1
                        </div>
                    </div>
                </div>
            </div>

            <!-- Filesystem -->
            <div class="col-md-6">
                <div class="card health-card h-100">
                    <div class="card-header fw-semibold"><i class="fa-solid fa-folder-open me-2"></i>Filesystem</div>
                    <div class="card-body">
                        <div class="check-item">
                            <?= $statusIcon(is_writable(TMP)) ?>
                            <code>tmp/</code> writable
                        </div>
                        <div class="check-item">
                            <?= $statusIcon(is_writable(LOGS)) ?>
                            <code>logs/</code> writable
                        </div>
                        <?php $cacheSettings = Cache::getConfig('_cake_translations_'); ?>
                        <div class="check-item">
                            <?= $statusIcon(!empty($cacheSettings)) ?>
                            Cache engine
                            <?php if (!empty($cacheSettings)) : ?>
                                <span class="text-muted small">(<?= h($cacheSettings['className']) ?>)</span>
                            <?php endif; ?>
                        </div>
                        <?php $memcachedSettings = Cache::getConfig('_cake_model_'); ?>
                        <div class="check-item">
                            <?= $statusIcon(extension_loaded('memcached')) ?>
                            Memcached extension
                        </div>
                    </div>
                </div>
            </div>

            <!-- Database -->
            <div class="col-md-6">
                <div class="card health-card h-100">
                    <div class="card-header fw-semibold"><i class="fa-solid fa-database me-2"></i>Database</div>
                    <div class="card-body">
                        <div class="check-item">
                            <?= $statusIcon($dbResult['connected']) ?>
                            Default connection
                            <?php if (!$dbResult['connected']) : ?>
                                <div class="text-danger small mt-1"><?= $dbResult['error'] ?></div>
                            <?php endif; ?>
                        </div>
                        <?php if (Plugin::isLoaded('DebugKit')) :
                            $dkResult = $checkConnection('debug_kit');
                        ?>
                        <div class="check-item">
                            <?= $statusIcon($dkResult['connected']) ?>
                            DebugKit connection
                            <?php if (!$dkResult['connected']) : ?>
                                <div class="text-danger small mt-1"><?= $dkResult['error'] ?></div>
                            <?php endif; ?>
                        </div>
                        <?php endif; ?>
                    </div>
                </div>
            </div>

            <!-- Plugins -->
            <div class="col-md-6">
                <div class="card health-card h-100">
                    <div class="card-header fw-semibold"><i class="fa-solid fa-puzzle-piece me-2"></i>Plugins</div>
                    <div class="card-body">
                        <?php foreach ($requiredPlugins as $plugin) : ?>
                        <div class="check-item">
                            <?= $statusIcon(Plugin::isLoaded($plugin)) ?>
                            <?= h($plugin) ?>
                        </div>
                        <?php endforeach; ?>
                    </div>
                </div>
            </div>
        </div>

        <hr class="my-4">

        <!-- Quick Links -->
        <div class="row g-4">
            <div class="col-md-4">
                <div class="card health-card h-100">
                    <div class="card-header fw-semibold"><i class="fa-solid fa-book me-2"></i>Documentation</div>
                    <div class="list-group list-group-flush">
                        <a href="https://book.cakephp.org/5/en/" target="_blank" rel="noopener" class="list-group-item list-group-item-action">CakePHP 5 Book</a>
                        <a href="https://api.cakephp.org/" target="_blank" rel="noopener" class="list-group-item list-group-item-action">CakePHP API Reference</a>
                        <a href="https://book.cakephp.org/5/en/tutorials-and-examples/cms/installation.html" target="_blank" rel="noopener" class="list-group-item list-group-item-action">CMS Tutorial</a>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card health-card h-100">
                    <div class="card-header fw-semibold"><i class="fa-solid fa-life-ring me-2"></i>Community</div>
                    <div class="list-group list-group-flush">
                        <a href="https://slack-invite.cakephp.org/" target="_blank" rel="noopener" class="list-group-item list-group-item-action">CakePHP Slack</a>
                        <a href="https://discourse.cakephp.org/" target="_blank" rel="noopener" class="list-group-item list-group-item-action">CakePHP Forum</a>
                        <a href="https://github.com/cakephp/cakephp/issues" target="_blank" rel="noopener" class="list-group-item list-group-item-action">Issue Tracker</a>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card health-card h-100">
                    <div class="card-header fw-semibold"><i class="fa-solid fa-toolbox me-2"></i>Resources</div>
                    <div class="list-group list-group-flush">
                        <a href="https://github.com/FriendsOfCake/awesome-cakephp" target="_blank" rel="noopener" class="list-group-item list-group-item-action">Awesome CakePHP</a>
                        <a href="https://plugins.cakephp.org" target="_blank" rel="noopener" class="list-group-item list-group-item-action">Plugin Repository</a>
                        <a href="https://www.willettstech.com/" target="_blank" rel="noopener" class="list-group-item list-group-item-action">Willetts Tech</a>
                    </div>
                </div>
            </div>
        </div>

        <footer class="text-center text-muted small py-4">
            &copy; <?= date('Y') ?> <a href="https://www.willettstech.com/" target="_blank" rel="noopener" class="text-muted">Willetts Tech</a>
            &middot; Powered by <a href="https://cakephp.org/" target="_blank" rel="noopener" class="text-muted">CakePHP <?= h(Configure::version()) ?></a>
        </footer>
    </main>
</body>
</html>
