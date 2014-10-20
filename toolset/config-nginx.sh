#!/bin/sh

setDefaultEnvVar(){
    if [ x$NGINX_PORT = x ]; then
        NGINX_PORT=80
    fi
    if [ x$JBOSS_PORT = x ]; then
        JBOSS_PORT=8080
    fi
    if [ x$JBOSS_HOST = x ]; then
        JBOSS_HOST=127.0.0.1
    fi
    if [ x$NODEJS_PORT = x ]; then
        NODEJS_PORT=8090
    fi

    echo "NGINX_PORT=$NGINX_PORT"
    echo "JBOSS_PORT=$JBOSS_PORT"
    echo "JBOSS_HOST=$JBOSS_HOST"
    echo "NODEJS_PORT=$NODEJS_PORT"
}
setDefaultEnvVar

if [ $UID = 0 ]; then
   echo "executing with root user"
   sh ./resource/do-config-nginx.sh $NODEJS_PORT $NGINX_PORT $JBOSS_HOST $JBOSS_PORT
else
    echo "executing with sudoer"
    sudo sh ./resource/do-config-nginx.sh $NODEJS_PORT $NGINX_PORT $JBOSS_HOST $JBOSS_PORT
fi

