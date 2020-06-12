#!/usr/bin/zsh

# --dir=path/dir --url=http://

echo "-------";

for i in "$@"; do
    case $i in
        --dir=*)
            ASSET_DIR="${i#*=}"
            shift # past argument=value
            ;;
        --url=*)
            ASSET_URL="${i#*=}"
            shift # past argument=value
            ;;
        *)
            # unknown option
            ;;
    esac
done;

mkdir -p $ASSET_DIR;
cd $ASSET_DIR;

# -r recursive
# -np --no-parent
# -nc, --no-clobber;
wget -r -np -nc $ASSET_URL;
