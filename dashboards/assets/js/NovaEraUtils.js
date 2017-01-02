define([
  "cdf/lib/jquery",
  "cdf/lib/moment",
  'cdf/dashboard/Utils'
],
  function ($, moment, Utils) {
    console.log(Utils);

    console.log("[NovaEraUtils] Module loaded");

    var _updateButton,
        _hideFiltersButton,
        _filtersPane,
        _filtersPaneHiddenClass,
        _dateComps,
        _dash,
        _tableAcum = 0
        _monthlyTypes = {
          tramitacao : {
            dashTitle : "Acervo em Tramitação",
            dashIcon : "directions_run",
            hasExtras : true,
            chart : {
              title: "Evolução do acervo",
              meta : ["Sobrestados", "Tramitação (sem sobrestados)"],
              measures : "[Measures].[Qtd Sobrestados],[Measures].[Qtd Tramitacao Sem Sobrestados]"
            },
            table : {
              measures : `
                [Measures].[Qtd Tramitacao Sem Sobrestados],
                [Measures].[Qtd Sobrestados],
                [Measures].[Qtd Tramitacao]
              `,
              meta : [
                "Tramitação (sem sobrestados)",
                "Sobrestados",
                "_B_Total em Tramitação"
              ]
            }
          },
          pendentes : {
            dashTitle : "Processos Pendentes",
            dashIcon : "pan_tool",
            hasExtras : false,
            chart : {
              title: "Participação dos processos aguardando julgamento no total do acervo",
              meta : ["Total em tramitação", "Total de pendentes"],
              measures : "[Measures].[Qtd Tramitacao],[Measures].[Total Pendentes]"
            },
            table : {
              measures : `
                [Measures].[Qtd Pendentes 1 Julgamento],
                [Measures].[Qtd Agravo Legal Regimental],
                [Measures].[Qtd Embargos Declaracao Pendentes],
                [Measures].[Qtd Retratacao Pendentes],
                [Measures].[Total Pendentes],
                [Measures].[Qtd Tramitacao]
              `,
              meta : [
                "Pendentes de 1º Julgamento",
                "Agravo Legal / Regimental",
                "Embargos de Declaração",
                "Retratação",
                "_B_Total Pendentes",
                "_B_Total em Tramitação"
              ]
            }
          },
          metas : {
            dashTitle : "Metas",
            dashIcon : "my_location",
            hasExtras : false,
            chart : {
              title: "Participação dos processos incluídos nas metas no total do acervo",
              meta : ["Total em tramitação", "Total de processos incluídos nas metas"],
              measures : "[Measures].[Qtd Tramitacao],[Measures].[Total Incluidos nas Metas]"
            },
            table : {
              measures : `
                [Measures].[Meta 2],
                [Measures].[Meta 4],
                [Measures].[Meta 6],
                [Measures].[Meta 8],
                [Measures].[Total Incluidos nas Metas],
                [Measures].[Qtd Tramitacao]
              `,
              meta : [
                "Meta 2",
                "Meta 4",
                "Meta 6",
                "Meta 8",
                "_B_Total Incluidos nas Metas",
                "_B_Total em Tramitação"
              ]
            }
          }
        };

   /**
     * Parses a cda.resultset into an object that can be used
     * for looking up parent-child relationships.
     */
    function _toTree(data){
      var obj = {},
          nId = 0,      // name index
          currId = 1;

        for( var x = 0 ; x < data.length ; x++ ){
          var name = data[x][nId],
              firstDiv = name.indexOf("].[")+2,
              lastDiv = name.lastIndexOf("].["),
              uniqueName = name.substring(firstDiv),
              parent = name.substring(firstDiv,lastDiv+1),
              isRoot = parent === ".",
              label = name.substring(lastDiv+3, name.length-1);

              obj[uniqueName] = {

                isRoot : isRoot,
                label : label,
                parent : parent,
                class : "treegrid-"+currId,
                id : currId
              };
              currId++;
        }

        return obj;

    }

    function _comparatorCda1stCol(a, b) {
      if (a[0].toUpperCase() < b[0].toUpperCase()) return -1;
      if (a[0].toUpperCase() > b[0].toUpperCase()) return 1;
      return 0;
    }

    function _sortByFirstCol(arr){
        return arr.sort(_comparatorCda1stCol);
    }

    // funcao para usar no AddIn em percentuais
    // >0 verde
    //<0 vermelho
    function _compare1 (val, st){
        return val ===  1 ? "neutral"
                : val > 1 ? "good":"bad";
    }

    // Funcao para usar no addin de Tabelas
    // Compara um valor ao valor d euma coluna indicada por colIdx
    // Se o corrente for maior, retorna good
    function _compareCol(val, st, colIdx){
         var row = st.tableData[st.rowIdx];
         var valCompare = row[colIdx];
         return val ===  valCompare ? "neutral"
                 : val > valCompare ? "good":"bad";
     }

     function _compareSameCol(va, st, compareWith){

       var compareWith = typeof compareWith === "undefined" ? 0 : compareWith;
       var arr = st.value;
       var compVal = arr[compareWith];
       var baseVal = compareWith === 1 ? arr[0] : arr[1];
       return baseVal ===  compVal ? "neutral"
               : baseVal > compVal ? "good":"bad";
     }

     function _compareSameColInvert(va, st, compareWith){

       var compareWith = typeof compareWith === "undefined" ? 0 : compareWith;
       var arr = st.value;
       var compVal = arr[compareWith];
       var baseVal = compareWith === 1 ? arr[0] : arr[1];
       return baseVal ===  compVal ? "neutral"
               : baseVal > compVal ? "bad":"good";
     }

     // quando queremos adicionar o AddIn numPercentIcon e vamos exibir
     // numero && percentual, entao precisamos fazer merge de colunas
     // vem no resultset. ex.:
     /* Post Fetch : Transforma a coluna 1 em [1,2] e exclui a coluna 2 ...
          function(cda){
            NE.mergeCols(cda, [[1,2], [3,4]]);
          }
     */
     function _mergeCols(cda, arr){

      var rs = cda.resultset;
    	var _arr = arr.sort(function(a,b){
      	return -(a[0]-b[0]);
      });

      for(var i=0;i<_arr.length;i++){
        cda.metadata.splice(_arr[i][1],1);
        //merge das colunas
        for(var x = 0 ; x < rs.length ; x++ ){
            var row = rs[x];
            row[_arr[i][0]] = [row[_arr[i][0]], row[_arr[i][1]]];
            row.splice(_arr[i][1],1);
        }
      }

    }

    function _formatTotalRow(comp, text){
      var sel = "#"+ comp.htmlObject +" > .dataTables_wrapper > table tbody tr";
      var tr = $(sel).last();
      var td = tr.find("td").first();
      if(td.text() === text){
        tr.addClass("ned-total-row");
        td.addClass("ned-total-row-description");
      }

    }

    function _printRanking(cda){
      var rs = cda.resultset;

      for(var x =0 ; x < rs.length ; x++){
          if(x!== rs.length-1)
          rs[x][0] = "<span class='ned-rank'>"+(x+1)+"</span>"+
                           rs[x][0];
      }
    }

    //TODO: mover esse bloco pra outro arquivo
    var _defaultDiacriticsRemovalMap = [
        {'base':'A', 'letters':'\u0041\u24B6\uFF21\u00C0\u00C1\u00C2\u1EA6\u1EA4\u1EAA\u1EA8\u00C3\u0100\u0102\u1EB0\u1EAE\u1EB4\u1EB2\u0226\u01E0\u00C4\u01DE\u1EA2\u00C5\u01FA\u01CD\u0200\u0202\u1EA0\u1EAC\u1EB6\u1E00\u0104\u023A\u2C6F'},
        {'base':'AA','letters':'\uA732'},
        {'base':'AE','letters':'\u00C6\u01FC\u01E2'},
        {'base':'AO','letters':'\uA734'},
        {'base':'AU','letters':'\uA736'},
        {'base':'AV','letters':'\uA738\uA73A'},
        {'base':'AY','letters':'\uA73C'},
        {'base':'B', 'letters':'\u0042\u24B7\uFF22\u1E02\u1E04\u1E06\u0243\u0182\u0181'},
        {'base':'C', 'letters':'\u0043\u24B8\uFF23\u0106\u0108\u010A\u010C\u00C7\u1E08\u0187\u023B\uA73E'},
        {'base':'D', 'letters':'\u0044\u24B9\uFF24\u1E0A\u010E\u1E0C\u1E10\u1E12\u1E0E\u0110\u018B\u018A\u0189\uA779'},
        {'base':'DZ','letters':'\u01F1\u01C4'},
        {'base':'Dz','letters':'\u01F2\u01C5'},
        {'base':'E', 'letters':'\u0045\u24BA\uFF25\u00C8\u00C9\u00CA\u1EC0\u1EBE\u1EC4\u1EC2\u1EBC\u0112\u1E14\u1E16\u0114\u0116\u00CB\u1EBA\u011A\u0204\u0206\u1EB8\u1EC6\u0228\u1E1C\u0118\u1E18\u1E1A\u0190\u018E'},
        {'base':'F', 'letters':'\u0046\u24BB\uFF26\u1E1E\u0191\uA77B'},
        {'base':'G', 'letters':'\u0047\u24BC\uFF27\u01F4\u011C\u1E20\u011E\u0120\u01E6\u0122\u01E4\u0193\uA7A0\uA77D\uA77E'},
        {'base':'H', 'letters':'\u0048\u24BD\uFF28\u0124\u1E22\u1E26\u021E\u1E24\u1E28\u1E2A\u0126\u2C67\u2C75\uA78D'},
        {'base':'I', 'letters':'\u0049\u24BE\uFF29\u00CC\u00CD\u00CE\u0128\u012A\u012C\u0130\u00CF\u1E2E\u1EC8\u01CF\u0208\u020A\u1ECA\u012E\u1E2C\u0197'},
        {'base':'J', 'letters':'\u004A\u24BF\uFF2A\u0134\u0248'},
        {'base':'K', 'letters':'\u004B\u24C0\uFF2B\u1E30\u01E8\u1E32\u0136\u1E34\u0198\u2C69\uA740\uA742\uA744\uA7A2'},
        {'base':'L', 'letters':'\u004C\u24C1\uFF2C\u013F\u0139\u013D\u1E36\u1E38\u013B\u1E3C\u1E3A\u0141\u023D\u2C62\u2C60\uA748\uA746\uA780'},
        {'base':'LJ','letters':'\u01C7'},
        {'base':'Lj','letters':'\u01C8'},
        {'base':'M', 'letters':'\u004D\u24C2\uFF2D\u1E3E\u1E40\u1E42\u2C6E\u019C'},
        {'base':'N', 'letters':'\u004E\u24C3\uFF2E\u01F8\u0143\u00D1\u1E44\u0147\u1E46\u0145\u1E4A\u1E48\u0220\u019D\uA790\uA7A4'},
        {'base':'NJ','letters':'\u01CA'},
        {'base':'Nj','letters':'\u01CB'},
        {'base':'O', 'letters':'\u004F\u24C4\uFF2F\u00D2\u00D3\u00D4\u1ED2\u1ED0\u1ED6\u1ED4\u00D5\u1E4C\u022C\u1E4E\u014C\u1E50\u1E52\u014E\u022E\u0230\u00D6\u022A\u1ECE\u0150\u01D1\u020C\u020E\u01A0\u1EDC\u1EDA\u1EE0\u1EDE\u1EE2\u1ECC\u1ED8\u01EA\u01EC\u00D8\u01FE\u0186\u019F\uA74A\uA74C'},
        {'base':'OI','letters':'\u01A2'},
        {'base':'OO','letters':'\uA74E'},
        {'base':'OU','letters':'\u0222'},
        {'base':'OE','letters':'\u008C\u0152'},
        {'base':'oe','letters':'\u009C\u0153'},
        {'base':'P', 'letters':'\u0050\u24C5\uFF30\u1E54\u1E56\u01A4\u2C63\uA750\uA752\uA754'},
        {'base':'Q', 'letters':'\u0051\u24C6\uFF31\uA756\uA758\u024A'},
        {'base':'R', 'letters':'\u0052\u24C7\uFF32\u0154\u1E58\u0158\u0210\u0212\u1E5A\u1E5C\u0156\u1E5E\u024C\u2C64\uA75A\uA7A6\uA782'},
        {'base':'S', 'letters':'\u0053\u24C8\uFF33\u1E9E\u015A\u1E64\u015C\u1E60\u0160\u1E66\u1E62\u1E68\u0218\u015E\u2C7E\uA7A8\uA784'},
        {'base':'T', 'letters':'\u0054\u24C9\uFF34\u1E6A\u0164\u1E6C\u021A\u0162\u1E70\u1E6E\u0166\u01AC\u01AE\u023E\uA786'},
        {'base':'TZ','letters':'\uA728'},
        {'base':'U', 'letters':'\u0055\u24CA\uFF35\u00D9\u00DA\u00DB\u0168\u1E78\u016A\u1E7A\u016C\u00DC\u01DB\u01D7\u01D5\u01D9\u1EE6\u016E\u0170\u01D3\u0214\u0216\u01AF\u1EEA\u1EE8\u1EEE\u1EEC\u1EF0\u1EE4\u1E72\u0172\u1E76\u1E74\u0244'},
        {'base':'V', 'letters':'\u0056\u24CB\uFF36\u1E7C\u1E7E\u01B2\uA75E\u0245'},
        {'base':'VY','letters':'\uA760'},
        {'base':'W', 'letters':'\u0057\u24CC\uFF37\u1E80\u1E82\u0174\u1E86\u1E84\u1E88\u2C72'},
        {'base':'X', 'letters':'\u0058\u24CD\uFF38\u1E8A\u1E8C'},
        {'base':'Y', 'letters':'\u0059\u24CE\uFF39\u1EF2\u00DD\u0176\u1EF8\u0232\u1E8E\u0178\u1EF6\u1EF4\u01B3\u024E\u1EFE'},
        {'base':'Z', 'letters':'\u005A\u24CF\uFF3A\u0179\u1E90\u017B\u017D\u1E92\u1E94\u01B5\u0224\u2C7F\u2C6B\uA762'},
        {'base':'a', 'letters':'\u0061\u24D0\uFF41\u1E9A\u00E0\u00E1\u00E2\u1EA7\u1EA5\u1EAB\u1EA9\u00E3\u0101\u0103\u1EB1\u1EAF\u1EB5\u1EB3\u0227\u01E1\u00E4\u01DF\u1EA3\u00E5\u01FB\u01CE\u0201\u0203\u1EA1\u1EAD\u1EB7\u1E01\u0105\u2C65\u0250'},
        {'base':'aa','letters':'\uA733'},
        {'base':'ae','letters':'\u00E6\u01FD\u01E3'},
        {'base':'ao','letters':'\uA735'},
        {'base':'au','letters':'\uA737'},
        {'base':'av','letters':'\uA739\uA73B'},
        {'base':'ay','letters':'\uA73D'},
        {'base':'b', 'letters':'\u0062\u24D1\uFF42\u1E03\u1E05\u1E07\u0180\u0183\u0253'},
        {'base':'c', 'letters':'\u0063\u24D2\uFF43\u0107\u0109\u010B\u010D\u00E7\u1E09\u0188\u023C\uA73F\u2184'},
        {'base':'d', 'letters':'\u0064\u24D3\uFF44\u1E0B\u010F\u1E0D\u1E11\u1E13\u1E0F\u0111\u018C\u0256\u0257\uA77A'},
        {'base':'dz','letters':'\u01F3\u01C6'},
        {'base':'e', 'letters':'\u0065\u24D4\uFF45\u00E8\u00E9\u00EA\u1EC1\u1EBF\u1EC5\u1EC3\u1EBD\u0113\u1E15\u1E17\u0115\u0117\u00EB\u1EBB\u011B\u0205\u0207\u1EB9\u1EC7\u0229\u1E1D\u0119\u1E19\u1E1B\u0247\u025B\u01DD'},
        {'base':'f', 'letters':'\u0066\u24D5\uFF46\u1E1F\u0192\uA77C'},
        {'base':'g', 'letters':'\u0067\u24D6\uFF47\u01F5\u011D\u1E21\u011F\u0121\u01E7\u0123\u01E5\u0260\uA7A1\u1D79\uA77F'},
        {'base':'h', 'letters':'\u0068\u24D7\uFF48\u0125\u1E23\u1E27\u021F\u1E25\u1E29\u1E2B\u1E96\u0127\u2C68\u2C76\u0265'},
        {'base':'hv','letters':'\u0195'},
        {'base':'i', 'letters':'\u0069\u24D8\uFF49\u00EC\u00ED\u00EE\u0129\u012B\u012D\u00EF\u1E2F\u1EC9\u01D0\u0209\u020B\u1ECB\u012F\u1E2D\u0268\u0131'},
        {'base':'j', 'letters':'\u006A\u24D9\uFF4A\u0135\u01F0\u0249'},
        {'base':'k', 'letters':'\u006B\u24DA\uFF4B\u1E31\u01E9\u1E33\u0137\u1E35\u0199\u2C6A\uA741\uA743\uA745\uA7A3'},
        {'base':'l', 'letters':'\u006C\u24DB\uFF4C\u0140\u013A\u013E\u1E37\u1E39\u013C\u1E3D\u1E3B\u017F\u0142\u019A\u026B\u2C61\uA749\uA781\uA747'},
        {'base':'lj','letters':'\u01C9'},
        {'base':'m', 'letters':'\u006D\u24DC\uFF4D\u1E3F\u1E41\u1E43\u0271\u026F'},
        {'base':'n', 'letters':'\u006E\u24DD\uFF4E\u01F9\u0144\u00F1\u1E45\u0148\u1E47\u0146\u1E4B\u1E49\u019E\u0272\u0149\uA791\uA7A5'},
        {'base':'nj','letters':'\u01CC'},
        {'base':'o', 'letters':'\u006F\u24DE\uFF4F\u00F2\u00F3\u00F4\u1ED3\u1ED1\u1ED7\u1ED5\u00F5\u1E4D\u022D\u1E4F\u014D\u1E51\u1E53\u014F\u022F\u0231\u00F6\u022B\u1ECF\u0151\u01D2\u020D\u020F\u01A1\u1EDD\u1EDB\u1EE1\u1EDF\u1EE3\u1ECD\u1ED9\u01EB\u01ED\u00F8\u01FF\u0254\uA74B\uA74D\u0275'},
        {'base':'oi','letters':'\u01A3'},
        {'base':'ou','letters':'\u0223'},
        {'base':'oo','letters':'\uA74F'},
        {'base':'p','letters':'\u0070\u24DF\uFF50\u1E55\u1E57\u01A5\u1D7D\uA751\uA753\uA755'},
        {'base':'q','letters':'\u0071\u24E0\uFF51\u024B\uA757\uA759'},
        {'base':'r','letters':'\u0072\u24E1\uFF52\u0155\u1E59\u0159\u0211\u0213\u1E5B\u1E5D\u0157\u1E5F\u024D\u027D\uA75B\uA7A7\uA783'},
        {'base':'s','letters':'\u0073\u24E2\uFF53\u00DF\u015B\u1E65\u015D\u1E61\u0161\u1E67\u1E63\u1E69\u0219\u015F\u023F\uA7A9\uA785\u1E9B'},
        {'base':'t','letters':'\u0074\u24E3\uFF54\u1E6B\u1E97\u0165\u1E6D\u021B\u0163\u1E71\u1E6F\u0167\u01AD\u0288\u2C66\uA787'},
        {'base':'tz','letters':'\uA729'},
        {'base':'u','letters': '\u0075\u24E4\uFF55\u00F9\u00FA\u00FB\u0169\u1E79\u016B\u1E7B\u016D\u00FC\u01DC\u01D8\u01D6\u01DA\u1EE7\u016F\u0171\u01D4\u0215\u0217\u01B0\u1EEB\u1EE9\u1EEF\u1EED\u1EF1\u1EE5\u1E73\u0173\u1E77\u1E75\u0289'},
        {'base':'v','letters':'\u0076\u24E5\uFF56\u1E7D\u1E7F\u028B\uA75F\u028C'},
        {'base':'vy','letters':'\uA761'},
        {'base':'w','letters':'\u0077\u24E6\uFF57\u1E81\u1E83\u0175\u1E87\u1E85\u1E98\u1E89\u2C73'},
        {'base':'x','letters':'\u0078\u24E7\uFF58\u1E8B\u1E8D'},
        {'base':'y','letters':'\u0079\u24E8\uFF59\u1EF3\u00FD\u0177\u1EF9\u0233\u1E8F\u00FF\u1EF7\u1E99\u1EF5\u01B4\u024F\u1EFF'},
        {'base':'z','letters':'\u007A\u24E9\uFF5A\u017A\u1E91\u017C\u017E\u1E93\u1E95\u01B6\u0225\u0240\u2C6C\uA763'}
    ];

    var _diacriticsMap = {};
    for (var i=0; i < _defaultDiacriticsRemovalMap .length; i++){
        var letters = _defaultDiacriticsRemovalMap [i].letters;
        for (var j=0; j < letters.length ; j++){
            _diacriticsMap[letters[j]] = _defaultDiacriticsRemovalMap [i].base;
        }
    }

    // "what?" version ... http://jsperf.com/diacritics/12
    function _removeDiacritics (str) {
        return str.replace(/[^\u0000-\u007E]/g, function(a){
           return _diacriticsMap[a] || a;
        });
    }

    function _fixHyndsWidth(comp){
      var elm = $("#"+comp.htmlObject);
      var btn = elm.find("button.ui-multiselect");
      btn.css("width", "100%");
    }

    function _getId(str){
          return _removeDiacritics(str)
                    .toLowerCase()
                    .split("].[")
                    .join("__")
                    .replace(/\[/g, "")
                    .replace(/\]/g, "")
                    .trim()
                    .replace(/\s/g, "_");
    }

    /**
      CATEGORIA               PAI                   TIPO         DISTANCIA   LABEL
      ["[Categoria].[CAT01]", "[Categoria].[Tudo]", "CATEGORIA", "0",        "Categoria 01"]
     */
    function _parseJstree(rs){
      var output = [];
      for( var x = 0 ; x < rs.length ; x++ ){
        var input = rs[x];
        var cat = input[0];
        var pai = input[1];
        var tipo = input[2];
        var distancia = parseInt(input[3],10);
        var label = input[4];
        var idCat = _getId(cat);
        var idPai = distancia === 0 ? "#" : _getId(pai);
        var row = {
          id : idCat,
          parent : idPai,
          text : label
        };
        output.push(row);
      }
      return output;
    }


    function _printDatesFeedback(){
      var filters = _getDateFilters();
      if(typeof filters === "undefined")
        return;

      var _atu = filters["atual"];
      var _pAnt = filters["periodoAnterior"];
      var _aAnt = filters["anoAnterior"];

      var _atuSel = "#PeriodoAtual";
      var _pAntSel = "#PeriodoAnterior";
      var _aAntSel = "#AnoAnterior";

      _print(_atuSel, _atu.de +" at&eacute; "+ _atu.ate);
      _print(_pAntSel, _pAnt.de +" at&eacute; "+ _pAnt.ate);
      _print(_aAntSel, _aAnt.de +" at&eacute; "+ _aAnt.ate);

    }

    function _print(selector, value){
      $(selector).html(value);
    }

    function _bindUpdateButton(sel, callback){
      _updateButton = $(sel).off('click')
            .click(function(e){

              //var df = _getDateFilters();

              _disableUpdateButton();
              callback();
            });
    }

    function _getUpdateButton(sel){
      return _updateButton;
    }

    function _disableUpdateButton(){
      _updateButton.attr("disabled", "disabled");
      _updateButton.css("background-color", "#ccc");
    }

    function _enableUpdateButton(){
        _updateButton.removeAttr("disabled");
        _updateButton.css("background-color", "");
    }

    function _filtersChanged(){
      _printDatesFeedback();
      _enableUpdateButton();
    }


    function _bindHideFiltersButton(opt){
      var defaults = {
        buttonSel : "#hideFiltersButton",
        paneSel : ".ned-hideable-filter-panel",
        hiddenClass : "ned-hidden",
        visibleText : "Esconder Filtros",
        hiddenText : "Exibir Filtros"
      }

      //TODO: Tratar valores default

      _filtersPaneHiddenClass = opt.hiddenClass;
      _filtersPane = $(opt.paneSel);
      _hideFiltersButton = $(opt.buttonSel)
                              .off('click')
                              .click(function(e){
                                console.log("Click Hide")
                                _filtersPane.toggleClass(opt.hiddenClass);
                                _toggleHideFiltersText(opt.visibleText, opt.hiddenText);
                              })
    }

    function _toggleHideFiltersText(visible, hidden){
      var span = _hideFiltersButton.find("span");
      span.text( _isFiltersPaneHidden() ? hidden : visible );
    }

    function _isFiltersPaneHidden(){
      return _filtersPane.hasClass(_filtersPaneHiddenClass);
    }

    function _optsOK(obj, keys){
      if( !obj || typeof obj !== "object" ){
        throw "Registro de componentes de data nao recebeu opcoes";
        return false;
      }

      for(var x=0 ; x<keys.length ; x++){
        if(typeof obj[keys[x]] === "undefined")
          return false;
      }

      return true;

    }

    function _registerDateSelectors(dash, comps){

      _dash = dash;

      if(!_optsOK(comps, ["typeSelector", "year", "monthInterval_from",
          "monthInterval_to", "month", "ytd", "date_from", "date_to"])){
            throw "ERRO!";
            return;
      }

      function __comp(key){
        return dash.getComponentByName("render_" + comps[key]);
      }

      _dateComps = {
          typeSelector       : __comp("typeSelector"),
          year               : __comp("year"),
          monthInterval_from : __comp("monthInterval_from"),
          monthInterval_to   : __comp("monthInterval_to"),
          month              : __comp("month"),
          ytd                : __comp("ytd"),
          date_from          : __comp("date_from"),
          date_to            : __comp("date_to")
      };

      console.log(comps["typeSelector"]);

    }

    /*
        deve retornar
          {
            atual : {
                de : 'dd/MM/yyyy',
                ate : 'dd/MM/yyyy',
            },

            periodoAnterior : {
                de : 'dd/MM/yyyy',
                ate : 'dd/MM/yyyy',
            },

            anoAnterior : {
                de : 'dd/MM/yyyy',
                ate : 'dd/MM/yyyy',
            }

          }
     */
    function _getDateFilters(){
      var _type = _dateComps.typeSelector.getValue();
      switch (_type) {

        // ********************************************************************
        // Um dopdown ex.: "2016"
        case "um_ano":

          var _ano = parseInt(_dateComps.year.getValue(),10);
          var _anom1 = _ano -1;
          var _anom2 = _anom1 -1;
          return {
            atual:{
              de : "01/01/"+_ano, ate : "31/12/"+_ano,
            },
            periodoAnterior:{
              de : "01/01/"+_anom1, ate : "31/12/"+_anom1,
            },
            anoAnterior:{
              de : "01/01/"+_anom2, ate : "31/12/"+_anom2,
            },
          };

          break;

        // ********************************************************************
        // Dois Dropwodnws ex.: "Fev-2016" - "Abr-2016"
        case "intervalo_meses":

          var _mes_de = _dateComps.monthInterval_from.getValue();
          var _mes_ate = _dateComps.monthInterval_to.getValue();


          _mes_de = moment(_mes_de, 'MMM-YYYY', "pt-br");
          _mes_ate = moment(_mes_ate, 'MMM-YYYY', "pt-br").endOf('month');

          var _paMinus = _mes_ate.clone().diff(_mes_de, "months")+1;

          var _pa_de = _mes_de.clone().subtract(_paMinus, 'month');
          var _pa_ate = _mes_ate.clone().subtract(_paMinus, 'month').endOf("month");

          var _aa_de = _mes_de.clone().subtract(1, 'year');
          var _aa_ate = _mes_ate.clone().subtract(1, 'year').endOf("month");

          return {
            atual : {
              de: _mes_de.format("DD/MM/YYYY", "pt-br"),
              ate: _mes_ate.format("DD/MM/YYYY", "pt-br")
            },
            periodoAnterior : {
              de: _pa_de.format("DD/MM/YYYY", "pt-br"),
              ate: _pa_ate.format("DD/MM/YYYY", "pt-br")
            },
            anoAnterior : {
              de: _aa_de.format("DD/MM/YYYY", "pt-br"),
              ate: _aa_ate.format("DD/MM/YYYY", "pt-br")
            }
          };

          break;

        // ********************************************************************
        // Dois Dropwodnws ex.: "Fev-2016" - "(ytd | not_ytd )"
        case "mes":

          var _pAnt_from, _pAnt_to;
          var _refMonthMask = _dateComps.month.getValue();
          var _ytd = _dateComps.ytd.getValue() === "ytd";
          var _baseMonth = moment(_refMonthMask, 'MMM-YYYY', "pt-br");
          var _baseMonthFrom = _baseMonth.clone().startOf("month");
          var _baseMonthTo = _baseMonth.clone().endOf("month");

          // SE eh acumulado no ano
          if(_ytd){

            //comeco do periodo atual eh comeco do ano
            _baseMonthFrom = _baseMonthFrom.startOf("year");

            //Periodo anterior eh intervalo anterior de mesma duracao
            var _mDiff = _baseMonthTo.clone().diff(_baseMonthFrom, "months")+1;
            _pAnt_from = _baseMonthFrom.clone().subtract(_mDiff, 'months');
            _pAnt_to = _baseMonthTo.clone().subtract(_mDiff, 'months').endOf("month");

          }else{

            _pAnt_from = _baseMonthFrom.clone().subtract(1, 'month');
            _pAnt_to = _baseMonthTo.clone().subtract(1, 'month').endOf("month");

          }

          var _aAnt_from = _baseMonthFrom.clone().subtract(1, 'year');
          var _aAnt_to = _baseMonthTo.clone().subtract(1, 'year').endOf("month");


          return {
            atual : {
              de: _baseMonthFrom.format("DD/MM/YYYY", "pt-br"),
              ate: _baseMonthTo.format("DD/MM/YYYY", "pt-br")
            },
            periodoAnterior : {
              de: _pAnt_from.format("DD/MM/YYYY", "pt-br"),
              ate: _pAnt_to.format("DD/MM/YYYY", "pt-br")
            },
            anoAnterior : {
              de: _aAnt_from.format("DD/MM/YYYY", "pt-br"),
              ate: _aAnt_to.format("DD/MM/YYYY", "pt-br")
            }
          };

          break;

        // ********************************************************************
        // Dois datepickers ex.: "01/02/2016" - "31/12/2016"
        case "intervalo_datas":

          var _dtAnt_from, _dtAnt_to;
          var _dateFromMask = _dateComps.date_from.getValue();
          var _dateToMask = _dateComps.date_to.getValue();
          var _dtFrom = moment(_dateFromMask, 'DD/MM/YYYY', "pt-br");
          var _dtTo = moment(_dateToMask, 'DD/MM/YYYY', "pt-br");

          var _monDiff = _dtTo.clone().diff(_dtFrom, "months");

          // Se diferenca maior que um mes, vou pegar meses anteriores
          if(_monDiff>0){
            _dtAnt_from = _dtFrom.clone().subtract(_monDiff+1, 'months');
            _dtAnt_to = _dtTo.clone().subtract(_monDiff+1, 'months');

          // Se for menos de um mes, pego intervalo anterior de mesma duracao
          }else{
            var _daysDiff = _dtTo.clone().diff(_dtFrom, "days")+1;
            _dtAnt_from = _dtFrom.clone().subtract(_daysDiff, 'days');
            _dtAnt_to = _dtTo.clone().subtract(_daysDiff, 'days');
          }

          var _dAnoAnt_from = _dtFrom.clone().subtract(1, 'year');
          var _dAnoAnt_to = _dtTo.clone().subtract(1, 'year');

          return {
            atual : {
              de: _dtFrom.format("DD/MM/YYYY", "pt-br"),
              ate: _dtTo.format("DD/MM/YYYY", "pt-br")
            },
            periodoAnterior : {
              de: _dtAnt_from.format("DD/MM/YYYY", "pt-br"),
              ate: _dtAnt_to.format("DD/MM/YYYY", "pt-br")
            },
            anoAnterior : {
              de: _dAnoAnt_from.format("DD/MM/YYYY", "pt-br"),
              ate: _dAnoAnt_to.format("DD/MM/YYYY", "pt-br")
            }
          };

          break;
        default:

      };


    }

    function _fixQTD(dataset){
      var dsLen = dataset.length;
      for(var x = 0 ; x <  dsLen ; x++ ){
        dataset[x][0] = dataset[x][0].replace("Qtd ","");
      }
      return dataset;
    }

    function _coalesceNumeric(dataset, indexes, defaultNum){

      var dsLen = dataset.length;

      for(var x = 0 ; x < indexes.length ; x++ ){
        var currIdx = indexes[x];

          for(var y = 0 ; y < dsLen ; y++){
            if( dataset[y][currIdx] === null ){
              dataset[y][currIdx] = defaultNum;
            }
          }

      }

      return dataset;
    }

    function _saveTotal(dataset){
      var sum = dataset.reduce(function(a, b) { 
        return a + b[1];
      }, 0);
      this._tableTotal = sum; 
    }

    function _renderTotal(){
      var tableTotal = this._tableTotal;
      var elm = $("#"+this.htmlObject+" tbody");
      var newTR = $("<tr role='row'></tr>").addClass("odd");
      var totalLabel = $("<td></td>").text("Total Geral").addClass("ned-total-label column0 string");
      var tltalValue = $("<td></td>").text(  Utils.numberFormat(tableTotal, "#,##0", "pt-br")  ).addClass("ned-total-value column1 text-right");
      newTR.append(totalLabel).append(tltalValue);
      elm.append(newTR);

    }

    function _configureDataBar(){

      this.setAddInOptions("colType","dataBar",   
      {
          height: 5,
          widthRatio: 2,
          width: 155,
          startColor: "#007dbb",
          endColor: "#007dbb",        
          includeValue: true,
          align: "right",
          valueFormat: function(v, format, st, opt) {
              return Utils.numberFormat(v, "#,##0", "pt-br")+" <span class='opacity-5'></span>";
          }
      });
    }

    function _tableAccumReset(){
      _tableAcum = 0;
    }

    function _tableAcumAdd(rs){
      for(var x = 0 ; x < rs.length ; x++){
        _tableAcum += rs[x][1];
      }
    }

    function _renderAcum(){
      this._tableTotal = _tableAcum;
      _renderTotal.apply(this);
    }
    function _fixwidths(){
      var elm = $("#"+this.htmlObject+"");
      elm.find("td.column0").css("width", this.chartDefinition.colWidths[0]);
      elm.find("td.column0").each(function(e){
        $(this).attr("title", $(this).text());
      });
    }
    function _mergeHeader(){
      var elm = $("#"+this.htmlObject+" table");
      elm.find("td.column1").css("width", "")
      elm.find("th.column1").remove();
      elm.find("th.column0").attr("colspan", 2).css("width", "");
      var col1 = $("<col></col>").addClass("colx1").css("width", this.chartDefinition.colWidths[0]);
      var col2 = $("<col></col>").addClass("colx2")
      var colgroup = $("<colgroup></colgroup>");
      colgroup.append(col1).append(col2);
      elm.prepend(colgroup);
      
    }

    /**
     * VERY IMPORTANT: Called at dashboard init
     */
    function _applyMonthlyType(mType){

      if(typeof mType !== "string")
        return;
      
      var typeObj = _monthlyTypes[mType];     // to be used here
      this.monthlyType = typeObj;             // to be used into the dashboard

      $("#dashTitle").text(typeObj.dashTitle);
      $("#dashIcon").text(typeObj.dashIcon);
      $("#chartTitle").text(typeObj.chart.title);
      
      this.setParam("chartMeasures",typeObj.chart.measures);
      this.setParam("tableMeasures",typeObj.table.measures);

    }

    function _applyMonthlyMetadata(cdaMeta){
      var customMeta = this.dashboard.monthlyType.chart.meta;
      for(var x = 0 ; x < customMeta.length ; x++){
        cdaMeta[x+1].colName = customMeta[x];
      }
    }

    function _applyTableMeta(cdaResult){
      var customMeta = this.dashboard.monthlyType.table.meta;
      for(var x = 0 ; x < customMeta.length ; x++){
        cdaResult[x][0] = customMeta[x];
      }
    }

    function _turnTotalsBold(){
      var tbody = $("#" + this.htmlObject + " table tbody tr");
      tbody.each(function(){
        var _self = $(this);
        var col0 = _self.find("td.column0");
        var isBold = col0.text().startsWith("_B_");

        if(isBold){
          col0.text(col0.text().substring(3));
          _self.find("td").css("font-weight", "800");
        }

      });
    }



    return {
      turnTotalsBold : _turnTotalsBold,
      applyTableMeta : _applyTableMeta,
      applyMonthlyMetadata : _applyMonthlyMetadata,
      applyMonthlyType : _applyMonthlyType,
      fixwidths : _fixwidths,
      mergeHeader : _mergeHeader,
      tableAccumReset : _tableAccumReset,
      tableAcumAdd : _tableAcumAdd,
      renderAcum : _renderAcum,
      toTree : _toTree,
      sortByFirstCol : _sortByFirstCol,
      compare1 : _compare1,
      compareCol : _compareCol,
      mergeCols : _mergeCols,
      compareSameCol : _compareSameCol,
      formatTotalRow : _formatTotalRow,
      printRanking : _printRanking,
      removeDiacritics : _removeDiacritics,
      fixHyndsWidth : _fixHyndsWidth,
      parseJstree : _parseJstree,
      bindUpdateButton : _bindUpdateButton,
      bindHideFiltersButton : _bindHideFiltersButton,
      isFiltersPaneHidden : _isFiltersPaneHidden,
      filtersChanged : _filtersChanged,
      registerDateSelectors : _registerDateSelectors,
      printDatesFeedback : _printDatesFeedback,
      coalesceNumeric : _coalesceNumeric,
      fixQTD : _fixQTD,
      saveTotal : _saveTotal,
      renderTotal : _renderTotal,
      configureDataBar : _configureDataBar
    };

  }
);

