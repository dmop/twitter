
define([
  'cdf/AddIn',
  'cdf/Dashboard.Bootstrap',
  'cdf/lib/jquery',
  'cdf/lib/CCC/cdo'
], function(AddIn, Dashboard, $, cdo) {

  $.fn.outerHTML = function() {
    if(this === null) return "";
    return (this[0]) ? this[0].outerHTML : '';
  };

  var numPercentIcon = new AddIn({
    name: "numPercentIcon",
    label: "Number, Percent and icon",

    defaults: {
      type: "ink",
      showNumber: true,
      showPercent: true,
      percentLabel : "",
      numberFormat : "#,##0.00",
      percentFormat : "#,##0.00%",
      percentSuffix : "",
      emptyNumberValue : 0,
      compareFunction : function(val, st){
          return val === 0 || val === null ? "neutral" : val > 0 ? "good":"bad";
      }
    },

    init: function() { },

    implementation: function(tgt, st, opt) {

      var data = st.value,
          options = {
            type : "ink"
          },
          baseSpan = "<span></span>",
          key, op, content="",
          numContent=$(baseSpan),
          percentContent=$(baseSpan),
          arrowContent=$(baseSpan),
          valNum = data !== null && typeof data === "object" ? data[0] : data,
          varPer = data !== null && typeof data === "object" ? data[1] : data;

      for(key in opt) if(opt.hasOwnProperty(key) && key!=="compareFunction") {
        op = opt[key];
        options[key] = typeof op === 'function' ? op.call(this, st, opt) : op;
      }
      var compare = opt.compareFunction;
      var icon = compare(varPer, st)==="neutral" ? "stop"
                     : compare(varPer, st)==="good" ? "arrow_upward"
                     : "arrow_downward";


      var isArrow = options.type === "arrow"

      if(isArrow){
        //TODO: Strong dependency on font-awesome
        arrowContent.addClass("material-icons "+icon).html(icon);
      }

      var num = cdo.format.language('pt-br').createChild().number({mask: options.numberFormat});
      var per = cdo.format.language('pt-br').createChild().number({mask: options.percentFormat});

      if(options.showNumber){
        numContent.addClass("num").html(  valNum === null ? options.emptyNumberValue : num.number()(valNum));
      }

      if(options.showPercent){
        percentContent
          .addClass("perc "+options.type+" "+icon)
          .append(
            $(options.showNumber ? "<small></small>" : "<span class='num'></span>")
            .html(   (varPer === null ? " - " : per.number()(varPer)) +
                    " "+options.percentSuffix  )
          );

      }


      content = numContent.outerHTML() +
                  (options.showNumber && options.showPercent ? "<br>" : "") +
                  percentContent.outerHTML() +
                  arrowContent.outerHTML();

      $(tgt)
        .empty()
        .html(content);

    }
  });

  Dashboard.registerGlobalAddIn("Table", "colType", numPercentIcon);

  return numPercentIcon;
});
