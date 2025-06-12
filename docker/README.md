# Docker Deployment for AI Room Simulator

This directory contains Docker configuration and deployment scripts for the AI Room Simulator furniture e-commerce application.

## 📁 Directory Structure

```
ai-room-simulator/
├── app/                    # Next.js application source
├── lib/                    # API utilities and helpers
├── types/                  # TypeScript type definitions
├── data/                   # Mock data for furniture
├── docker/                 # Docker configuration (this directory)
│   ├── Dockerfile         # Multi-stage Docker build configuration
│   ├── .dockerignore      # Files to exclude from Docker build
│   ├── cloudbuild.yaml    # Google Cloud Build configuration
│   ├── deploy.sh          # Deployment script for Cloud Run
│   └── README.md          # This file
├── .gcloudignore          # Files to exclude from Cloud deployment
└── ...                    # Other project files
```

## 🐳 Docker Configuration

### Dockerfile Features
- **Multi-stage build** for optimized image size
- **Next.js standalone output** for containerized deployment
- **Non-root user** for security
- **Health check** for Cloud Run compatibility
- **Environment variables** configured for Cloud Run

### Build Process
1. **Dependencies stage**: Installs production dependencies
2. **Builder stage**: Builds the Next.js application
3. **Runner stage**: Creates minimal production image

## 🚀 Local Development & Testing

### Prerequisites
- Docker installed and running
- Node.js 18+ (for local development)
- npm or yarn package manager

### Build and Test Locally

1. **Build the Docker image:**
   ```bash
   cd docker
   docker build -t ai-room-simulator -f Dockerfile ..
   ```

2. **Run the container:**
   ```bash
   docker run -p 3000:3000 ai-room-simulator
   ```

3. **Test the application:**
   - Open http://localhost:3000 in your browser
   - Verify the furniture catalog loads
   - Test individual product pages
   - Check API endpoints: http://localhost:3000/api/furniture

4. **Stop the container:**
   ```bash
   docker stop $(docker ps -q --filter ancestor=ai-room-simulator)
   ```

## ☁️ Google Cloud Run Deployment

### Prerequisites
- Google Cloud account with billing enabled
- Google Cloud CLI (`gcloud`) installed and authenticated
- Docker configured to push to Google Container Registry

### Quick Deployment

1. **Using the deployment script (recommended):**
   ```bash
   chmod +x docker/deploy.sh
   ./docker/deploy.sh YOUR_PROJECT_ID
   ```

2. **Manual deployment:**
   ```bash
   # Set your project ID
   export PROJECT_ID=your-project-id
   
   # Build and push image
   docker build -t gcr.io/$PROJECT_ID/ai-room-simulator -f docker/Dockerfile .
   docker push gcr.io/$PROJECT_ID/ai-room-simulator
   
   # Deploy to Cloud Run
   gcloud run deploy ai-room-simulator \
     --image gcr.io/$PROJECT_ID/ai-room-simulator \
     --region us-central1 \
     --platform managed \
     --allow-unauthenticated \
     --port 3000 \
     --memory 512Mi \
     --cpu 1
   ```

### Automated Deployment with Cloud Build

1. **Enable required APIs:**
   ```bash
   gcloud services enable cloudbuild.googleapis.com
   gcloud services enable run.googleapis.com
   ```

2. **Grant Cloud Build permissions:**
   ```bash
   gcloud projects add-iam-policy-binding $PROJECT_ID \
     --member="serviceAccount:$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')@cloudbuild.gserviceaccount.com" \
     --role="roles/run.admin"
   
   gcloud iam service-accounts add-iam-policy-binding \
     $(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')-compute@developer.gserviceaccount.com \
     --member="serviceAccount:$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')@cloudbuild.gserviceaccount.com" \
     --role="roles/iam.serviceAccountUser"
   ```

3. **Deploy using Cloud Build:**
   ```bash
   gcloud builds submit --config docker/cloudbuild.yaml .
   ```

## 🔧 Configuration

### Environment Variables
- `NODE_ENV=production` - Set automatically in production
- `PORT` - Set by Cloud Run (defaults to 3000 for local)
- `HOSTNAME=0.0.0.0` - Allows external connections
- `NEXT_TELEMETRY_DISABLED=1` - Disables Next.js telemetry

### Cloud Run Settings
- **Memory**: 512Mi (adjustable based on needs)
- **CPU**: 1 vCPU (adjustable based on needs)
- **Max instances**: 10 (prevents runaway scaling)
- **Timeout**: 300 seconds
- **Port**: 3000

## 📊 Monitoring & Troubleshooting

### View Logs
```bash
# Real-time logs
gcloud logs tail --follow --resource-type cloud_run_revision \
  --resource-labels service_name=ai-room-simulator

# Recent logs
gcloud logs read --resource-type cloud_run_revision \
  --resource-labels service_name=ai-room-simulator --limit 50
```

### Health Check
The Docker image includes a health check that verifies:
- The application is responding on the correct port
- The API endpoints are functional
- The service is ready to handle requests

### Common Issues

1. **Build failures**: Check that all dependencies are properly listed in `package.json`
2. **Port issues**: Ensure the application listens on `process.env.PORT` or 3000
3. **Memory issues**: Increase memory allocation in Cloud Run if needed
4. **Cold starts**: Consider using Cloud Run's minimum instances feature for better performance

## 🔒 Security

- Application runs as non-root user (`nextjs`)
- Only necessary files included in final image
- Environment variables properly configured
- Health checks ensure service reliability

## 📈 Performance Optimization

- Multi-stage Docker build reduces image size
- Next.js standalone output minimizes dependencies
- Static assets served efficiently
- Proper caching headers configured

## 🆘 Support

For issues related to:
- **Docker build**: Check Dockerfile and .dockerignore configuration
- **Cloud Run deployment**: Verify gcloud authentication and project permissions
- **Application errors**: Check application logs and health check status
- **Performance**: Monitor Cloud Run metrics and adjust resources as needed

## 📝 Notes

- The application uses Next.js 14.2.29 with React 18
- API routes are included and work in the containerized environment
- The furniture catalog data is served from mock data in the `data/` directory
- Images are served from the `public/` directory
