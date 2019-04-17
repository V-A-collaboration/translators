{
	"translatorID": "caf063b0-050d-4d10-ad05-11d406fd000c",
	"label": "ejustice",
	"creator": "Mathijs van Westendorp",
	"target": "www.ejustice.just.fgov.be.(cgi_loi|eli)",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2019-04-17 14:02:32"
}

function attr(docOrElem,selector,attr,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.getAttribute(attr):null}function text(docOrElem,selector,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.textContent:null}

function detectWeb(doc, url) {
	// Adjust the inspection of url as required
	if ( url.indexOf('wet') != -1 || url.indexOf('loi') != -1 ) {
		return 'statute';
	}
	// Adjust the inspection of url as required
	else if (url.indexOf('book') != -1){
		return 'book';
	}
	else if (url.indexOf('journal') != -1){
		return 'journalArticle';
	}
	// Add other cases if needed
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		Z.debug("Shouldn't happen");
	} else {
		scrape(doc, url);
	}
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	// Adjust the CSS Selectors
	var rows = doc.querySelectorAll('.detailsLink');
	for (var i=0; i<rows.length; i++) {
		// Adjust if required, use Zotero.debug(rows) to check
		var href = rows[i].href;
		// Adjust if required, use Zotero.debug(rows) to check
		var title = ZU.trimInternal(rows[i].textContent);
		if (!href || !title) continue;
		if (checkOnly) return true;
		found = true;
		items[href] = title;
	}
	return found ? items : false;
}

function scrape(doc, url) {
	item = new Zotero.Item(detectWeb(doc, url));
	const frame = doc.querySelector('frame');
	Z.debug(frame);
	if (frame){
		Z.debug('Need Frame!');
		doc = frame;
	}
	Z.debug("Document" + JSON.stringify(doc));
	
	let rows = doc.querySelectorAll('tr th');
	if (!rows.length) {
		// production code
		rows = frames[0].document.getElementsByTagName('th');
	}
	
	Z.debug("Rows length: "+ rows.length + "Rows: " + rows);
	item = getLawEnacted(rows);
	item.jurisdiction = 'be';
	item.complete();
}

function getLawEnacted(lineList){
	item = new Zotero.Item('statute');
	// Z.debug("Linelist length" + lineList.length);
	for (i=0; i < lineList.length; i++){
		Z.debug("Line text" + lineList[i].innerHTML);
		var m = lineList[i].innerHTML.match(/(<b>(\d.{3,15}\d{4}).\s-\s(.*)\s<\/b>)/);
		if (m){
			item.dateEnacted = m[2].toLowerCase();
			Z.debug("Date Enacted: " + item.dateEnacted);
			item.nameOfAct = ZU.trimInternal(m[3]);
			item.nameOfAct = item.nameOfAct.replace(/[\[\]]/g, "");
			item.nameOfAct = item.nameOfAct.replace(/\.$/, "");
			item.originalDate = lineList[i].innerHTML.match(/Publicat.*?(\d{2}-\d{2}-\d{4})/)[1];
			Z.debug("Original Date: " + item.originalDate);
			item.pages = lineList[i].innerHTML.match(/"red">\s?(page|bla).*?(\d+)/)[2];
			Z.debug("Pages: " + item.pages);
			if(item.nameOfAct.match(/Wet|Koninklijk besluit/)){
				item.nameOfAct = item.nameOfAct.replace(/(^(Wet|Koninklijk besluit)*\b)/, "$1 van " + item.dateEnacted.toLowerCase())
			}
			Z.debug("Title: " + item.nameOfAct);
			break;
		}
		//m = lineList[i].innerHTML.match(//);)
	}
	return item
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.ejustice.just.fgov.be/cgi_loi/loi_a1.pl?language=nl&la=N&cn=2002082245&table_name=wet&&caller=list&N&fromtab=wet&tri=dd+AS+RANK&rech=1&numero=1&sql=(text+contains+(%27%27))",
		"items": [
			{
				"itemType": "statute",
				"nameOfAct": "Wet van 22 augustus 2002 betreffende de rechten van de patiënt",
				"creators": [],
				"dateEnacted": "22 augustus 2002",
				"jurisdiction": "be",
				"originalDate": "26-09-2002",
				"pages": "43719",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.ejustice.just.fgov.be/cgi_loi/loi_a1.pl?language=nl&la=N&table_name=wet&cn=1967111008&&caller=list&N&fromtab=wet&tri=dd+AS+RANK&rech=1&numero=1&sql=(text+contains+(%27%27))",
		"items": [
			{
				"itemType": "statute",
				"nameOfAct": "Koninklijk besluit van 10 november 1967 nr 78 betreffende de uitoefening van de gezondheidszorgberoepen &lt;W 2001-08-10/49, art. 27; 022; <font color=\"red\"> Inwerkingtreding : </font> 01-09-2001&gt;",
				"creators": [],
				"dateEnacted": "10 november 1967",
				"jurisdiction": "be",
				"originalDate": "14-11-1967",
				"pages": "11881",
				"shortTitle": "Koninklijk besluit van 10 november 1967 nr 78 betreffende de uitoefening van de gezondheidszorgberoepen &lt;W 2001-08-10/49, art. 27; 022; <font color=\"red\"> Inwerkingtreding",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.ejustice.just.fgov.be/cgi_loi/loi_a1.pl?language=nl&la=N&cn=1967101004&table_name=wet&&caller=list&N&fromtab=wet&tri=dd+AS+RANK&rech=1&numero=1&sql=(text+contains+(%27%27))",
		"items": [
			{
				"itemType": "statute",
				"nameOfAct": "GERECHTELIJK WETBOEK - Deel IV : BURGERLIJKE RECHTSPLEGING. (art. 664 tot 1385octiesdecies)",
				"creators": [],
				"dateEnacted": "10 oktober 1967",
				"jurisdiction": "be",
				"originalDate": "31-10-1967",
				"pages": "11360",
				"shortTitle": "GERECHTELIJK WETBOEK - Deel IV",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.ejustice.just.fgov.be/cgi_loi/loi_a1.pl?language=nl&la=N&cn=2008122334&table_name=wet&&caller=list&N&fromtab=wet&tri=dd+AS+RANK&rech=1&numero=1&sql=(text+contains+(%27%27))",
		"items": [
			{
				"itemType": "statute",
				"nameOfAct": "Koninklijk besluit van 23 december 2008 tot uitvoering van de arbeidsongevallenwet van 10 april 1971 in verband met de onevenredig verzwaarde risico's",
				"creators": [],
				"dateEnacted": "23 december 2008",
				"jurisdiction": "be",
				"originalDate": "30-12-2008",
				"pages": "68793",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.ejustice.just.fgov.be/cgi_loi/loi_a1.pl?language=fr&la=F&cn=1981080431&table_name=loi&&caller=list&F&fromtab=loi&tri=dd+AS+RANK&rech=1&numero=1&sql=(text+contains+(%27%27))",
		"items": [
			{
				"itemType": "statute",
				"nameOfAct": "Arrêté royal portant règlement de police et de navigation pour la mer territoriale belge, les ports et les plages du littoral belge",
				"creators": [],
				"dateEnacted": "4 aout 1981",
				"jurisdiction": "be",
				"originalDate": "01-09-1981",
				"pages": "10833",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
