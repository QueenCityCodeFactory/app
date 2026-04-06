<?php
declare(strict_types=1);

namespace App\Middleware;

use Cake\Core\Configure;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;

/**
 * SessionTimeoutFilter Middleware
 *
 * Enforces session idle timeout and stamps `SessionTimeoutFilter.lastAccess`
 * on authenticated requests so the SessionMonitor JS can calculate remaining
 * time.
 *
 * Normal AJAX requests do NOT update lastAccess — only explicit pings
 * (requests with `?session_timeout=extend`) and non-AJAX requests do.
 * This prevents background AJAX (polling, lazy-loads) from silently
 * keeping the session alive.
 *
 * The timeout value is read from `Session.timeout` (in minutes).
 */
class SessionTimeoutFilter implements MiddlewareInterface
{
    /**
     * @inheritDoc
     */
    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        $session = $request->getAttribute('session');

        if ($session && $session->read('Auth.username')) {
            $timeout = (int)Configure::read('Session.timeout') * 60;
            $lastAccess = (int)$session->read('SessionTimeoutFilter.lastAccess');

            // Clear auth state when idle timeout is exceeded.
            // We intentionally do NOT call $session->destroy() because
            // CakePHP's Session does not reset its internal _started flag
            // after session_destroy(). Any subsequent $session->write()
            // in the same request (e.g. an AJAX re-login from the modal)
            // would write to $_SESSION in memory but never persist —
            // session_destroy() already disconnected the storage handler.
            // Clearing the keys keeps the session active so writes work.
            if ($lastAccess > 0 && $timeout > 0 && (time() - $lastAccess) >= $timeout) {
                $session->delete('Auth');
                $session->delete('SessionTimeoutFilter');
            } else {
                // Only update lastAccess for non-AJAX requests, or explicit
                // session-extend pings (the SessionMonitor JS sends
                // ?session_timeout=extend).
                $isAjax = strtolower((string)$request->getHeaderLine('X-Requested-With')) === 'xmlhttprequest';
                $isExtendPing = ($request->getQueryParams()['session_timeout'] ?? '') === 'extend';

                if (!$isAjax || $isExtendPing) {
                    $session->write('SessionTimeoutFilter.lastAccess', time());
                }
            }
        }

        // Always refresh CakePHP's internal Config.time so that
        // Session::_timedOut() never fires its own session destroy.
        // Our lastAccess logic above is the sole idle-timeout authority.
        // This must run outside the Auth check so Config.time stays fresh
        // even after Auth is cleared — giving the re-login modal time to work.
        if ($session && $session->started()) {
            $session->write('Config.time', time());
        }

        return $handler->handle($request);
    }
}
