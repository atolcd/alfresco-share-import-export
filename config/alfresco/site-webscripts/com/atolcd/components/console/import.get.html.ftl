<!--[if IE]>
<iframe id="yui-history-iframe" src="${url.context}/res/yui/history/assets/blank.html"></iframe>
<![endif]-->
<input id="yui-history-field" type="hidden" />

<#assign el=args.htmlid?html>
<script type="text/javascript">//<![CDATA[
  new Alfresco.ImportTool("${el}").setMessages(${messages});
//]]></script>

<div id="${el}-body" class="import">
  <div id="${el}-options" class="hidden">
    <form id="${el}-options-form" method="post" action="">
      <div class="title">${msg("label.options")}</div>

      <div class="row">
        <div class="label">${msg("label.space")}:</div>
        <div>
          <span id="${el}-destination-path-field" name="destinationPathField" value=""></span>
          <button id="${el}-selectDestination-button" tabindex="0">${msg("button.select")}</button>
          <input id="${el}-destination-node" type="hidden" name="destination-node" value="" />
        </div>
      </div>

      <div class="row">
        <div class="label">${msg("label.archive")}:</div>
        <div>
          <span id="${el}-archive-path-field" name="archivePathField" value=""></span>
          <button id="${el}-upload-button" name="upload">${msg("button.upload.archive")}</button>
          <input id="${el}-archive-node" type="hidden" name="archive-node" value="" />
        </div>
      </div>

      <div class="last-row">
        <div class="label">${msg("label.run.in.background")}:</div>
        <div>
          <input type="checkbox" id="${el}-run-in-background" name="run-in-background" checked title="${msg('label.run.in.background')}" />
        </div>
      </div>

      <div class="import-note">
        <div>
          <p>${msg("label.import.info")}</p>
        </div>
      </div>

      <div class="apply">
        <button id="${el}-import-button" name="apply">${msg("button.import")}</button>
      </div>
    </form>
  </div>
</div>