swimwithjj
==============

See it live: http://www.swimwithjj.com/

A website to provide information and services for jj's swim school.

Frontend code uses a mix of AngularJS and JQuery, though JQuery will eventually be phased out.
Backend services are written in python and utilize mongodb for a datastore.


TODO
----

* add info box for parent and me / adult lessons
* add delete record button to admin
* add send lesson confirmation button to admin


Deployment
----------


## settings.yaml

There is a settings-template.yaml file in /conf. A copy should be made to /conf/settings.yaml and parameters entered as appropriate. Ansible will deploy /conf/settings.yaml to the webserver. This is needed for the webapp form handlers and the email service.


## Deployment Process

An ansible playbook is included for configuring the webserver and deploying the webapp and email service.

An ansible inventory file needs to be created with with the fqdn of the webserver. This should be created as /env.yaml. Once in place, you can simply call make to run the deployment command.


## LICENSE

The site code for www.swimwithjj.com is released under the MIT License. The full text of the license agreement is located in LICENSE.txt. Copyright for photography and original artwork is retained by the author(s) and use of this material without written authorization is prohibited.
