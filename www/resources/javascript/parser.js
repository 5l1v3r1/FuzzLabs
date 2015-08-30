$( document ).ready(function() {

    var selection_start = -1;
    var selection_end = -1;

    $("body").on('mousedown', 'div.parser_hex_cell', function(evt) {
        /*
            1 = Left   mouse button
            2 = Centre mouse button
            3 = Right  mouse button
        */
        if (evt.which === 1) {
            selection_start = parseInt($(evt.target).attr('offset'));
        }
    });

    $("body").on('mouseup', 'div.parser_hex_cell', function(evt) {
        selection_end = parseInt($(evt.target).attr('offset'));
        selectBytes(selection_start, selection_end);
    });

    $(function(){
        $('#the-node').contextMenu({
            selector: 'div.parser_hex_cell', 
            callback: function(key, options) {
                if (key == "ascii") to_ascii($(this), parseInt($(this).attr('offset')));
                if (key == "hex") to_hex($(this), parseInt($(this).attr('offset')));
                if (key == "clear") clearSelection();
                if (key == "clearall") clearAllSelection();
            },
            items: {
                "hex": {name: "To Hex"},
                "ascii": {name: "To Ascii"},
                "clear": {name: "Clear Last Selection"},
                "clearall": {name: "Clear All Selection"}
            }
        });
    });

    var dHeight = $(document).height();
    $("div#parser_center_wrapper").height(dHeight - 250);

    function to_ascii(item, offset) {
        $(item).removeClass('parser_hex_cell_ascii');
        var raw = $(item).attr('raw');
        $(item).text(raw);
        $(item).addClass('parser_hex_cell_ascii');
    }

    function to_hex(item, offset) {
        $(item).removeClass('parser_hex_cell_ascii');
        var raw = $(item).attr('raw');
        $(item).text(fixHex(parseInt(raw.charCodeAt(0)).toString(16)).toUpperCase());
    }

    function fixHex(val) {
        if (val.length % 2) return ("0" + val);
        return val;
    }

    function selectBytes(from, to) {
        var hexview = document.getElementById('parser_center_wrapper');
        cNodes = hexview.childNodes;
        for (var cnc = 0; cnc < cNodes.length; cnc++) {
            cno = parseInt(cNodes[cnc].getAttribute('offset'));
            if (cno >= from && cno <= to) {
                $(cNodes[cnc]).addClass("parser_hex_cell_select");
            }
        }
    }

    function clearSelection() {
        var hexview = document.getElementById('parser_center_wrapper');
        cNodes = hexview.childNodes;
        for (var cnc = 0; cnc < cNodes.length; cnc++) {
            cno = parseInt(cNodes[cnc].getAttribute('offset'));
            if (cno >= selection_start && cno <= selection_end) {
                $(cNodes[cnc]).removeClass("parser_hex_cell_select");
            }
        }
        selection_start = -1;
        selection_end = -1;
    }

    function clearAllSelection() {
        selection_start = -1;
        selection_end = -1;
        var hexview = document.getElementById('parser_center_wrapper');
        cNodes = hexview.childNodes;
        for (var cnc = 0; cnc < cNodes.length; cnc++) {
            $(cNodes[cnc]).removeClass("parser_hex_cell_select");
        }
    }

    function hexViewByte(val, offset, all_hex) {
        var item = document.createElement('div');
        item.setAttribute('class', 'unselectable parser_hex_cell');
        item.setAttribute('raw', val);
        item.setAttribute('dec', val.charCodeAt(0));
        item.setAttribute('hex', fixHex(val));
        item.setAttribute('offset', parseInt(offset));

        if (all_hex != true && val.charCodeAt(0) > 32 && val.charCodeAt(0) < 127) {
            item.setAttribute('class', 'unselectable parser_hex_cell parser_hex_cell_ascii');
            item.setAttribute('value', fixHex(val));
            item.textContent = val;
        } else {
            item.setAttribute('class', 'unselectable parser_hex_cell');
            val = val.charCodeAt(0).toString(16);
            item.setAttribute('value', fixHex(val));
            item.textContent = fixHex(val).toUpperCase();
        }
        return item;
    }

    function process_file(all_hex) {
        var hexview = document.getElementById('parser_center_wrapper');
        var file_data = window.localStorage.getItem('parser_file_content');
        hexview.innerHTML = "";
        var bcnt = 0;

        for (bcnt = 0; bcnt < file_data.length; bcnt++) {
            var hvItem = hexViewByte(file_data[bcnt], bcnt, all_hex);
            hexview.appendChild(hvItem);
        }
    }

    $("body").on('mouseover', 'div.parser_hex_cell', function(evt) {
        $(evt.target).addClass("parser_hex_cell_mark");
        var offset_info = $("div#offset_info").get(0);
        var byte_info_hex = $("div#byte_info_hex").get(0);
        var byte_info_dec = $("div#byte_info_dec").get(0);
        var byte_info_raw = $("div#byte_info_raw").get(0);
        var raw = evt.target.getAttribute('raw');
        var offset = evt.target.getAttribute('offset');
        var offset_info = document.getElementById('offset_info');
        byte_info_raw.textContent = "Raw: " + raw;
        byte_info_dec.textContent = "Dec: " + raw.charCodeAt(0);
        byte_info_hex.textContent = "Hex: " + fixHex(raw.charCodeAt(0).toString(16)).toUpperCase();
        offset_info.textContent = "Offset: " + offset + 
                                  " (0x" + 
                                  fixHex(parseInt(offset).toString(16)).toUpperCase() + 
                                  ")";
    });

    $("body").on('mouseout', 'div.parser_hex_cell', function(evt) {
        $(evt.target).removeClass("parser_hex_cell_mark");
    });

    $("#parser_show_hex").click(function() {
        process_file(true);
    });

    $("#parser_source_file").change(function() {
        var file = this.files[0];
        var reader = new FileReader();

        reader.onload = function(evt) {
            window.localStorage.setItem('parser_file', file);
            window.localStorage.setItem('parser_file_content', evt.target.result);
            process_file(false);
        };

        reader.readAsBinaryString(file);
    });

});
