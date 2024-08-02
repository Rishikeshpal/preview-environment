
import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront'
import * as route53 from 'aws-cdk-lib/aws-route53'
import * as targets from 'aws-cdk-lib/aws-route53-targets'
import * as certificatemanager from 'aws-cdk-lib/aws-certificatemanager'
// import * as s3Deployment from 'aws-cdk-lib/aws-s3-deployment';
import * as cloudfrontOrigins from 'aws-cdk-lib/aws-cloudfront-origins'

interface PreviewEnvironmentStackProps extends cdk.StackProps {
  environment: string
  hostedZoneId: string
  domainName: string
  wildcardCertificateArn: string
  branchName: string
}

class PreviewEnvironmentStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: PreviewEnvironmentStackProps) {
    const { environment, hostedZoneId, domainName, wildcardCertificateArn, branchName } = props

    super(scope, id, props)

    // S3 Bucket creation for hosting the builds
    const bucket = new s3.Bucket(this, 'Bucket', {
      bucketName: `preview-${branchName}`,
      websiteIndexDocument: 'index.html',
      publicReadAccess: false,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true
    })

    const certificate = certificatemanager.Certificate.fromCertificateArn(
      this,
      'Certificate',
      wildcardCertificateArn
    )

    // CloudFront distribution
    const distribution = new cloudfront.Distribution(this, 'CloudFrontDistribution', {
      defaultBehavior: {
        origin: new cloudfrontOrigins.S3Origin(bucket),
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS
      },
      domainNames: [`*.${domainName}`],
      certificate: certificate,
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2019,
      comment: branchName
    })

    // Route53 alias record
    const hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
      hostedZoneId: hostedZoneId,
      zoneName: domainName
    })

    new route53.ARecord(this, 'AliasRecord', {
      zone: hostedZone,
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
      recordName: `${branchName}.${domainName}`
    })

    new cdk.CfnOutput(this, 'DistributionId', { value: distribution.distributionId })
    new cdk.CfnOutput(this, 'DistributionDomainName', {
      value: distribution.distributionDomainName
    })
    new cdk.CfnOutput(this, 'BucketName', { value: bucket.bucketName })
    // output of newly created domain name
    new cdk.CfnOutput(this, 'DomainName', { value: `${branchName}.${domainName}` })
  }
}

export { PreviewEnvironmentStack }
