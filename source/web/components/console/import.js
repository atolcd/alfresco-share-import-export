/**
 * ImportTool tool component.
 *
 * @namespace Alfresco
 * @class Alfresco.ImportTool
 */
(function()
{
  /** YUI Library aliases **/
  var Dom = YAHOO.util.Dom,
      Event = YAHOO.util.Event;

  /** Alfresco Slingshot aliases **/
  var $hasEventInterest = Alfresco.util.hasEventInterest;

  /**
   * ImportTool constructor.
   *
   * @param {String} htmlId The HTML id üof the parent element
   * @return {Alfresco.ImportTool} The new ImportTool instance
   * @constructor
   */
  Alfresco.ImportTool = function(htmlId)
  {
    this.name = "Alfresco.ImportTool";
    this.extensions = "*.acp;*.zip";

    Alfresco.ImportTool.superclass.constructor.call(this, htmlId);

    /* Register this component */
    Alfresco.util.ComponentManager.register(this);

    /* Load YUI Components */
    Alfresco.util.YUILoaderHelper.require(["button", "container", "json", "history"], this.onComponentsLoaded, this);

    /* Define panel handlers */
    var parent = this;

    /* Options Panel Handler */
    OptionsPanelHandler = function OptionsPanelHandler_constructor()
    {
       OptionsPanelHandler.superclass.constructor.call(this, "options");
    };

    YAHOO.extend(OptionsPanelHandler, Alfresco.ConsolePanelHandler,
    {
      /**
       * Called by the ConsolePanelHandler when this panel shall be loaded
       *
       * @method onLoad
       */
      onLoad: function onLoad()
      {
        // Buttons
        parent.widgets.importButton = Alfresco.util.createYUIButton(parent, "import-button", null, {
          type: "submit"
        });

        parent.widgets.selectDestinationButton = Alfresco.util.createYUIButton(parent, "selectDestination-button", this.onSelectDestinationClick);
        parent.widgets.uploadArchive = Alfresco.util.createYUIButton(parent, "upload-button", this.onUpload);
        parent.widgets.destinationPathField = Dom.get(parent.id + "-destination-path-field");
        parent.widgets.destinationNodeField = Dom.get(parent.id + "-destination-node");
        parent.widgets.archivePathField = Dom.get(parent.id + "-archive-path-field");
        parent.widgets.archiveNode = Dom.get(parent.id + "-archive-node");

        YAHOO.Bubbling.on("folderSelected", this.onDestinationSelected, this);
        parent.widgets.uploadArchive.set("disabled", true);

        // Form definition
        var htmlForm = Dom.get(parent.id + '-options-form');
        htmlForm.setAttribute("action", Alfresco.constants.PROXY_URI + "slingshot/import/create-action");

        parent.form = new Alfresco.forms.Form(parent.id + "-options-form");
        parent.form.addValidation(parent.id + "-archive-node", Alfresco.forms.validation.length, {
           min: 60,
           max: 60
        }, "change");

        parent.form.addValidation(parent.id + "-destination-node", Alfresco.forms.validation.length, {
           min: 60,
           max: 60
        }, "change");

        // Intercept data just before AJAX submission
        parent.form.doBeforeAjaxRequest = {
          fn: this.doBeforeAjaxRequest,
          scope: this
        };

        parent.form.setSubmitElements([parent.widgets.importButton]);
        parent.form.setSubmitAsJSON(true);
        parent.form.setShowSubmitStateDynamically(true);
        parent.form.setAJAXSubmit(true, {
          successCallback: {
            fn: this.onSuccess,
            scope: this
          },

          failureCallback: {
            fn: this.onFailure,
            scope: this
          }
        });
        parent.form.init();
      },

      /**
       * Interceptor just before Ajax request is sent
       *
       * @method doBeforeAjaxRequest
       * @param p_config {object} Object literal containing request config
       * @return {boolean} True to continue sending form, False to prevent it
       */
      doBeforeAjaxRequest: function OptionsPanel_doBeforeAjaxRequest(p_config)
      {
        // disable export button
        parent.widgets.importButton.set("disabled", true);

        if (!p_config.dataObj["run-in-background"]) {
          // Display a spinning import message to the user
          this.widgets.feedbackMessage = Alfresco.util.PopupManager.displayMessage({
            text: parent.msg("message.importing"),
            spanClass: "wait",
            displayTime: 0
          });
        } else {
          this.widgets.feedbackMessage = null;
        }
        return true;
      },

      /**
       * Successfully applied options event handler
       *
       * @method onSuccess
       * @param response {object} Server response object
       */
      onSuccess: function OptionsPanel_onSuccess(response)
      {
        if (this.widgets.feedbackMessage) {
          this.widgets.feedbackMessage.destroy();

          Alfresco.util.PopupManager.displayPrompt({
            title: parent.msg("message.success.title"),
            text: parent.msg("message.success")
          });
        }

        // refresh fields
        parent.widgets.archiveNode.value = "";
        parent.widgets.destinationNodeField.value = "";
        parent.widgets.destinationPathField.innerHTML = "";
        parent.widgets.archivePathField.innerHTML = "";
        parent.widgets.uploadArchive.set("disabled", true);
      },

      /**
       * Failure handler
       *
       * @method onFailure
       * @param response {object} The response from the ajax request
       */
      onFailure: function OptionsPanel_onFailure(response)
      {
        if (this.widgets.feedbackMessage) {
          this.widgets.feedbackMessage.destroy();
        }

        parent.form.updateSubmitElements();

        Alfresco.util.PopupManager.displayPrompt({
          title: parent.msg("message.unknown-error.title"),
          text: parent.msg("message.unknown-error")
        });
      },

      /**
       * Upload button click handler
       *
       * @method onUpload
       * @param e {object} DomEvent
       * @param p_obj {object} Object passed back from addListener method
       */
      onUpload: function OptionsPanel_onUpload(e, p_obj)
      {
        if (!this.fileUpload) {
           this.fileUpload = Alfresco.getFileUploadInstance();
        }

        // Show uploader for single file select - override the upload URL to use appropriate upload service
        var uploadConfig = {
          mode: this.fileUpload.MODE_SINGLE_UPLOAD,
          destination: parent.widgets.destinationNodeField.value,
          filter: [{
            description: parent.msg("message.upload.description"),
            extensions: this.extensions
          }],
          onFileUploadComplete: {
            fn: this.onFileUploadComplete,
            scope: this
          }
        };
        this.fileUpload.show(uploadConfig);
        Event.preventDefault(e);
      },

      /**
       * Dialog select destination button event handler
       *
       * @method onSelectDestinationClick
       * @param e
       *            {object} DomEvent
       * @param p_obj
       *            {object} Object passed back from addListener method
       */
      onSelectDestinationClick: function OptionsPanel_onSelectDestinationClick(e, p_obj)
      {
        // Set up select destination dialog
        if (!this.widgets.destinationDialog) {
          this.widgets.destinationDialog = new Alfresco.module.DoclibGlobalFolder(this.id + "-selectDestination");
          var allowedViewModes = [ Alfresco.module.DoclibGlobalFolder.VIEW_MODE_REPOSITORY ];

          this.widgets.destinationDialog.setOptions({
            allowedViewModes: allowedViewModes,
            siteId: this.options.siteId,
            containerId: this.options.containerId,
            title: this.msg("title.destinationDialog"),
            nodeRef: "alfresco://company/home"
          });
        }

        // Make sure correct path is expanded
        var pathNodeRef = this.widgets.destinationNodeField.value;
        this.widgets.destinationDialog.setOptions({
          pathNodeRef: pathNodeRef ? new Alfresco.util.NodeRef(pathNodeRef) : null
        });

        // Show dialog
        this.widgets.destinationDialog.showDialog();
      },

      /**
       * Folder selected in destination dialog
       *
       * @method onDestinationSelected
       * @param layer
       *            {object} Event fired
       * @param args
       *            {array} Event parameters (depends on event type)
       */
      onDestinationSelected: function OptionsPanel_onDestinationSelected(layer, args)
      {
        // Check the event is directed towards this instance
        if ($hasEventInterest(parent.widgets.destinationDialog, args)) {
          var obj = args[1];
          if (obj !== null) {
            parent.widgets.destinationNodeField.value = obj.selectedFolder.nodeRef;
            parent.widgets.destinationPathField.innerHTML = obj.selectedFolder.path;
            parent.widgets.uploadArchive.set("disabled", false);
          }
        }

        parent.form.updateSubmitElements();
      }
    });
    new OptionsPanelHandler();

    return this;
  };

  YAHOO.extend(Alfresco.ImportTool, Alfresco.ConsoleTool,
  {
    /**
     * File Upload complete event handler
     *
     * @method onFileUploadComplete
     * @param complete {object} Object literal containing details of successful and failed uploads
     */
    onFileUploadComplete: function onFileUploadComplete(complete)
    {
      var success = complete.successful.length;
      if (success != 0) {
        var noderef = complete.successful[0].nodeRef,
            filePath = this.widgets.destinationPathField.innerHTML + '/' + complete.successful[0].fileName;
        // set noderef value in hidden field ready for options form submit
        this.widgets.archiveNode.value = noderef;
        this.widgets.archivePathField.innerHTML = filePath;

        this.form.updateSubmitElements();
      }
    }
  });
})();