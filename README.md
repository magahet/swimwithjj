swimwithjj
==============

See it live: http://www.swimwithjj.com/

A website to provide information and services for jj's swim school.

Frontend code uses a mix of AngularJS and JQuery, though JQuery will eventually be phased out.
Backend services are written in python and utilize mongodb for a datastore.


TODO
----

* add info box for parent and me / adult lessons
* add send lesson confirmation button to admin


Deployment
----------


## Environment Variables

Deployment with docker requires the following environment variables be set in these files:

    conf/common.env

        # Credentials for site admin interface
        ADMIN_USER=
        ADMIN_PASS=

        DB_HOST=
        EMAIL_SENDER_NAME=
        EMAIL_SENDER_ADDRESS=
        EMAIL_SENDER_PASSWORD=


    conf/specific.env

        STRIPE_SECRET_KEY=
        STRIPE_PUBLISH_KEY=
        DB_NAME=

        # Email address to send messages from website
        MESSAGE_ADDRESS=


## Deployment Process

This site is deployed as three docker containers:

- Web: an apache service with python cgi scripts for form handling
- Emailer: a python service that sends email based on signup status
- Mongo: a mongodb service to stores signups

Dockerfiles exist for building the web and emailer images. Docker compose is used to launch the containers and relationships are defined in docker-compose.yml. 


### Building

    docker-compose build


### Launching

    docker-compose up -d


## Troubleshooting

View container status:

    docker-compose ps

View stdout:

    docker-compose logs

Dig into each container:

    docker exec -it <container_name> bash


## LICENSE

The site code for www.swimwithjj.com is released under the MIT License. The full text of the license agreement is located in LICENSE.txt. Copyright for photography and original artwork is retained by the author(s) and use of this material without written authorization is prohibited.
