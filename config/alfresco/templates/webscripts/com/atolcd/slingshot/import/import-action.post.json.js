/**
 * Import Archive Upload method
 *
 * @method POST
 * @param filedata {file}
 */

function main() {
  try {
    var archiveNode = null;
    if (json.has("archive-node")) {
      archiveNode = search.findNode(json.get("archive-node"));
    }

    var destinationSpace = null;
    if (json.has("destination-node")) {
      destinationSpace = search.findNode(json.get("destination-node"));
    }

    // create import action
    var importer = actions.create("import");
    importer.parameters.encoding = "UTF-8";
    importer.parameters.destination = destinationSpace;

    // execute action against the archive node, asynchronously or not
    if (json.has("run-in-background")) {
      importer.executeAsynchronously(archiveNode);
    } else {
      importer.execute(archiveNode);
    }

    status.code = 200;
  }
  catch (e) {
    status.code = 500;
    status.message = "Unexpected error occured during content extraction.";

    if (e.message && e.message.indexOf("org.alfresco.service.cmr.usage.ContentQuotaException") == 0) {
      status.code = 413;
      status.message = e.message;
    }
    status.redirect = true;
    return;
  }
}

main();