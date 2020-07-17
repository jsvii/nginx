#!/usr/bin/zsh

NGINX_PROJECT_ROOT=`pwd`

# mdbooks, submodules path;
mdbooks=(doc/rust/cargo/src/doc
doc/rust/book
doc/rust/book_cn
doc/rust/rustc_dev_guide
doc/rust/edition_guide
doc/rust/example
)

for tempdir in $mdbooks
do
    tempdir=$NGINX_PROJECT_ROOT/$bookdir
    cd tempdir
    mdbook build
done

# build typescript site background
cd $NGINX_PROJECT_ROOT/doc/typescript/TypeScript-Website
npm run build-site &

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
npm run build &
sleep 3
# link nginx files
DIST_CONFIG=/etc/nginx/conf.d/nginx.apidoc.conf
sudo rm -rf $DIST_CONFIG
sudo ln -s  $NGINX_PROJECT_ROOT/src/nginx.conf $DIST_CONFIG
sudo systemctl restart nginx;
echo "success!"
