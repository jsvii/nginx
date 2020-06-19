#!/usr/bin/zsh

setopt BASH_REMATCH
TAR_FILE_REG="([^/]+(tar.gz|tar.bz2))$"
TAR_FILE_NAME=

for i in "$@"; do
    case $i in
        --download_url=*)
            ASSET_URL="${i#*=}"
            shift # past argument=value
            ;;
        --download_dir=*)
            ASSET_DIR="${i#*=}"
            shift # past argument=value
            ;;
        --dest_dir=*)
            DEST_DIR="${i#*=}"
            shift # past argument=value
            ;;
        *)
            # unknown option
            ;;
    esac
done;

mkdir -p $ASSET_DIR;

if [[ -d $DEST_DIR ]] || [[ -f $DEST_DIR ]]; then
    rm -rf $DEST_DIR
fi

# in case of old file
rm -rf $DEST_DIR;
mkdir -p $DEST_DIR;

cd $ASSET_DIR;
# -r recursive
# -np, --no-parent
# -nc, --no-clobber;
# -nH, --no-host-directories
wget -r -np -nc -nH  $ASSET_URL;
fileDIR=${ASSET_URL#*//*/}

echo "fileDIR is $fileDIR"

## just dir
if [[ -d $fileDIR ]]; then
    rm -rf $DEST_DIR
    cp -rf $fileDIR $DEST_DIR
    echo "successful! dir is $DEST_DIR"
    exit 0
fi

## compress file
if [[ $ASSET_URL =~ $TAR_FILE_REG ]]; then
    TAR_FILE_NAME=${BASH_REMATCH[1]}
    FOLDER_NAME=`tar -tf $fileDIR | head -n 1`

    if [[ $FOLDER_NAME =~ ".+/$" ]]; then
        # is folder
        tar -xf $fileDIR --strip-components 1 --directory $DEST_DIR
    else
        tar -xf $fileDIR --directory $DEST_DIR
    fi

    echo "successful uncompress: \n$fileDIR \n dir is $DEST_DIR"
    exit 0
fi

## file exception compress files
if [[ -f $fileDIR ]]; then
    fileDIR=${fileDIR%/*}
    rm -rf $DEST_DIR
    cp -rf $fileDIR $DEST_DIR
    echo "successful copy file!"
    exit 0;
fi


echo "I don't know!"
exit 1
