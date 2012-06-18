<!--[if IE]>
<iframe id="yui-history-iframe" src="${url.context}/res/yui/history/assets/blank.html"></iframe>
<![endif]-->
<input id="yui-history-field" type="hidden" />

<#assign el=args.htmlid?html>
<script type="text/javascript">//<![CDATA[
  new Alfresco.ExportTool("${el}").setMessages(${messages});
//]]></script>

<div id="${el}-body" class="export">
  <div id="${el}-options" class="hidden">
    <form id="${el}-options-form" method="post" action="">
      <div class="title">${msg("label.options")}</div>

      <div class="row">
        <div class="label">${msg("label.package.name")}:</div>
        <div>
          <input id="${el}-package-name" type="text" name="package-name" value="" />
        </div>
      </div>

      <div class="row">
        <div class="label">${msg("label.source.space")}:</div>
        <div>
          <span id="${el}-source-path-field" name="sourcePathField" value=""></span>
          <button id="${el}-selectSource-button" tabindex="0">${msg("button.select")}</button>
          <input id="${el}-source-node" type="hidden" name="source-node" value="" />
        </div>
      </div>

      <div class="row">
        <div class="label">${msg("label.destination.space")}:</div>
        <div>
          <span id="${el}-destination-path-field" name="destinationPathField" value=""></span>
          <button id="${el}-selectDestination-button" tabindex="0">${msg("button.select")}</button>
          <input id="${el}-destination-node" type="hidden" name="destination-node" value="" />
        </div>
      </div>

      <div class="extended-row">
        <div class="label">${msg("label.include.child.spaces")}:</div>
        <div>
           <input type="checkbox" id="${el}-include-child-spaces" name="include-child-spaces" checked title="${msg('label.include.child.spaces')}" />
        </div>
      </div>

      <div class="extended-row">
        <div class="label">${msg("label.include.space")}:</div>
        <div>
          <input type="checkbox" id="${el}-include-space" name="include-space" title="${msg('label.include.space')}" />
        </div>
      </div>

      <div class="extended-row">
        <div class="label">${msg("label.run.in.background")}:</div>
        <div>
          <input type="checkbox" id="${el}-run-in-background" name="run-in-background" checked title="${msg('label.run.in.background')}" />
        </div>
      </div>

      <div class="export-note">
        <div>
          <p>${msg("label.export.info")}</p>
        </div>
      </div>

      <div class="apply">
        <button id="${el}-export-button" name="apply">${msg("button.export")}</button>
      </div>
    </form>
  </div>
</div>