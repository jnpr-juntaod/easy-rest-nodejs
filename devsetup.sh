#!/bin/sh
# Copyright 2014 Juniper Networks, Inc. All rights reserved.
# Auther: Shawnwang

readonly REPO_3rdParty=lib-3rdParty
readonly REPO_3rdParty_BRANCH=develop
readonly CURDIR=$(pwd)
readonly BASE_DIR=$CURDIR/..
readonly TMP_DIR=$BASE_DIR/../.tmprepo/$REPO_3rdParty_BRANCH
readonly NODE_MODULES=$BASE_DIR/node_modules
readonly NODE_HOME=$BASE_DIR/..
NODENAME=

readonly GIT_PREFIX=git@github.com:JSpaceTeam
DEP_LIST[0]=easy-rest
DEP_LIST[1]=shadowfax
DEP_LIST[2]=yang-model
DEP_LIST[3]=js-ui-base
DEP_LIST[4]=js-ems-inventory
DEP_LIST[5]=js-system-services
DEP_LIST[7]=js-ems-ui

DEP_BRANCH[0]=develop
DEP_BRANCH[1]=develop
DEP_BRANCH[2]=develop
DEP_BRANCH[3]=develop
DEP_BRANCH[4]=develop
DEP_BRANCH[5]=develop
DEP_BRANCH[6]=develop
DEP_BRANCH[7]=develop
initDir() {
    mkdir -p $TMP_DIR/node_modules/
}

git_clone() {
    if [[ -d $1 ]]; then
        echo "repository '$1' exists, pulling the newest codes for branch '$2'"
        cd $1
        git pull
        cd ..
    elif [[ x$1 != x ]]; then
        git clone -b $2 "$GIT_PREFIX/$1"
    fi
}

install3rdParty() {
    cd $TMP_DIR
    if [[ -d $REPO_3rdParty ]]; then
        echo "repository '$REPO_3rdParty' exists, pulling the newest codes for branch '$REPO_3rdParty_BRANCH'"
        cd $REPO_3rdParty
        git pull
        cd ..
    else
        git_clone $REPO_3rdParty $REPO_3rdParty_BRANCH
    fi

    cd lib-3rdParty/nodejs
    nodezip=`ls node-v*|awk '{print$1}'`
    tar -xzf $nodezip
    NODENAME=`echo $nodezip | awk -F ".tar.gz" '{print $1}'`
    if [[ ! -d $BASE_DIR/../$NODENAME ]]; then
        cp -rf node $BASE_DIR/../$NODENAME
    fi
    if [[ -d $BASE_DIR/node_modules ]]; then
        rm -rf $BASE_DIR/node_modules
    fi

    cp -rf node_modules $BASE_DIR/
}

installDep() {
    cd $TMP_DIR/node_modules
    for((i=0;i<100;i++))
    do
	    if [[ ! x"${DEP_LIST[$i]}" = x ]]; then
	        DOWNLOADDIR=${DEP_LIST[$i]}
	        if [[ ! -d $BASE_DIR/$DOWNLOADDIR ]]; then
		        git_clone ${DEP_LIST[$i]} ${DEP_BRANCH[$i]}
		        cp -rf $TMP_DIR/node_modules/$DOWNLOADDIR $BASE_DIR/node_modules/$DOWNLOADDIR
		        cd $BASE_DIR/node_modules/$DOWNLOADDIR
		        npm install
		        cd $TMP_DIR/node_modules
		    fi
        fi
    done
}

mklinks() {
    echo "Symbol link nodejs commands to $HOME/bin"
    mkdir -p ~/bin
    rm -f $HOME/bin/node
    rm -f $HOME/bin/npm
    ln -s $BASE_DIR/../$NODENAME/bin/node $HOME/bin/node
    ln -s $BASE_DIR/../$NODENAME/bin/npm $HOME/bin/npm
    rm -f $HOME/bin/istanbul
    rm -f $HOME/bin/mocha
    rm -f $HOME/bin/jsdoc
    if [ -f $BASE_DIR/node_modules/.bin/mocha ];  then
        ln -s $BASE_DIR/node_modules/.bin/mocha  $HOME/bin/mocha
    fi
    if [ -f $BASE_DIR/node_modules/.bin/istanbul ];  then
        ln -s $BASE_DIR/node_modules/.bin/istanbul  $HOME/bin/istanbul
    fi
    if [ -f $BASE_DIR/node_modules/.bin/jsdoc ];  then
        ln -s $BASE_DIR/node_modules/.bin/jsdoc  $HOME/bin/jsdoc
    fi

    cd $BASE_DIR
    dir=$(ls -l $BASE_DIR |awk '/^d/ {print $NF}')
    for i in $dir
    do
	echo "Cleaning folder:$BASE_DIR/node_modules/$i"
        rm -rf $BASE_DIR/node_modules/$i
        if [ "$BASE_DIR/$i" != "$CURDIR" ]; then
            echo "Updating source code of repository:$i"
            cd $i
            if [ -d .git ]; then
                git pull
                npm install
            fi
        fi
        cd $BASE_DIR
    done

    if [ -d $BASE_DIR/easy-rest ]; then
	ln -s $BASE_DIR/easy-rest $BASE_DIR/node_modules/easy-rest
    fi
    if [ -d $BASE_DIR/yang-model ]; then
	ln -s $BASE_DIR/yang-model $BASE_DIR/node_modules/yang-model
    fi  
}

main() {
    echo "initDir..."
    initDir
    echo "install3rdParty..."
    install3rdParty
    echo "installDep..."
    installDep
    echo "mklinks..."
    mklinks
    echo "DONE!"
}

main
