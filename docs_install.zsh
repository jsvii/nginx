#!/usr/bin/zsh

NGINX_PROJECT_ROOT=`pwd`

echo $NGINX_PROJECT_ROOT;

# mdbooks, submodules path;
mdbooks=(doc/rust/cargo/src/doc
doc/rust/book
doc/rust/book_cn
doc/rust/rustc_dev_guide
doc/rust/edition_guide
doc/rust/example
)

for bookdir in $mdbooks
do
    tempdir=$NGINX_PROJECT_ROOT/$bookdir
    echo $tempdir
    cd $tempdir
    mdbook build
done


# build typescript site background
cd $NGINX_PROJECT_ROOT/doc/typescript/TypeScript-Website
npm install
npm run build-site

# build ast site
cd $NGINX_PROJECT_ROOT/doc/babel/astexplorer/website
npm install
npm run build
