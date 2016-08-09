stage:
	ansible-playbook -i dev.yml deployment.yml
prod:
	ansible-playbook -K -i prod.yml deployment.yml
