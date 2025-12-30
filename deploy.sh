#!/bin/bash

# LocalLink Deployment Script
# Usage: ./deploy.sh [dev|staging|production]

set -e

ENVIRONMENT=${1:-dev}

echo "========================================"
echo "  LocalLink Deployment"
echo "  Environment: $ENVIRONMENT"
echo "========================================"

# Check if .env exists
if [ ! -f .env ]; then
    echo "Error: .env file not found!"
    echo "Copy .env.example to .env and configure it first."
    exit 1
fi

# Source environment variables
source .env

case $ENVIRONMENT in
    dev)
        echo "Starting development environment..."
        docker-compose up -d postgres redis
        echo "Waiting for databases..."
        sleep 5
        echo "Starting services..."
        docker-compose up -d backend admin web webapp
        echo ""
        echo "Development environment started!"
        echo ""
        echo "Available at:"
        echo "  - Full Web App:     http://localhost:3000"
        echo "  - Mobile Preview:   http://localhost:5173"
        echo "  - Admin Panel:      http://localhost:3001"
        echo "  - Backend API:      http://localhost:4000"
        ;;

    staging)
        echo "Building staging environment..."
        docker-compose build
        docker-compose up -d postgres redis
        echo "Waiting for databases..."
        sleep 10
        echo "Starting services..."
        docker-compose up -d backend admin web webapp
        echo ""
        echo "Staging environment ready!"
        ;;

    production)
        echo "Building production environment..."
        docker-compose build
        echo ""
        echo "Starting with nginx reverse proxy..."
        docker-compose --profile production up -d
        echo ""
        echo "Production environment deployed!"
        echo ""
        echo "Make sure you have:"
        echo "  1. SSL certificates in ./nginx/ssl/"
        echo "  2. DNS configured for your domains"
        echo "  3. Proper .env values for production"
        ;;

    stop)
        echo "Stopping all services..."
        docker-compose --profile production down
        echo "All services stopped."
        ;;

    logs)
        echo "Showing logs..."
        docker-compose logs -f
        ;;

    restart)
        echo "Restarting services..."
        docker-compose restart
        ;;

    *)
        echo "Usage: ./deploy.sh [dev|staging|production|stop|logs|restart]"
        echo ""
        echo "Commands:"
        echo "  dev         - Start development environment (default)"
        echo "  staging     - Build and start staging environment"
        echo "  production  - Build and deploy with nginx reverse proxy"
        echo "  stop        - Stop all services"
        echo "  logs        - Show service logs"
        echo "  restart     - Restart all services"
        exit 1
        ;;
esac

echo ""
echo "Done!"
