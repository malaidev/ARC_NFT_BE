from typing import Dict

from aws_cdk import core
from aws_cdk import aws_s3 as s3
from aws_cdk import aws_ecr as ecr
from aws_cdk import aws_iam as iam
import aws_cdk.aws_ssm as ssm
from aws_cdk import aws_codebuild as codebuild


class Base(core.Stack):
    def __init__(self, app: core.App, id: str, props: Dict, **kwargs) -> None:
        super().__init__(app, id, **kwargs)

        repository = ecr.Repository(self, "Repository", repository_name=props["namespace"])

        # pipeline requires versioned bucket
        bucket = s3.Bucket(
            self,
            "SourceBucket",
            bucket_name=f"{props['namespace'].lower()}-{self.region}-{core.Aws.ACCOUNT_ID}",
            versioned=True,
            removal_policy=core.RemovalPolicy.DESTROY,
        )

        build_role = iam.Role(
            self,
            "BuildRole",
            assumed_by=iam.ServicePrincipal("codebuild.amazonaws.com"),
        )

        self.add_policies(build_role)

        # codebuild project meant to run in pipeline
        build = codebuild.PipelineProject(
            self,
            "Build",
            cache=codebuild.Cache.local(codebuild.LocalCacheMode.DOCKER_LAYER, codebuild.LocalCacheMode.CUSTOM),
            project_name=f"{props['namespace']}-build",
            build_spec=codebuild.BuildSpec.from_object({
                "version": 0.2,
                "phases": {
                    "install": {
                        "runtime-versions": {
                            "nodejs": 14,
                            "python": 3.8
                        }
                    },
                    "pre_build": {
                        "commands": [
                            "echo '- PREBUILD PHASE-'",
                            "npm i -g aws-cdk",
                            # "npm install",
                            "pip3 install -U pip",
                            "pip3 install -r infrastructure/requirements.txt",
                            "aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com", # noqa
                        ]
                    },
                    "build": {
                        "commands": [
                            "echo 'POST-BUILD PHASE'",
                            # "npm test",
                            # "npm prune --production",
                            "VERSION=`node -e \"console.log(require('./package.json').version);\"`",
                            "docker build --build-arg AWS_REGION=$REGION --build-arg ACCOUNT_ID=$ACCOUNT_ID -t $TAG:$VERSION .",
                            "docker tag $TAG:$VERSION $ECR:$VERSION",
                            "docker push $ECR:$VERSION",
                        ]
                    },
                    "post_build": {
                        "commands": "cdk synth '*' -o ."
                    }
                },
                "artifacts": {
                    "files": [
                        "**/*"
                    ],
                    "exclude-paths": [
                        "node_modules/**/*"
                    ]
                },
                "cache": {"paths": ["/root/.npm/**/*", "/root/.cache/pip/**/*"]},
            }),
            environment=codebuild.BuildEnvironment(
                privileged=True,
                build_image=codebuild.LinuxBuildImage.STANDARD_5_0,
                compute_type=codebuild.ComputeType.MEDIUM,
            ),
            environment_variables={
                "TAG": codebuild.BuildEnvironmentVariable(value=props["namespace"]),
                "ECR": codebuild.BuildEnvironmentVariable(value=repository.repository_uri),
                "REGION": codebuild.BuildEnvironmentVariable(value=self.region),
                "ACCOUNT_ID": codebuild.BuildEnvironmentVariable(value=core.Aws.ACCOUNT_ID),
                "MONGODB_HOST": codebuild.BuildEnvironmentVariable(value=ssm.StringParameter.from_string_parameter_name(
                    self,"MongoDBHost",string_parameter_name="/depo/test/secret/mongo/host",).string_value),    
                "MONGODB_USER":codebuild.BuildEnvironmentVariable(value=ssm.StringParameter.from_string_parameter_name(
                    self,"MongoDBUser",string_parameter_name="/depo/test/secret/mongo/user",).string_value),              
                "MONGODB_PASSWORD": codebuild.BuildEnvironmentVariable(value=ssm.StringParameter.from_string_parameter_name(
                    self,"MongoDBPassword",string_parameter_name="/depo/test/secret/mongo/password",).string_value),
                "MONGODB_PORT": codebuild.BuildEnvironmentVariable(value="27017"),
                "JWT_SECRET": codebuild.BuildEnvironmentVariable(value=ssm.StringParameter.from_string_parameter_name(
                    self,"JwtSecret",string_parameter_name="/depo/test/secret/jwtsecret",).string_value),
                "EMAIL_SERVICE_API_KEY": codebuild.BuildEnvironmentVariable(value="e18e0072c4789d5930da01958cbb931d-2ac825a1-3deef25b"),
                "EMAIL_SERVICE_DOMAIN": codebuild.BuildEnvironmentVariable(value="mg.depo.io"),
                "KUCOIN_SERVICE_API_KEY": codebuild.BuildEnvironmentVariable(value=ssm.StringParameter.from_string_parameter_name(
                    self,"KucoinApiKey",string_parameter_name="/depo/test/secret/kucoin/apikey",).string_value),
                "KUCOIN_SERVICE_SECRET": codebuild.BuildEnvironmentVariable(value=ssm.StringParameter.from_string_parameter_name(
                    self,"KucoinSecret",string_parameter_name="/depo/test/secret/kucoin/secret",).string_value),
                "KUCOIN_SERVICE_PASSPHRASE": codebuild.BuildEnvironmentVariable(value=ssm.StringParameter.from_string_parameter_name(
                    self,"KucoinPasspharase",string_parameter_name="/depo/test/secret/kucoin/passpharase",).string_value),
            },
            description="Pipeline for CodeBuild",
            timeout=core.Duration.minutes(60),
            role=build_role,
        )

        # codebuild iam permissions to read write s3
        bucket.grant_read_write(build_role)

        repository.grant_pull_push(build_role)

        self.output_props = props.copy()
        self.output_props["build"] = build
        self.output_props["bucket"] = bucket

    # pass objects to another stack
    @property
    def outputs(self):
        return self.output_props

    def add_policies(self, role: iam.Role):
        """
        Utility function to give some permission to a input role
        """

        # give build permission to get secret
        role.add_to_policy(
            iam.PolicyStatement(
                actions=[
                    "secretsmanager:GetSecretValue",
                    "secretsmanager:DescribeSecret",
                ],
                resources=["*"],
            )
        )

        role.add_to_policy(iam.PolicyStatement(actions=["ssm:GetParameter"], resources=["*"]))

        role.add_to_policy(iam.PolicyStatement(actions=["cloudformation:*"], resources=["*"]))

        role.add_to_policy(iam.PolicyStatement(actions=["sts:AssumeRole"], resources=["*"]))

        # allow codebuild to pull/push images from/to any repository
        # this is needed because the base image in Dockerfile is a
        # ubuntu:20.04 image hosted in an ECR repository
        role.add_to_policy(
            iam.PolicyStatement(
                actions=[
                    "ecr:GetAuthorizationToken",
                    "ecr:BatchCheckLayerAvailability",
                    "ecr:GetDownloadUrlForLayer",
                    "ecr:GetRepositoryPolicy",
                    "ecr:DescribeRepositories",
                    "ecr:ListImages",
                    "ecr:DescribeImages",
                    "ecr:BatchGetImage",
                    "ecr:GetLifecyclePolicy",
                    "ecr:GetLifecyclePolicyPreview",
                    "ecr:ListTagsForResource",
                    "ecr:DescribeImageScanFindings",
                    "ecr:InitiateLayerUpload",
                    "ecr:UploadLayerPart",
                    "ecr:CompleteLayerUpload",
                    "ecr:PutImage",
                ],
                resources=["*"],
            )
        )
