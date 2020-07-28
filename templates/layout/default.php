<?php $this->extend('ButterCream.main'); ?>
<?php if (!$this->fetch('meta')) : ?>
    <?php $this->start('meta'); ?>
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="description" content="<?= \Cake\Core\Configure::read('App.title') ?>">
    <meta name="author" content="<?= \Cake\Core\Configure::read('App.author') ?>">
    <?php $this->end(); ?>
<?php endif; ?>
<?= $this->fetch('content') ?>
