.PHONY: build start stop restart start-frontend

build:
	sudo docker-compose -f $(ENV) build

start:
	docker-compose -f $(ENV) up -d

start-frontend:
	docker-compose -f $(ENV) up -d frontend

stop:
	docker-compose -f $(ENV) stop

restart:
	docker-compose -f $(ENV) restart

ps:
	docker-compose -f $(ENV) ps

default:
	build
