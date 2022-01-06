locals {
    exampleMap = {
        foo = [1, 2, 3]
        bar = true
        tags = {
            "tag1": "tag1-value"
            "tag2": "tag2-value"
            "tag3": "tag3-value"
        }
    }
}

resource "time_static" "example_resource" {}

output "current_time" {
    value = time_static.example_resource.rfc3339
}

output "tags" {
    value = local.exampleMap.tags
}

output "complexMap" {
    value = local.exampleMap
}