#!/bin/sh
openssl req -newkey rsa:4096 -nodes -keyout cakephp.app.local.key -x509 -out ansible/roles/nginx/templates/development/ssl.crt/cakephp.app.local.crt -days 3650 -config development.openssl.cnf
