<?php
declare(strict_types=1);

namespace App\View;

use CakePdf\View\PdfView as View;

/**
 * Application View
 *
 * Your application's default view class
 *
 * @link https://book.cakephp.org/4/en/views.html#the-app-view
 */
class PdfView extends View
{
    /**
     * Initialization hook method.
     *
     * Use this method to add common initialization code like loading helpers.
     *
     * e.g. `$this->loadHelper('Html');`
     *
     * @return void
     */
    public function initialize(): void
    {
        parent::initialize();

        $this->loadHelper('Ajax', [
            'className' => 'ButterCream.Ajax',
        ]);
        $this->loadHelper('Flash', [
            'className' => 'ButterCream.Flash',
        ]);
        $this->loadHelper('Form', [
            'className' => 'ButterCream.Form',
            'templates' => [
                'dateWidget' => '
                    <ul class="list-inline">
                        <li class="month">{{month}}</li>
                        <li class="day">{{day}}</li>
                        <li class="year">{{year}}</li>
                        <li class="hour">{{hour}}</li>
                        <li class="minute">{{minute}}</li>
                        <li class="second">{{second}}</li>
                        <li class="meridian">{{meridian}}</li>
                    </ul>
                ',
            ],
        ]);
        $this->loadHelper('Html', [
            'className' => 'ButterCream.Html',
        ]);
        $this->loadHelper('Paginator', [
            'className' => 'ButterCream.Paginator',
        ]);
        $this->loadHelper('Table', [
            'className' => 'ButterCream.Table',
        ]);
        $this->loadHelper('Time', [
            'className' => 'ButterCream.Time',
        ]);
        $this->loadHelper('Url', [
            'className' => 'ButterCream.Url',
        ]);
    }
}
