/*
 * GLOBAL Callback Registration Example. Simply require 'analyzer/cv_api' to register callbacks
 */
require([ "analyzer/cv_api" ], function(apix) {

  // Only registers if into the dashboard
  if(window.top.location.href.includes("content/trf3/portal/index")){

      // Handles Analyzer Init
      apix.event.registerInitListener( function( e, cv ){

        var head = document.head,
            link = document.createElement('link')

        link.type = 'text/css'
        link.rel = 'stylesheet'
        link.href = "/pentaho/content/trf3/dashboards/assets/css/analyzer.css"
        head.appendChild(link)

      } ) ;



      // Handles layout update - to resize <iframe> on the dashboard
      cv.api.event.registerRenderListener(function(e, api, reportArea) {
        var height=$(reportArea).find(".pivotTableScrollbars > div").css("height");
        $("iframe[name='"+window.frameElement.getAttribute("Name")+"']",
        top.window.document)
          .css("height", height);

        $("td[formula='[Regiao].[Filial]']").each(function(index, element){

          if($(element).attr("type") !== "attribute" ){

              $(element).find("div").attr("title", null);
              $(element).attr("title", "Ver no mapa "/*+
                _getMemberName( $(element).attr("member") )*/);
              $(element).tipsy({
                gravity : "w",
                fade:true,
                html:false,
                className : "trf3-tipsy"
              });

          }// end if

        });

      });




      //Handles click
      apix.event.registerTableClickListener(function(e, api, td, ctx, filterCtx) {
        var type = td.getAttribute("type");
        var formula  = td.getAttribute("formula");
        console.log(type, formula);
        if( type=== "member" && formula === "[Regiao].[Filial]"){
          var member  = td.getAttribute("member");
          window.top.openMap(member)

          e.preventDefault();
          e.stopImmediatePropagation();
        }

        if( type=== "member" && formula === "[Regiao].[Regional]"){
          var member  = td.getAttribute("member");
          window.top.openCustomMap(member)

          e.preventDefault();
          e.stopImmediatePropagation();
        }

      });


      // FUNCAO AUXILIAR
      // Pega o nome do currentmember
      // [A].[B].[C] = C
      // D = D
      // [E] = E
      function _getMemberName(m){
        m = new String(m);

        // Se tiver mais de um level
        if (m.indexOf("].[")>-1){
          var m = m.split("].[");
          m = m[m.length-1].trim();
        }

        // Tira ultimo ]
        if( m.charAt(m.length - 1) === "]" )
          m = m.substring(0, m.lastIndexOf("]") );

        // Tira primeiro [
        if( m.charAt(0) === "[" )
          m = m.substring(1);

        return m.toString();
      }


  }

});
