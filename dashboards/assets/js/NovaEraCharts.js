define([
  "cdf/lib/jquery",
  "cdf/lib/CCC/protovis-compat!",
  'cdf/dashboard/Utils'
],
  function ($, pv, Utils) {

    console.log("[NovaEraChartrs] Module loaded");

    var jiraiya = {};

    jiraiya.baseColors = function(){
      var cd = this.chartDefinition;
      cd.colors = [
        "#FF5252",
        "#42A5F5",
        "#607D8B",
        "#90A4AE",
        "#CFD8DC",
        "#4E342E",
        "#6D4C41",
        "#8D6E63",
        "#BCAAA4"
      ];
    };

    jiraiya.barChartBasics = function() {

      var cd = this.chartDefinition;
      jiraiya.baseColors.apply(this);

      cd["dimensions"] = { value: { formatter: function(value) {
                  return Utils.numberFormat(value, "#,##0", "pt-br");
      } } };


      cd.valuesFont = "14px Open Sans";
      cd.valuesOptimizeLegibility =  true;


      // Title
      cd.titleFont = "12px Open Sans";
      cd.titleLabel_textStyle = "#343E47";
      cd.titleMargins = "0 0 0 0";

      cd.label_textMargin = 5;

      cd.contentMargins = "20 0 0 0";


      cd.plotFrameVisible = false;
      // cd.baseAxisVisible =false;
      cd.orthoAxisVisible =false;
      cd.baseAxisRule_strokeStyle="transparent";
      cd.baseAxisFont="12px Open Sans";


      cd.legend = true;
      cd.legendPosition = "top";
      cd.legendAlign = "right";
      cd.legendFont = "12px Open Sans";
      cd.legendLabel_textStyle = "#343E47";
      cd.legendShape = 'circle';
      cd.legendItemPadding = 10;
      jiraiya.totalOverStacked.apply(this);

    }

    jiraiya.totalOverStacked = function(){
      var cd = this.chartDefinition;

      cd.plots = [ {
              type: 'point',
              colorAxis: 2,
              dotsVisible:   true,
              valuesVisible: true,
              valuesAnchor: 'top',
              visualRoles: {
                  series: "empty",
                  color:  {from: 'series'}
              },
              dot_shape: 'bar',
              dot_shapeAngle: -Math.PI/2,
              //dot_strokeStyle: null,
              dot_shapeSize: function() {
                  var diam = this.chart.plotPanels.bar.barWidth ||
                      this.chart.options.barSizeMax;

                  return this.finished(diam);
              }
          }
      ];
    }

    // setting to add to bar charts which have labels over the bars
    jiraiya.barChartLabel = function() {
      var cd = this.chartDefinition;
            cd["dimensions"] = { value: { formatter: function(value) {
                        return Utils.numberFormat(value, "#,##0.00", "pt-br");
            } } };
      cd.label_textStyle = "#343E47";
      cd.titleFont = "14px Open Sans";

      jiraiya.barChartBasics.apply(this);

      cd.label_call = function() {
          // Add a label below the value label to show the category
          this.add(pv.Label)
              .font('lighter 12px "Open Sans"')
              .text(function(s){ return s.getSeriesLabel(); })
              .textBaseline('bottom')
              .textStyle('#676767')
              .textMargin(22);
      };

      cd.label_textBaseline = "bottom";
      cd.valuesAnchor =  "top";

      // Values
      cd.valuesVisible = true;

    }

    jiraiya.donutChart = function(){
      var cd = this.chartDefinition;
      jiraiya.baseColors.apply(this);

      cd["dimensions"] = { value: { formatter: function(value) {
                  return Utils.numberFormat(value, "#,##0.00", "pt-br");
      } } };


      cd.percentValueFormat = function(v) {
        return Utils.numberFormat(v, '#.00%',  'pt-br');
      }

      cd.animate = true;
      cd.tooltipEnabled = false;

      // Centered val
      cd.valuesVisible = true;
      cd.valuesLabelStyle = 'inside';
      cd.valuesFont = '24px Open Sans';
      cd.valuesMask = '{value.percent}';

      cd.label_visible = function() { return !this.index; };
      cd.label_left = null;
      cd.label_top = null;
      cd.label_textAngle = 0;
      cd.label_textAlign = 'center';
      cd.label_textBaseline = 'middle';
      cd.label_strokeStyle = 'black';
      cd.legend = false;

      cd.slice_fillStyle = function() {
      	return this.index === 0 ? this.delegate() : "#ddd";
      };

      cd.label_call = function() {
          // Add a label below the value label to show the category
          this.add(pv.Label)
              .font('lighter 12px "Open Sans"')
              .text(function(s){ return s.getCategoryLabel(); })
              .textBaseline('bottom')
              .textStyle('#676767')
              .textMargin(16);
      };

      cd.slice_innerRadiusEx = "80%";

    }

    jiraiya.deadlines = function(){

      var cd = this.chartDefinition;
      jiraiya.baseColors.apply(this);

      var seriesOrder = ["total", "partial"];

      var defin = {
          dimensions: {
            "category": {
              label: "Practice",
            },
            "series": {
              label: "Measure",
              isHidden: false,

              formatter: function(value) {
                switch(value) {
                  case "total":   return "Cadastrado";
                  case "partial": return "Realizado";
                }
                return value;
              },

              comparer: function(a, b) {
                return
                    seriesOrder.indexOf(a) -
                    seriesOrder.indexOf(b);
              }
            }
          },

          plots : [

            {
              name: "main",
              dataPart: "total",
              barSizeMax: 30
            },

            {
              type:      "bar",
              dataPart:  "partial",
              barSizeMax: 15
            }
          ],

          //Customization
          crosstabMode: true,
          orientation:"horizontal",
          plotFrameVisible : false,
          baseAxisVisible:false,
          orthoAxisVisible:false,
          dataPartRole: "series",
          valuesVisible:true,
          label_textBaseline:"top",
          valuesFont : "12px Open Sans",
          label_textStyle : "#343E47",
          valuesAnchor:"bottom",
          label_textAlign:"left",
          label_left:0,
          orthoAxisOffset: 0.02,
          animate: false,
          seriesInRows : false,

        	label_text : function(s){

            var realValue = this.chart.resultset[this.index][2];
          	return  s.getCategoryLabel() + ": "+
            				realValue + " / " + s.getValue()  ;
          },
          bar_fillStyle : function(s) {
            var seriesIdx = seriesOrder.indexOf(s.getSeries());
            return seriesIdx !== 0 ? this.delegate() : "#bbb";
          }

      };//def

      for(var key in defin){
        cd[key] = defin[key];
      }

    }

    jiraiya.pieChartSecondaryValue = function(){
      var cd = this.chartDefinition;
      var _tempCall = cd["label_call"];

      // Posicionamento da legenda para valor complementar
      cd.legend = true;
      cd.legendPosition = "bottom",
      cd.legendPaddings = 0;
      cd.legendMargins =  0;
      cd.legendItemPadding = 0 ;
      cd.legendItemSize =    {width:'100%'};
      cd.legendLabel_textAlign = "center";
      cd.legendLabel_font = "12px Open Sans";
      cd.legendLabel_textStyle = "#343E47";

      cd.legendDot_visible = false;

      // Visivel somente valor complementar
      cd.legendMarkerPanel_visible = function(s){
        return this.index!==0;
      }

      // Valor nominal complementar na legenda
      cd.legendLabel_text = function(s){
        var val = this.chart.resultset[this.index][1];
        var valForm = Utils.numberFormat(val, "#,##0.00", "pt-br");
        return s.value().label + ": " + valForm ;
      };

      // Posicionamento da legenda com o valor complementar
      cd.legendMarkerPanel_left = function(s){
        return (this.chart.width/2)-16;
      }

      // Valor nominal abaixo do percentual
      cd.label_call = function(s){
        var _this = this;
        if(typeof _tempCall !== "undefined"){
          _tempCall.apply(_this);
        }else{
          this.delegate();
        }
        this.add(pv.Label)
            .font('lighter 12px "Open Sans"')
            .text(function(s){ return s.getValueLabel(); })
            .textBaseline('top')
            .textStyle('#676767')
            .textMargin(16);
      }

    }

    function _toggleStacked(comp, buttonSel){
      $(buttonSel).off("click").click(function(e){
        console.log(comp);
        var newVN = $(this).text() === "equalizer" ? false : true;
        var newIC = newVN ? "equalizer" : "view_week";
        console.log(newVN, newIC);
        comp.chartDefinition["valuesNormalized"] = newVN;
        comp.update( /*bypassAnimation*/ true, /*recreate*/ true, /*reload*/ false);
        $(this).text(newIC);
      });
    }

    return {
      jiraiya : jiraiya,
      toggleStacked : _toggleStacked
    };

  }
);
