#!/bin/sh

CURRDIR=$(pwd)/..
echo $CURRDIR
DOCDIR=$CURRDIR/document
TEMPLATE=ink-docstrap
TEMPLATEDIR=
if [ -d $CURRDIR/../node_modules/$TEMPLATE ]; then
    TEMPLATEDIR=$CURRDIR/../node_modules/$TEMPLATE
elif [ -d $CURRDIR/../$TEMPLATE ]; then
    TEMPLATEDIR=$CURRDIR/../$TEMPLATE
fi

jsdoc $CURRDIR -r -t $TEMPLATEDIR/template -c $TEMPLATEDIR/template/jsdoc.conf.json -d $DOCDIR --verbose