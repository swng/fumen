// Add-on
// Conversion into diagram code
// Rev.4

/*
Jan 13, 2011 18:11
Help with fumen

Chopin>
Hi, Mihys.
This is Chopin from harddrop.com and I was wondering if I could ask you if something is possible.
I need to see if fumen can convert into a diagram code to put in our Tetr!s wiki at harddrop.com/wiki.
Please contact (PM) message me at harddrop.com/chopin if you can.
Big help appreciated!
*/

if(typeof STRING_WIKICODE_OUTPUT    == 'undefined') STRING_WIKICODE_OUTPUT    = "Wikiコード出力";
if(typeof STRING_WIKICODE_COPY      == 'undefined') STRING_WIKICODE_COPY      = "Wikiコードをコピー";
if(typeof STRING_WIKICODE_COPY_MSG  == 'undefined') STRING_WIKICODE_COPY_MSG  = "クリップボードにコピーしました";
if(typeof STRING_WIKICODE_UPPERCASE == 'undefined') STRING_WIKICODE_UPPERCASE = "大文字";
if(typeof STRING_WIKICODE_ALLPAGES  == 'undefined') STRING_WIKICODE_ALLPAGES  = "全ページ";
if(typeof STRING_WIKICODE_ALIGN     == 'undefined') STRING_WIKICODE_ALIGN     = "高さを揃える";
if(typeof STRING_WIKICODE_COMMENTS  == 'undefined') STRING_WIKICODE_COMMENTS  = "コメント";

addon_ui += '<hr width=90% size=1>';
addon_ui += '<table border=0 cellspacing=0 cellpadding=0>';
addon_ui += '<tr>';
addon_ui += '<td>';
addon_ui += '<input type=checkbox name=pfucase id=pfucase checked><label for=pfucase>'+STRING_WIKICODE_UPPERCASE+'</label>';
addon_ui += '<input type=checkbox name=pfallpg id=pfallpg><label for=pfallpg>'+STRING_WIKICODE_ALLPAGES+'</label>';
addon_ui += '</td>';
addon_ui += '</tr>';
addon_ui += '<tr>';
addon_ui += '<td>';
addon_ui += '<input type=checkbox name=pfalign id=pfalign checked><label for=pfalign>'+STRING_WIKICODE_ALIGN+'</label>';
addon_ui += '<input type=checkbox name=pfcm id=pfcm><label for=pfcm>'+STRING_WIKICODE_COMMENTS+'</label>';
addon_ui += '</td>';
addon_ui += '</tr>';
addon_ui += '<tr>';
addon_ui += '<td>';
addon_ui += '<input type=button value="'+STRING_WIKICODE_OUTPUT+'" onclick="outputpfcode();">';
addon_ui += '<input type=button value="'+STRING_WIKICODE_COPY+'" onclick="copypfcode();">';
addon_ui += '</td>';
addon_ui += '</tr>';
addon_ui += '</table>';
addon_ui += '<textarea name=pfcode id=pfcode cols=32 rows=4 style="font-size:9pt;" onfocus="this.select();"></textarea><br>';

function outputpfcode(autofocus = true)
{
	var pfcode = document.getElementById("pfcode");
	var pfucase = document.getElementById("pfucase");
	var pfallpg = document.getElementById("pfallpg");
	var pfalign = document.getElementById("pfalign");
	var pfcm = document.getElementById("pfcm");
	var pfout = "";
	
	if (!pfcode) return;

    pushframe(frame);
	var st = fldlines - 2;
	for (var s = 0; s < 2; s++) {
		for (var k = 0; k <= framemax; k++) {
			var tf = new Array(fldblks);
			for (var i = 0; i < fldblks; i++) tf[i] = af[k * fldblks + i] + ((pfucase.checked && af[k * fldblks + i] >= 1 && af[k * fldblks + i] <= 8) ? 8 : 0);
			if (ap[k * 3 + 0] > 0) {
				for (var i = 0; i < 4; i++) {
					tf[ap[k * 3 + 2] + b[ap[k * 3 + 0] * 32 + ap[k * 3 + 1] * 8 + i * 2 + 1] * 10 + b[ap[k * 3 + 0] * 32 + ap[k * 3 + 1] * 8 + i * 2] - 11] = ap[k * 3 + 0] + 8;
				}
			}
		
			if (!pfalign.checked) st = fldlines - 2;
			if (s == 0 || !pfalign.checked) {
				for (var j = fldlines - 2; j >= 0; j--) {
					for (var i = 0; i < 10; i++) {
						if (tf[j * 10 + i]) if (st > j - (j > 0)) st = j - (j > 0);
					}
				}
			}
		
			if (s == 1 && (pfallpg.checked || k == frame)) {
				pfout += "|{{pfstart}}\n";
				for (var j = st; j < fldlines - 1; j++) {
					pfout += "{{pfrow";
					for (var i = 0; i < 10; i++) {
						pfout += "|" + " iloztjsgILOZTJSG".charAt(tf[j * 10 + i]);
					}
					pfout += "}}\n";
				}
				pfout += "{{pfend}}\n";
				if (pfcm.checked && ac[k] != "") pfout += ac[k] + "\n";
			}
		}
	}

	pfcode.value = pfout;
	if(autofocus) {
		pfcode.focus();
	}
}

function copypfcode() {
    const textarea = document.getElementById("pfcode");
    if (!textarea) return;

    const copybtn = document.querySelector('input[type="button"][value="'+STRING_WIKICODE_COPY+'"]');

    navigator.clipboard.writeText(textarea.value).then(() => {
        showcopytooltip(copybtn);
    }).catch(err => {
        textarea.select();
		// copy with execCommand as fallback for older browsers
		const success = document.execCommand("copy"); 
		if (success) {
			showcopytooltip(copybtn);
		} else {
			console.warn("failed to copy pfcode to clipboard"); 
		}
    });
}

function showcopytooltip(target) {
    if (!target) return;

	const darkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    const tooltip = document.createElement("div");
    tooltip.textContent = STRING_WIKICODE_COPY_MSG;
    tooltip.style.position = "absolute";
    tooltip.style.background = darkMode ? '#333' : '#e7e7e7ff';
    tooltip.style.color = darkMode ? '#ccc' : '#000';
    tooltip.style.padding = "4px 8px";
    tooltip.style.borderRadius = "4px";
    tooltip.style.fontSize = "10pt";
    tooltip.style.zIndex = 9999;
    tooltip.style.opacity = 0;

    const rect = target.getBoundingClientRect();
    tooltip.style.left = rect.left + window.scrollX + "px";
    tooltip.style.top = (rect.top + window.scrollY - 28) + "px";

    document.body.appendChild(tooltip);

    requestAnimationFrame(() => tooltip.style.opacity = 1);

    setTimeout(() => {
        tooltip.style.transition = "opacity 1s linear";
        tooltip.style.opacity = 0;
        setTimeout(() => tooltip.remove(), 1000); 
    }, 800);
}
