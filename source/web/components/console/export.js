/**
 * ExportTool tool component.
 *
 * @namespace Alfresco
 * @class Alfresco.ExportTool
 */
(function()
{
  /** YUI Library aliases **/
  var Dom = YAHOO.util.Dom;

  /** Alfresco Slingshot aliases **/
  var $hasEventInterest = Alfresco.util.hasEventInterest;

  /**
   * ExportTool constructor.
   *
   * @param {String} htmlId The HTML id üof the parent element
   * @return {Alfresco.ExportTool} The new ExportTool instance
   * @constructor
   */
  Alfresco.ExportTool = function(htmlId)
  {
    this.name = "Alfresco.ExportTool";
    Alfresco.ExportTool.superclass.constructor.call(this, htmlId);

    this.widgets.sourceDialog = null;
    this.widgets.destinationDialog = null;

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
        parent.widgets.exportButton = Alfresco.util.createYUIButton(parent, "export-button", null, {
          type: "submit"
        });

        parent.widgets.selectDestinationButton = Alfresco.util.createYUIButton(parent, "selectDestination-button", parent.onSelectSpaceClick);
        parent.widgets.selectSourceButton = Alfresco.util.createYUIButton(parent, "selectSource-button", parent.onSelectSpaceClick);
        parent.widgets.destinationPathField = Dom.get(parent.id + "-destination-path-field");
        parent.widgets.destinationNodeField = Dom.get(parent.id + "-destination-node");
        parent.widgets.sourcePathField = Dom.get(parent.id + "-source-path-field");
        parent.widgets.sourceNodeField = Dom.get(parent.id + "-source-node");

        YAHOO.Bubbling.on("folderSelected", parent.onDestinationSelected, parent);

        // Form definition
        var htmlForm = Dom.get(parent.id + '-options-form');
        htmlForm.setAttribute("action", Alfresco.constants.PROXY_URI + "slingshot/export/create-action");

        parent.form = new Alfresco.forms.Form(parent.id + "-options-form");

        // Form field validation
        parent.form.addValidation(parent.id + "-package-name", Alfresco.forms.validation.mandatory, null, "blur");
        parent.form.addValidation(parent.id + "-package-name", Alfresco.forms.validation.nodeName, null, "keyup");
        parent.form.addValidation(parent.id + "-package-name", Alfresco.forms.validation.length, {
           min: 1,
           max: 100,
           crop: true,
           includeWhitespace: false
        }, "keyup");

        parent.form.addValidation(parent.id + "-source-node", Alfresco.forms.validation.length, {
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

        parent.form.setSubmitElements([parent.widgets.exportButton]);
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
        parent.widgets.exportButton.set("disabled", true);

        if (!p_config.dataObj["run-in-background"]) {
          // Display a spinning export message to the user
           this.widgets.feedbackMessage = Alfresco.util.PopupManager.displayMessage({
              text: parent.msg("message.exporting"),
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
        Dom.get(parent.id + "-package-name").value = "";
        parent.widgets.sourceNodeField.value = "";
        parent.widgets.sourcePathField.innerHTML = "";
        parent.widgets.destinationNodeField.value = "";
        parent.widgets.destinationPathField.innerHTML = "";
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
      }
    });
    new OptionsPanelHandler();

    return this;
  };

  YAHOO.extend(Alfresco.ExportTool, Alfresco.ConsoleTool, {
    /**
     * Dialog select destination button event handler
     *
     * @method onSelectSpaceClick
     * @param e
     *            {object} DomEvent
     * @param p_obj
     *            {object} Object passed back from addListener method
     */
    onSelectSpaceClick: function OptionsPanel_onSelectSpaceClick(e, p_obj)
    {
      if (p_obj == this.widgets.selectSourceButton) {
        // Select source space
        this.widgets.sourceDialog = this.initSelectDialog(this.widgets.sourceDialog, 'selectSource', this.widgets.sourceNodeField);
        this.widgets.sourceDialog.showDialog();
      } else {
        // Select destination space
        this.widgets.destinationDialog = this.initSelectDialog(this.widgets.destinationDialog, 'selectDestination', this.widgets.destinationNodeField);
        this.widgets.destinationDialog.showDialog();
      }
    },

    /**
     * Init initSelectDialog
     *
     * @method initSelectDialog
     * @param dialogName
     *            {object} dialog box
     * @param dialogId
     *            {String} Object passed back from addListener method
     * @param field
     *            {object} Object
     */
    initSelectDialog: function OptionsPanel_initSelectDialog(dialog, dialogId, field)
    {
      // Set up select destination dialog
      if (!dialog) {
        dialog = new Alfresco.module.DoclibGlobalFolder(this.id + '-' + dialogId);
        var allowedViewModes = [ Alfresco.module.DoclibGlobalFolder.VIEW_MODE_REPOSITORY ];

        dialog.setOptions(
        {
           allowedViewModes: allowedViewModes,
           siteId: this.options.siteId,
           containerId: this.options.containerId,
           title: this.msg("title.destinationDialog"),
           nodeRef: "alfresco://company/home"
        });
      }

      // Make sure correct path is expanded
      var pathNodeRef = field.value;
      dialog.setOptions(
      {
        pathNodeRef: pathNodeRef ? new Alfresco.util.NodeRef(pathNodeRef) : null
      });

      return dialog;
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
      if ($hasEventInterest(this.widgets.destinationDialog, args)) {
        var obj = args[1];
        if (obj !== null) {
           this.widgets.destinationNodeField.value = obj.selectedFolder.nodeRef;
           this.widgets.destinationPathField.innerHTML = obj.selectedFolder.path;
        }
      } else if ($hasEventInterest(this.widgets.sourceDialog, args)) {
        var obj = args[1];
        if (obj !== null) {
          this.widgets.sourceNodeField.value = obj.selectedFolder.nodeRef;
          this.widgets.sourcePathField.innerHTML = obj.selectedFolder.path;
        }
      }
      this.form.updateSubmitElements();
    }
  });
})();