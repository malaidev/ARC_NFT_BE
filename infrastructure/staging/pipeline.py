from aws_cdk import (
    core,
    pipelines,
    aws_secretsmanager as sm,
    aws_codepipeline as codepipeline,
    aws_codepipeline_actions as actions,
)

from typing import Dict

from staging.backend import Stage


class Pipeline(core.Stack):
    def __init__(self, app: core.App, id: str, props: Dict, **kwargs) -> None:
        super().__init__(app, id, **kwargs)

        self.namespace = props["namespace"]

        # define the s3 artifact
        source_output = codepipeline.Artifact(artifact_name="source")
        build_output = codepipeline.Artifact(artifact_name="build")

        # define the pipeline
        pipeline = codepipeline.Pipeline(
            self,
            "Pipeline",
            pipeline_name=self.give_name("pipeline"),
            artifact_bucket=props["bucket"],
            stages=[
                codepipeline.StageProps(
                    stage_name="Source",
                    actions=[
                        actions.GitHubSourceAction(
                            oauth_token=sm.Secret.from_secret_name_v2(
                                self, "GithubSecret", secret_name="github-token-v2"
                            ).secret_value,
                            output=source_output,
                            owner="DePo-io",
                            repo="elint-backend-mvp",
                            branch="staging",
                            action_name="Source",
                            variables_namespace="GitSourceVariables"
                        )
                    ],
                ),
                codepipeline.StageProps(
                    stage_name="Approval",
                    actions=[
                        actions.ManualApprovalAction(                            
                            additional_information="Need your approval to build...!",
                            # external_entity_link="#{GitSourceVariables.ImageURI}",
                            notify_emails=["henry@depo.io" ],
                            action_name=self.give_name("approvebuild"),   
                            run_order=1 
                        ),
                    ],
                ),                
                codepipeline.StageProps(
                    stage_name="Build",
                    actions=[
                        actions.CodeBuildAction(
                            action_name=self.give_name("build"),
                            input=source_output,
                            project=props["build"],
                            run_order=2,
                            outputs=[build_output],
                        ),
                    ],
                ),
                codepipeline.StageProps(
                    stage_name="ApprovalDeploy",
                    actions=[
                        actions.ManualApprovalAction(                            
                            additional_information="Need your approval to DEPLOY...!",
                            # external_entity_link="#{GitSourceVariables.ImageURI}",
                            notify_emails=["henry@depo.io" ],
                            action_name=self.give_name("approvedeploy"),   
                            run_order=3,
                            variables_namespace="ApprovalVariables"
                        ),
                    ],
                ),   
            ],
        )

        # give pipeline role read write to the bucket
        props["bucket"].grant_read_write(pipeline.role)

        cdk_pipeline = pipelines.CdkPipeline(
            self,
            "CDKPipeline",
            cloud_assembly_artifact=build_output,
            code_pipeline=pipeline,
        )
        cdk_pipeline.add_application_stage(Stage(self, self.give_name("stage"), props, **kwargs))

    def give_name(self, name: str) -> str:
        return f"{self.namespace}-{name}-staging"
