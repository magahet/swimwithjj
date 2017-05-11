dev:
	vagrant status || vagrant up
	test -f vagrant-ssh-config || vagrant ssh-config > vagrant-ssh-config
	ansible-playbook -i dev.yml --ssh-common-args="-F vagrant-ssh-config" deployment.yml

web-stage:
	ansible-playbook -t webapp -i stage.yml deployment.yml

prod:
	ansible-playbook -i prod.yml deployment.yml
