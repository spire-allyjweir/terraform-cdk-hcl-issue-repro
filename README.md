# terraform-cdk HCL module object output usage issue Reproduction

Following a conversation on the terraform-cdk pilot Slack channel, this repo
provides an example of an issue I ran into when trying to use an 'output' from
an HCL module later as part of a CDK-based resource.

[Original thread in the Slack here](<https://spire-general.slack.com/archives/C029B0RPB2P/p1640103327065100>)

To distil the issue:

1. Have an HCL module which exposes an object (aka map) as an output
2. Initialise the HCL module from CDK
3. Use the auto-generated 'Output' suffixed properties on the HCL module's
   constant within a CDK resource's initialisation where the type expected is
   not a string. The example I use on `main.ts:52` is:
       ```{ [key: string]: string; } | IResolvable | undefined```
4. Try to run `cdktf deploy` at which point it will error.

To see the issue in more detail, we can inspect the synthesised JSON file in
`cdktf.out/stacks/terraform-cdk-hcl-map-issue-repro/cdk.tf.json`. In the latest
synthesised file I have you can see the issue where the token is converted to a
map with each character being made its own number-indexed KV pair on line 53.
