#!/usr/bin/env python3
from aws_cdk import core as cdk

from base import Base as BaseStack
from production.pipeline import Pipeline as ProductionPipeline
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

# Production
pipeline_virginia = ProductionPipeline(app, f"{props['namespace']}-pipeline-virginia", base_stack_virginia.outputs, env=virginia, tags=common_tags)
pipeline_virginia.add_dependency(base_stack_virginia)
pipeline_seoul = ProductionPipeline(app, f"{props['namespace']}-pipeline-seoul", base_stack_seoul.outputs, env=seoul, tags=common_tags)
pipeline_seoul.add_dependency(base_stack_seoul)
pipeline_frankfurt = ProductionPipeline(app, f"{props['namespace']}-pipeline-frankfurt", base_stack_frankfurt.outputs, env=frankfurt, tags=common_tags)
pipeline_frankfurt.add_dependency(base_stack_frankfurt)
pipeline_sydney = ProductionPipeline(app, f"{props['namespace']}-pipeline-sydney", base_stack_sydney.outputs, env=sydney, tags=common_tags)
pipeline_sydney.add_dependency(base_stack_sydney)
pipeline_ireland = ProductionPipeline(app, f"{props['namespace']}-pipeline-ireland", base_stack_ireland.outputs, env=ireland, tags=common_tags)
pipeline_ireland.add_dependency(base_stack_ireland)

# Staging
pipeline = StagingPipeline(app, f"{props['namespace']}-pipeline-ireland-staging", base_stack_ireland.outputs, env=ireland, tags=common_tags)
pipeline.add_dependency(base_stack_ireland)

app.synth()
