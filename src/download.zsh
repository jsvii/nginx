#!/usr/bin/zsh

# --dir=path/dir --url=http://
echo "-------";

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

mkdir -p $DEST_DIR;
rm -rf $DEST_DIR;

cd $ASSET_DIR;
# -r recursive
# -np, --no-parent
# -nc, --no-clobber;
# -nH, --no-host-directories
wget -r -np -nc -nH  $ASSET_URL;
fileDIR=${ASSET_URL#*//*/}

echo $fileDIR


if [[ -d $fileDIR ]]; then
    cp -rf $fileDIR $DEST_DIR;
elif [[ -f $fileDIR ]]; then
    echo "---no implemtaiton---";
else
    echo "---no implemtaiton---"
fi
