#!/usr/bin/env python3
from aws_cdk import core as cdk

from base import Base as BaseStack
from staging.pipeline import Pipeline as StagingPipeline

common_tags = {"Application": "depo-backend", "project": "Depo"}

namespace = common_tags["Application"]
props = {"namespace": namespace}
account = "927228102540"

virginia = cdk.Environment(account=account, region="us-east-1")

seoul = cdk.Environment(account=account, region="ap-northeast-2")

frankfurt = cdk.Environment(
    account=account,
    region="eu-central-1",
)

sydney = cdk.Environment(account=account, region="ap-southeast-2")

ireland = cdk.Environment(
    account=account,
    region="eu-west-1",
)


app = cdk.App()

base_stack_virginia = BaseStack(app, f"{namespace}-base-virginia", props=props, env=virginia)
base_stack_seoul = BaseStack(app, f"{namespace}-base-seoul", props=props, env=seoul)
base_stack_frankfurt = BaseStack(app, f"{namespace}-base-frankfurt", props=props, env=frankfurt)
base_stack_sydney = BaseStack(app, f"{namespace}-base-sydney", props=props, env=sydney)
base_stack_ireland = BaseStack(app, f"{namespace}-base-ireland", props=props, env=ireland)

# Staging
pipeline = StagingPipeline(app, f"{props['namespace']}-pipeline-staging", base_stack_ireland.outputs, env=ireland, tags=common_tags)
pipeline.add_dependency(base_stack_ireland)

app.synth()
