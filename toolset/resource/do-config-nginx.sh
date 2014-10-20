#!/bin/sh
NODEJS_PORT=$1
NGINX_PORT=$2
JBOSS_HOST=$3
JBOSS_PORT=$4

configNginx(){
    cp -f ./resource/nginx-default-template.conf /etc/nginx/conf.d/default.conf
    local local_ip=127.0.0.1
    sed -i s/"__JBOSS_IP_PORT__"/"$JBOSS_HOST:$JBOSS_PORT"/g /etc/nginx/conf.d/default.conf
    sed -i s/"__NODEJS_IP_PORT__"/"$local_ip:$NODEJS_PORT"/g /etc/nginx/conf.d/default.conf
    sed -i s/"__NODEJS_IP_"/"$local_ip"/g /etc/nginx/conf.d/default.conf
    service nginx restart
}

main() {
    echo "Configure Nginx ... "
    configNginx
    echo "Done"
}

main