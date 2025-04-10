# SST Stacks

This directory contains the infrastructure as code definitions for Desirable v3.0 using SST (Serverless Stack). The stacks define all AWS resources needed to run the application.

## Stack Structure

```
stacks/
├── ApiStack.ts           # API Gateway and Lambda functions
├── MediaStack.ts         # S3, CloudFront, and media processing
├── DatabaseStack.ts      # MongoDB Atlas and connection management
├── AuthStack.ts          # Auth0 integration and JWT handling
└── WebStack.ts           # Frontend deployment and hosting
```

## Infrastructure Components

### API Stack
- API Gateway endpoints
- Lambda functions for each API route
- IAM roles and permissions
- CloudWatch logging
- X-Ray tracing

### Media Stack
- S3 buckets for media storage
- CloudFront distribution
- Lambda functions for media processing
- SQS queues for processing tasks
- SNS topics for notifications

### Database Stack
- MongoDB Atlas cluster
- Connection management
- Backup configuration
- Monitoring setup

### Auth Stack
- Auth0 application configuration
- JWT validation
- User management
- Role-based access control

### Web Stack
- S3 bucket for static hosting
- CloudFront distribution
- Route53 DNS configuration
- SSL certificate management

## Deployment Process

### Prerequisites
1. AWS CLI configured
2. SST CLI installed
3. Required environment variables set
4. Auth0 account configured
5. MongoDB Atlas account set up

### Environment Setup
```bash
# Install SST CLI
npm install -g sst

# Configure AWS credentials
aws configure

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration
```

### Deployment Commands
```bash
# Deploy all stacks
pnpm deploy

# Deploy specific stack
pnpm deploy --stack ApiStack

# Remove all stacks
pnpm remove

# Start local development
pnpm dev
```

## Resource Configuration

### API Gateway
```typescript
const api = new ApiGatewayV2Api(stack, "Api", {
  cors: {
    allowOrigins: ["*"],
    allowMethods: ["GET", "POST", "PUT", "DELETE"],
    allowHeaders: ["*"],
  },
  routes: {
    "GET /v3.0/media": "packages/api/src/handlers/media/list.handler",
    "POST /v3.0/media": "packages/api/src/handlers/media/upload.handler",
    // ... other routes
  },
});
```

### S3 Buckets
```typescript
const mediaBucket = new Bucket(stack, "MediaBucket", {
  cors: true,
  cdk: {
    bucket: {
      lifecycleRules: [
        {
          expiration: cdk.aws_s3.LifecycleRule.DEFAULT_EXPIRATION,
        },
      ],
    },
  },
});
```

### Lambda Functions
```typescript
const mediaProcessor = new Function(stack, "MediaProcessor", {
  handler: "packages/api/src/handlers/media/process.handler",
  timeout: 300,
  environment: {
    BUCKET_NAME: mediaBucket.bucketName,
  },
});
```

## Environment Variables

### Required Variables
```env
AWS_REGION=us-east-1
AWS_PROFILE=default
STAGE=dev
MONGODB_URI=mongodb+srv://...
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
```

### Optional Variables
```env
ENABLE_XRAY=true
ENABLE_LOGGING=true
BACKUP_RETENTION_DAYS=7
```

## Monitoring and Logging

### CloudWatch
- API Gateway logs
- Lambda function logs
- S3 access logs
- CloudFront logs

### X-Ray
- Request tracing
- Performance monitoring
- Error tracking
- Dependency mapping

### Custom Metrics
- API response times
- Error rates
- Media processing times
- Storage usage

## Security

### IAM Policies
- Least privilege principle
- Role-based access
- Resource-based policies
- Cross-account access

### Network Security
- VPC configuration
- Security groups
- NACLs
- WAF rules

### Data Protection
- Encryption at rest
- Encryption in transit
- Key management
- Backup policies

## Cost Management

### Resource Optimization
- Lambda memory allocation
- S3 lifecycle rules
- CloudFront caching
- Database scaling

### Monitoring
- Cost alerts
- Usage tracking
- Budget management
- Resource cleanup

## Troubleshooting

### Common Issues
1. Deployment failures
2. Resource conflicts
3. Permission issues
4. Configuration errors

### Debugging Tools
- SST console
- CloudWatch logs
- X-Ray traces
- AWS CLI

## Related Documentation

- [SST Documentation](https://docs.sst.dev/)
- [AWS Documentation](https://docs.aws.amazon.com/)
- [API Module](../packages/api/README.md)
- [Media Module](../packages/api/src/files/README.md) 