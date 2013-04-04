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


## settings.conf

settings.conf should have the following format:

    [DEFAULT]
    server: <server fqdn>
    repo_url: <git repo url>
    deployment_user: <username for deployment>
    ops_user: <username for server logins>
    admin_user: <username for admin interface>
    backup_path: <path to local dir for db backups>
    email_sender_name: <Name for email sender>
    email_sender_address: <address for email sender>
    email_sender_password: <password for email sender (gmail)>

    # environment/branch name. Create more for feature testing
    [master]
    stripe_secret_key: <stripe secret key>
    stripe_publish_key: <stripe publishable key>
    db_name: <db name>
    message_address: <email to send messages to>

    # example feature branch settings
    [test]
    stripe_secret_key: <stripe secret key>
    stripe_publish_key: <stripe publishable key>
    db_name: <db name>
    message_address: <email to send messages to>

    # An environment string matching one of these section names
    # should be stored in the file: environment


## Deployment Process

A fabric deployment script is included with the following tasks:

    backup_db    Save a copy of swimwithjj db to BACKUP_PATH
    deploy       Setup server, install requirements, and deploy site code
    show_emails  Show list of emails from signup notification form
    update       Get latest version of site code from repo

The file, 'environment', will determine which branch of code will be deployed and which site settings to use. To deploy code from the master branch, save the string 'master' to the environment file. Then run the deployment script with:

    fab deploy

This will perform the following:

 - install required packages
 - setup user accounts
 - configure apache
 - install site services and python modules
 - clone and pull site code

The following command will perform only the final step of pulling the latest commit from the repo:

    fab update


## LICENSE

The site code for www.swimwithjj.com is released under the MIT License. The full text of the license agreement is located in LICENSE.txt. Copyright for photography and original artwork is retained by the author(s) and use of this material without written authorization is prohibited.
