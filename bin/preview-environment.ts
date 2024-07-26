#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { PreviewEnvironmentStack } from '../lib/preview-environment-stack';

const app = new cdk.App();
const environment = process.env['ENVIRONMENT']
const hostedZoneId = process.env['ZONE_ID']
const domainName = process.env['DOMAIN_NAME']
const wildcardCertificateArn = process.env['WILDCARD_CERTIFICATE_ARN']
const BRANCH_NAME = process.env['BRANCH_NAME']

new PreviewEnvironmentStack(app, 'PreviewEnvironmentStack', {
});