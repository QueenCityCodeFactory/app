<?php
/**
 * Error Layout
 *
 * Extends the ButterCream error layout which provides Bootstrap 5 + app.css styling.
 *
 * @var \App\View\AppView $this
 */
?>
<?php $this->extend('ButterCream.error'); ?>
<?= $this->fetch('content') ?>
