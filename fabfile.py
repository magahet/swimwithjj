#!/usr/bin/python2.7

from fabric.api import sudo, env, get, prompt, put
from fabric.context_managers import cd
from fabric.decorators import task, runs_once
from fabric.utils import puts
from fabric.colors import cyan
from cuisine import mode_sudo, package_ensure, python_package_ensure
from cuisine import upstart_ensure, ssh_authorize, user_ensure, file_read
from cuisine import ssh_keygen, text_strip_margin, file_write, file_exists
from cuisine import dir_ensure, dir_exists, run, file_attribs, group_user_ensure
from cuisine import file_local_read, user_passwd
from datetime import datetime
from pprint import pformat
import os
import ConfigParser


@runs_once
def import_config():
    '''Import deployment config
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
    '''
    config = ConfigParser.ConfigParser()
    config.read('settings.conf')
    with open('environment') as file_:
        env.branch = file_.read().strip()
    env.host_string = config.get(env.branch, 'server')
    env.repo_url = config.get(env.branch, 'repo_url')
    env.backup_path = config.get(env.branch, 'backup_path')
    env.deployment_user = config.get(env.branch, 'deployment_user')
    env.ops_user = config.get(env.branch, 'ops_user')
    env.admin_user = config.get(env.branch, 'admin_user')
    puts(cyan('Deployment settings:\n{0}'.format(pformat(env))))
    prompt('Press enter to continue')


def install_packages():
    with mode_sudo():
        puts(cyan('Ensuring packages'))
        sudo('apt-get update')
        package_ensure('build-essential')
        package_ensure('python')
        package_ensure('python-dev')
        package_ensure('apache2')
        package_ensure('mongodb')
        package_ensure('git')
        package_ensure('python-pip')
        python_package_ensure('pymongo')
        python_package_ensure('cuisine')
        python_package_ensure('pystache')
        sudo('pip install --index-url https://code.stripe.com stripe')
        puts(cyan('Ensuring services'))
        upstart_ensure('apache2')
        upstart_ensure('mongodb')


def install_deployment_settings():
    with mode_sudo():
        dir_ensure('/etc/swimwithjj', mode=755, owner='root',
                   group='root', recursive=True)
    put('settings.conf', '/etc/swimwithjj/', use_sudo=True, mode=644)


def install_python_modules():
    put('scripts/emailer.py',
        '/usr/local/lib/python2.7/dist-packages/',
        use_sudo=True, mode=644)


def add_users():
    mode_sudo()
    puts(cyan('Ensuring user'))
    user_ensure(env.ops_user)
    ssh_authorize(env.ops_user,
                  file_local_read('/home/{0}/.ssh/'
                                  'id_rsa.pub'.format(env.ops_user)))
    user_ensure(env.deployment_user)
    group_user_ensure('sudo', env.ops_user)
    password = prompt('Ops user password (leave blank to keep current): ')
    if password:
        user_passwd(env.ops_user, password, encrypted_passwd=False)
    public_key = file_read(ssh_keygen(env.deployment_user))
    puts(cyan('Deploy user public key:\n{0}\n'.format(public_key)))
    puts(cyan('If the repo is private, '
              'this needs to be added to git server before deployment'))
    prompt('Press enter to continue')


def configure_apache_defaults():
    '''Configure apache defaults'''
    puts(cyan('Configuring Apache Defaults'))
    config_template = text_strip_margin('''
        |AddDefaultCharset UTF-8
        |
        |<IfModule mod_mime.c>
        |    AddType application/x-javascript .js
        |    AddType text/css .css
        |</IfModule>
        |
        |<IfModule mod_deflate.c>
        |    AddOutputFilterByType DEFLATE text/css application/x-javascript text/x-component text/html text/richtext image/svg+xml text/plain text/xsd text/xsl text/xml image/x-icon application/javascript
        |
        |    <IfModule mod_setenvif.c>
        |        BrowserMatch ^Mozilla/4 gzip-only-text/html
        |        BrowserMatch ^Mozilla/4\.0[678] no-gzip
        |        BrowserMatch \bMSIE !no-gzip !gzip-only-text/html
        |    </IfModule>
        |
        |    <IfModule mod_headers.c>
        |    Header append Vary User-Agent env=!dont-vary
        |    </IfModule>
        |</IfModule>
        |
        |<IfModule mod_expires.c>
        |    ExpiresActive On
        |    ExpiresDefault "access plus 1 days"
        |    ExpiresByType application/json "access"
        |    ExpiresByType text/html "access plus 1 days"
        |    ExpiresByType text/css "access plus 1 days"
        |    ExpiresByType text/javascript "access plus 1 days"
        |    ExpiresByType application/x-javascript "access plus 1 days"
        |    ExpiresByType image/gif "access plus 1 weeks"
        |    ExpiresByType image/jpeg "access plus 1 weeks"
        |    ExpiresByType image/png "access plus 1 weeks"
        |    ExpiresByType image/svg+xml "access plus 1 weeks"
        |    ExpiresByType text/xml "access plus 1 weeks"
        |</IfModule>
    ''')
    file_write('/etc/apache2/httpd.conf',
               config_template, sudo=True)
    sudo('a2enmod deflate')
    sudo('a2enmod headers')
    sudo('a2enmod expires')
    sudo('service apache2 restart')


def configure_apache():
    '''Configure apache and enable site'''
    puts(cyan('Configuring Apache'))
    configure_apache_defaults()
    config_template = text_strip_margin('''
    |<VirtualHost *:80>
    |    ServerName {prefix}swimwithjj.com
    |    RedirectPermanent / http://{prefix}www.swimwithjj.com
    |</VirtualHost>
    |
    |<VirtualHost *:80>
    |    ServerAdmin admin@swimwithjj.com
    |    ServerName {prefix}www.swimwithjj.com
    |    ServerAlias {prefix}swimwithjj.com
    |
    |    DocumentRoot /var/www/{prefix}swimwithjj.com/
    |    <Directory /var/www/{prefix}swimwithjj.com/>
    |        Options ExecCGI
    |        AddHandler cgi-script .cgi .py
    |    </Directory>
    |
    |    <Directory /var/www/{prefix}swimwithjj.com/admin>
    |        Options ExecCGI
    |        AddHandler cgi-script .cgi .py
    |        AuthType Basic
    |        AuthName "Restricted Access"
    |        AuthUserFile /etc/apache2/htpasswd
    |        Require valid-user
    |    </Directory>
    |
    |    <Directory /var/www/{prefix}swimwithjj.com/scripts>
    |        Deny from all
    |    </Directory>
    |
    |    <Directory /var/www/{prefix}swimwithjj.com/tests>
    |        Deny from all
    |    </Directory>
    |
    |    ErrorLog /var/log/apache2/{prefix}swimwithjj.com-error.log
    |    LogLevel warn
    |
    |    CustomLog /var/log/apache2/{prefix}swimwithjj.com-access.log combined
    |    ServerSignature On
    |</VirtualHost>
    ''')
    prefix = '{0}-'.format(env.branch) if env.branch != 'master' else ''
    file_write('/etc/apache2/sites-available/'
               '{prefix}www.swimwithjj.com'.format(prefix=prefix),
               config_template.format(prefix=prefix), sudo=True)
    if not file_exists('/etc/apache2/htpasswd'):
        sudo('htpasswd -c /etc/apache2/htpasswd {0}'.format(env.admin_user))
        with mode_sudo():
            file_attribs('/etc/apache2/htpasswd', mode=660,
                         owner='www-data', group='www-data')
    if not file_exists('/etc/apache2/sites-enabled/'
                       '{prefix}www.swimwithjj.com'.format(prefix=prefix)):
        sudo('a2ensite {prefix}www.swimwithjj.com'.format(prefix=prefix))
    with mode_sudo():
        dir_ensure('/var/www/{prefix}swimwithjj.com/'.format(prefix=prefix),
                   owner=env.deployment_user, group=env.deployment_user,
                   recursive=True)
    sudo('service apache2 reload')


def ensure_email_service():
    '''Enable email service'''
    service_config = text_strip_margin('''
        |description     "Email Service"
        |start on (net-device-up
        |          and local-filesystems
        |          and runlevel [2345])
        |stop on runlevel [016]
        |console log
        |respawn
        |
        |script
        |   cd /var/www/swimwithjj.com/scripts
        |   ./email-service.py
        |end script
    ''')
    file_write('/etc/init/email.conf', service_config, mode=644,
               owner='root', group='root', sudo=True)
    upstart_ensure('email')
    sudo('service email start', warn_only=True)


@task
def deploy():
    '''Setup server, install requirements, and deploy site code'''
    puts(cyan('Starting Deployment'))
    import_config()
    install_packages()
    add_users()
    install_deployment_settings()
    install_python_modules()
    configure_apache()
    update()
    if env.branch == 'master':
        ensure_email_service()


@task
def update():
    '''Get latest version of site code from repo'''
    import_config()
    install_deployment_settings()
    prefix = '{0}-'.format(env.branch) if env.branch != 'master' else ''
    code_dir = '/var/www/{prefix}swimwithjj.com'.format(prefix=prefix)
    if not dir_exists('{0}/.git'.format(code_dir)):
        sudo('git clone {0} {1}'.format(env.repo_url, code_dir), user=env.deployment_user)
    with cd(code_dir):
        sudo('git checkout {0}'.format(env.branch), user=env.deployment_user)
        sudo('git pull origin {0}'.format(env.branch), user=env.deployment_user)


@task
def show_emails():
    '''Show list of emails from signup notification form'''
    import_config()
    emails_ = run('''mongo swimwithjj --eval "db.signup_notification.distinct('email')"''')
    puts(cyan('\n{0}'.format(emails_)))


@task
def backup_db():
    '''Save a copy of swimwithjj db to BACKUP_PATH'''
    import_config()
    backup_name = 'swimwithjj-{0:%Y-%m-%d}'.format(datetime.now())
    with cd('/tmp'):
        run('mongodump -d swimwithjj -o {0}'.format(backup_name))
        run('tar -cvzf {0}.tar.gz {0}'.format(backup_name))
        get("{0}.tar.gz".format(backup_name),
            os.path.join(env.backup_path, "{0}.tar.gz".format(backup_name)))
        run('rm -r {0}.tar.gz {0}'.format(backup_name))
