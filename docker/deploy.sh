#!/bin/bash


set -e

PROJECT_ID=${1:-"your-project-id"}
SERVICE_NAME="ai-room-simulator"
REGION="asia-northeast1"
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"

echo "🚀 Deploying AI Room Simulator to Google Cloud Run"
echo "Project ID: $PROJECT_ID"
echo "Service Name: $SERVICE_NAME"
echo "Region: $REGION"
echo ""

if ! command -v gcloud &> /dev/null; then
    echo "❌ Error: gcloud CLI is not installed"
    echo "Please install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker is not installed"
    echo "Please install Docker from: https://docs.docker.com/get-docker/"
    exit 1
fi

if [ "$PROJECT_ID" = "your-project-id" ]; then
    echo "❌ Error: Please provide your Google Cloud Project ID"
    echo "Usage: ./deploy.sh YOUR_PROJECT_ID"
    exit 1
fi

echo "🔧 Setting up Google Cloud configuration..."
gcloud config set project $PROJECT_ID

echo "🏗️  Building Docker image..."
cd "$(dirname "$0")/.."
docker build -t $IMAGE_NAME -f docker/Dockerfile .

echo "📤 Pushing image to Google Container Registry..."
docker push $IMAGE_NAME

echo "🚀 Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
    --image $IMAGE_NAME \
    --region $REGION \
    --platform managed \
    --allow-unauthenticated \
    --port 3000 \
    --memory 512Mi \
    --cpu 1 \
    --max-instances 10 \
    --timeout 300

echo ""
echo "✅ Deployment completed successfully!"
echo ""
echo "🌐 Your application is now available at:"
gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)'
echo ""
echo "📊 To view logs:"
echo "gcloud logs tail --follow --resource-type cloud_run_revision --resource-labels service_name=$SERVICE_NAME"
echo ""
echo "🔧 To update the service:"
echo "./deploy.sh $PROJECT_ID"
