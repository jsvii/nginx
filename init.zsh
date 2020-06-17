#!/usr/bin/zsh

PWD=`pwd`;
DIST_CONFIG=/etc/nginx/conf.d/nginx.apidoc.conf
rm -rf ./root/src
mkdir -p ./root/src/
ln -s $PWD/node_modules/materialize-css/dist/js/materialize.min.js ./root/src/materialize.min.js
ln -s $PWD/node_modules/materialize-css/dist/css/materialize.min.css ./root/src/materialize.min.css
ln -s $PWD/node_modules/jquery/dist/jquery.min.js ./root/src/jquery.min.js
ln -s $PWD/src/html/style.css ./root/src/style.css

# xv6 doc
rm -rf ./root/xv6
ln -s $PWD/doc/xv6/ ./root/xv6

sudo rm -rf $DIST_CONFIG
sudo ln -s  $PWD/src/nginx.apidoc.conf $DIST_CONFIG
sudo systemctl restart nginx;
