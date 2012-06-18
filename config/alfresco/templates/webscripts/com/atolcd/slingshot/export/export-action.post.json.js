/**
 * Export action method
 *
 * @method POST
 */

function main() {
  try {
    var packageName = "";
    if (json.has("package-name")) {
      packageName = json.get("package-name");
    }

    var sourceNode = null;
    if (json.has("source-node")) {
      sourceNode = search.findNode(json.get("source-node"));
    }

    var destinationNode = null;
    if (json.has("destination-node")) {
      destinationNode = search.findNode(json.get("destination-node"));
    }

    // create export action
    var exporter = actions.create("export");
    exporter.parameters['store'] = "workspace://SpacesStore";
    exporter.parameters['package-name'] = packageName;
    exporter.parameters['destination'] = destinationNode;
    exporter.parameters['include-children'] = json.has("include-child-spaces");
    exporter.parameters['include-self'] = json.has("include-space");
    exporter.parameters['encoding'] = "UTF-8";

     // execute export of the source space, asynchronously or not
    if (json.has("run-in-background")) {
      exporter.executeAsynchronously(sourceNode);
    } else {
      exporter.execute(sourceNode);
    }

    status.code = 200;
  }
  catch (e) {
    status.code = 500;
    status.message = "Unexpected error occured during export.";

    if (e.message && e.message.indexOf("org.alfresco.service.cmr.usage.ContentQuotaException") == 0) {
      status.code = 413;
      status.message = e.message;
    }
    status.redirect = true;
    return;
  }
}

main();