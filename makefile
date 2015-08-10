.PHONY: build start stop restart

build:
	sudo docker-compose build

start:
	docker-compose up -d

stop:
	docker-compose stop

restart:
	docker-compose restart

ps:
	docker-compose ps

default:
	build
