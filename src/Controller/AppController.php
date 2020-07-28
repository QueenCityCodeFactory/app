<?php
declare(strict_types=1);

/**
 * CakePHP(tm) : Rapid Development Framework (https://cakephp.org)
 * Copyright (c) Cake Software Foundation, Inc. (https://cakefoundation.org)
 *
 * Licensed under The MIT License
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright Copyright (c) Cake Software Foundation, Inc. (https://cakefoundation.org)
 * @link      https://cakephp.org CakePHP(tm) Project
 * @since     0.2.9
 * @license   https://opensource.org/licenses/mit-license.php MIT License
 */
namespace App\Controller;

use ButterCream\Controller\Controller;
use Cake\Core\Configure;
use Cake\Event\EventInterface;
use Cake\Routing\Router;

/**
 * Application Controller
 *
 * Add your application-wide methods in the class below, your controllers
 * will inherit them.
 *
 * @link https://book.cakephp.org/4/en/controllers.html#the-app-controller
 */
class AppController extends Controller
{

    /**
     * Initialization hook method.
     *
     * Use this method to add common initialization code like loading components.
     *
     * e.g. `$this->loadComponent('FormProtection');`
     *
     * @return void
     */
    public function initialize(): void
    {
        parent::initialize();

        // $this->loadComponent('Authentication.Authentication');
        // if ($this->request->is('admin')) {
        //     $this->loadComponent('Auth', [
        //         'className' => 'Auth',
        //         'loginAction' => [
        //             'controller' => 'Users',
        //             'action' => 'login',
        //             'prefix' => 'admin'
        //         ],
        //         'loginRedirect' => [
        //             'controller' => 'Dashboard',
        //             'action' => 'index',
        //             'prefix' => 'admin'
        //         ],
        //         'flash' => [
        //             'element' => 'error',
        //         ],
        //         'authError' => $this->request->getSession()->check('Auth.User') ? 'Insufficient privileges to view requested resources! You can not access: ' . Router::url(null, true) : 'Please login to continue!',
        //         'authenticate' => [
        //             'Form' => [
        //                 'fields' => [
        //                     'username' => 'email',
        //                     'password' => 'password'
        //                 ],
        //                 'finder' => 'auth'
        //             ]
        //         ]
        //     ]);
        // }
    }

    /**
     * Controller Before Filter Callback
     *
     * @param Event $event The Event Object
     * @return void
     */
    public function beforeFilter(EventInterface $event)
    {
        parent::beforeFilter($event);

        if ($this->request->is('ajax')) {
            Configure::write('debug', false);
        }

        // if ($this->request->is('admin') && !$this->Auth->user()) {
        //    $this->Auth->config('authError', false);
        // }
    }
}
