FROM debian:jessie
MAINTAINER Gar Mendiola <magahet@gmail.com>
 
RUN apt-get update \
    && apt-get install -y \
        python2.7 \
        python-pip \
    && rm -rf /var/lib/apt/lists/*

COPY ./requirements.txt /tmp/requirements.txt
RUN pip install -r /tmp/requirements.txt

COPY emailer.py /usr/local/lib/python2.7/dist-packages/

RUN mkdir /opt/email-service

WORKDIR /opt/email-service

COPY email-service.py /opt/email-service/

# By default, simply start apache.
ENTRYPOINT ["./email-service.py"]
