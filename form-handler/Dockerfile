FROM debian:jessie
MAINTAINER Gar Mendiola <magahet@gmail.com>

RUN apt-get update \
    && apt-get install -y \
        supervisor \
    && rm -rf /var/lib/apt/lists/*

EXPOSE 8080

COPY form-handler /opt/swimwithjj/
COPY conf/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

CMD ["/usr/bin/supervisord"]
