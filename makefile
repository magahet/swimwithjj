dev:
	ansible-playbook -i dev.yml deployment.yml
web:
	ansible-playbook -t webapp -i dev.yml deployment.yml
prod:
	ansible-playbook -i prod.yml deployment.yml
