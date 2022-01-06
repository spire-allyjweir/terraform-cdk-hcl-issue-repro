import { Construct } from "constructs";
import { App, TerraformStack, Fn } from "cdktf";
import { HclExampleModule } from "./.gen/modules/hcl_example_module";
import { File } from '@cdktf/provider-local';
import { KubernetesProvider, NetworkPolicy } from "@cdktf/provider-kubernetes";

class MyStack extends TerraformStack {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    const exampleModule = new HclExampleModule(this, 'example-module');

    // This is an example of the outputs from the HCL module being used
    // successfully.
    new File(this, 'known-good-example', {
      filename: '/Users/allyweir/workspace/terraform-cdk-hcl-map-issue-repro/hcl-module-output-map', // TODO: Switch to relevant path for you
      
      // NOTE: Had to switch from JSON.stringify() to Fn.jsonencode() to use an object from HCL-based TF output successfully
      content: Fn.jsonencode({
        "time": exampleModule.currentTimeOutput,
        "tags": exampleModule.tagsOutput
      })
    });

    new KubernetesProvider(this, 'kube', {
      configPath: "~/.kube/config",
      configContext: "TO_BE_REPLACED"  // TODO: Switch in a value that works for your local setup
    })

    // This is the object that I identified the issue with. Specifically when
    // specifying the podSelectors.
    new NetworkPolicy(this, 'server', {
      metadata: {
        name: "test-policy",
        namespace: "default"
      },
      spec: {
        policyTypes: ['Ingress'],
        podSelector: {
          matchExpressions: [
            {
              key: 'app.kubernetes.io/instance',
              operator: 'In',
              values: ["testInstance"]
            },
          ]
        },
        ingress: [
          {
            ports: [{ port: '8080', protocol: 'TCP' }],
            from: [{
              podSelector: { matchLabels: Fn.tomap(exampleModule.tagsOutput) },  // NOTE: This is the problematic line
              namespaceSelector: { matchLabels: { name: "other-namespace" } },
            }]
          },
        ],
      }
    })
  }
}

const app = new App({skipValidation:true});
new MyStack(app, "terraform-cdk-hcl-map-issue-repro");
app.synth();
