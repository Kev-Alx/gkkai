# Makefile for easy Docker Compose operations (Development only)

.PHONY: help build up down restart logs clean dev migrate shell db-shell status

build:
	@echo "Building development images..."
	docker-compose -f docker-compose.yaml build

up:
	@echo "Starting development services..."
	docker-compose -f docker-compose.yaml up

down:
	@echo "Stopping development services..."
	docker-compose -f docker-compose.yaml down

dev:
	@echo "Starting development environment..."
	docker-compose -f docker-compose.yaml up -d

db-shell:
	@echo "Accessing database container shell..."
	docker-compose -f docker-compose.yaml exec db psql -U postgres -d gkkai
