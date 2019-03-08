# script used to publish package to npm and push new tag
# step 1 - change version from package json
# step 2 - run ./scripts/publish-npm.sh $version  i.e ./scripts/publish-npm.sh 0.0.3
set -e

if [ $# -eq 0 ]
  then
    echo "Please specify version."
    exit
fi

PACKAGE_NAME="socket-file-uploader"

# if you forget to commit
PORCELAIN=`git status --porcelain`
if [ -n "$PORCELAIN" ]; then
  echo "Please commit changes first."; 
  echo $PORCELAIN
  exit;
fi

BRANCH=`git rev-parse --abbrev-ref HEAD`
ORIGIN=`git config --get remote.origin.url`

if [ "$BRANCH" != "master" ]; then
  echo "Error: Switch to the master branch before publishing."
  exit
fi

if ! [[ "$ORIGIN" =~ $PACKAGE_NAME ]]; then
  echo "Error: Switch to the main repo ($PACKAGE_NAME) before publishing."
  exit
fi

# Build CPU:
npm pack
npm publish --access public
echo "⌛ ⌛ Published ${PACKAGE_NAME} a new package to npm."

# Revert GPU changes:
git checkout .


if [ $# -ne 0 ]
  then
    git pull
    git push # verify everthing on cloud before creting tag
    git tag $1
    git push --tags
    rm -rf zujo-$PACKAGE_NAME-*.tgz
fi