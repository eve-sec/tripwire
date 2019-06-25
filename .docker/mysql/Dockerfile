FROM centos:7

RUN yum update -y && \
    yum install -y epel-release

RUN yum install -y http://www.percona.com/downloads/percona-release/redhat/0.1-4/percona-release-0.1-4.noarch.rpm && \
    yum install -y Percona-Server-server-57 && \
    yum -y update

COPY ./.docker/mysql/my.cnf /etc/my.cnf
COPY ./.docker/mysql/setup.sql /root/setup.sql

RUN yum clean all

#CMD mysqld --user=root --initialize-insecure && \
#    mysqld --user=root && tail -F /var/log/mysql/error.log

CMD mysqld --user=root && tail -F /var/log/mysql/error.log

#ONBUILD mysql -u root < /root/setup.sql
