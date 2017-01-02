
define([
  'cdf/AddIn',
  'cdf/Dashboard.Bootstrap',
  'cdf/lib/jquery',
  'cdf/lib/CCC/cdo'
], function(AddIn, Dashboard, $, cdo) {
  
  var treeColumn = new AddIn({
    name: "treeColumn",
    label: "Tree Column",

    defaults: {
      cssClass: "tree-col-container",
      layout: '<div></div>'
    },

    init: function(a) {},

    implementation: function(tgt, st, opt) {
      var data = st.value,
          options = {
            comp : null
          };

      for(key in opt) if(opt.hasOwnProperty(key)) {
        op = opt[key];
        options[key] = typeof op === 'function' ? op.call(this, st, opt) : op;
      }

      var map = options["comp"]["treeMap"],
          compData = data.substring(data.indexOf("].[")+2),
          item = map[compData]

      if (typeof item === "undefined")
        return;

      $(tgt)
        .empty()
        .html(item["label"]);

      $(tgt).parent().addClass(item["class"])
      if(item["isRoot"] === false)
        $(tgt).parent().addClass( "treegrid-parent-" + map[item["parent"]].id );

    }
  });

  Dashboard.registerGlobalAddIn("Table", "colType", treeColumn);

  return treeColumn;
});
