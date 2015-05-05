FROM ubuntu:14.04
MAINTAINER Gar Mendiola <magahet@gmail.com>
 
RUN apt-get update \
    && apt-get install -y \
        apache2 \
        python2.7 \
        python-pip \
    && rm -rf /var/lib/apt/lists/*

COPY ./requirements.txt /tmp/requirements.txt
RUN pip install -r /tmp/requirements.txt

RUN a2enmod cgi

RUN mkdir /etc/swimwithjj

EXPOSE 80

# Copy site into place.
#COPY webapp /var/www/swimwithjj.com/

COPY email-service/emailer.py /usr/local/lib/python2.7/dist-packages/

COPY conf/settings.conf /etc/swimwithjj/

# Update the default apache site with the config we created.
COPY conf/swimwithjj.conf /etc/apache2/sites-enabled/000-default.conf

# By default, simply start apache.
ENTRYPOINT ["/usr/sbin/apache2ctl", "-D", "FOREGROUND"]
