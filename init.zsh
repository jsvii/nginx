#!/usr/bin/zsh

NGINX_PROJECT_ROOT=`pwd`

./docs_install.zsh &

#  wget the assets
npm install;

rm -rf ./root/src
mkdir -p ./root/src/
ln -s $NGINX_PROJECT_ROOT/node_modules/materialize-css/dist/js/materialize.min.js ./root/src/materialize.min.js
ln -s $NGINX_PROJECT_ROOT/node_modules/materialize-css/dist/css/materialize.min.css ./root/src/materialize.min.css
ln -s $NGINX_PROJECT_ROOT/node_modules/jquery/dist/jquery.min.js ./root/src/jquery.min.js
ln -s $NGINX_PROJECT_ROOT/src/html/style.css ./root/src/style.css


## npm build runs for a lot of time
## but the nginx.conf is  generated within a few minutes
cd $NGINX_PROJECT_ROOT
npm run build &
sleep 3
# link nginx files
DIST_CONFIG=/etc/nginx/conf.d/nginx.apidoc.conf
sudo rm -rf $DIST_CONFIG
sudo ln -s  $NGINX_PROJECT_ROOT/src/nginx.conf $DIST_CONFIG
sudo systemctl restart nginx;
echo "success!"
