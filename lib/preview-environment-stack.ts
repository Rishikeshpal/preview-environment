import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as certificatemanager from 'aws-cdk-lib/aws-certificatemanager';
// import * as s3Deployment from 'aws-cdk-lib/aws-s3-deployment';
// import * as cloudfrontOrigins from 'aws-cdk-lib/aws-cloudfront-origins';


class PreviewEnvironmentStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3 Bucket creation for hosting the builds
    const bucket = new s3.Bucket(this, 'Bucket', {
      websiteIndexDocument: 'index.html',
      publicReadAccess: false,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const certificate = certificatemanager.Certificate.fromCertificateArn(this, 'Certificate', wildcardCertificateArn);

    // CloudFront distribution
    const distribution = new cloudfront.CloudFrontWebDistribution(this, 'CloudFrontDistribution', {
      originConfigs: [{
        s3OriginSource: { s3BucketSource: bucket },
        behaviors: [{ isDefaultBehavior: true }],
      }],
      viewerCertificate: cloudfront.ViewerCertificate.fromAcmCertificate(certificate, {
        aliases: [`*.${domainName}`],
        sslMethod: cloudfront.SSLMethod.SNI,
        securityPolicy: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2019,
      }),
    });

    // Route53 alias record
    const hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
      hostedZoneId: hostedZoneId,
      zoneName: domainName,
    });

    new route53.ARecord(this, 'AliasRecord', {
      zone: hostedZone,
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
      recordName: `preview-feature1.${domainName}`,
    });

    new cdk.CfnOutput(this, 'DistributionId', { value: distribution.distributionId });
    new cdk.CfnOutput(this, 'DistributionDomainName', { value: distribution.distributionDomainName });
    new cdk.CfnOutput(this, 'BucketName', { value: bucket.bucketName });
    // output of newly created domain name
    new cdk.CfnOutput(this, 'DomainName', { value: `preview-feature1.${domainName}` });
  }
}

export { PreviewEnvironmentStack };