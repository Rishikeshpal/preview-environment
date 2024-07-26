# Welcome to Preview Environment CDK TypeScript project
This repository contains the steps to create a preview environment in AWS using Route 53, CloudFront, S3, AWS Certificates, GitHub Actions, and AWS CDK. The goal is to set up an environment similar to Vercel's preview environment concept, allowing for automatic previews of branches or pull requests.

# Prerequisites
```
AWS account with necessary permissions.
AWS CDK2 installed and configured.
GitHub repository with appropriate permissions and access.
Pre-existing Route 53 hosted zone.
Wildcard certificate in AWS Certificate Manager (ACM).
Basic knowledge of AWS services and GitHub Actions.
```

# Architecture Overview
```
Route 53: Manage DNS records for the preview environments.
CloudFront: Distribute content globally with low latency.
S3: Host the static website content.
AWS Certificates: Secure the content with HTTPS.
GitHub Actions: Automate the deployment and cleanup process.
AWS CDK2: Define and deploy AWS infrastructure as code.
```

# Pull request Deploy
The first action is triggered when you open a pull request. This deployment will create all the resources for the environment.

The destroy action is triggered when you close the pull request. The closed event is also emitted after the pull request is merged. This action ensures that your preview environment is destroyed on AWS.