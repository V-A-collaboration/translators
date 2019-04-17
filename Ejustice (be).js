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
	"lastUpdated": "2019-04-17 11:32:41"
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
	const frame = doc.querySelector('frameset');
	Z.debug(frame);
	if (frame){
		Z.debug('Need Frame!');
		doc = frame;
	}
	Z.debug("Document" + JSON.stringify(doc));
	//const rows = doc.querySelectorAll('tr th b');
	// production code
	const rows = frames[0].document.getElementsByTagName('b');
	Z.debug("Rows length: "+ rows.length + "Rows: " + rows);
	item = getLawEnacted(rows);
	item.jurisdiction = 'be';
	item.complete();
}

function getLawEnacted(lineList){
	item = new Zotero.Item('statute');
	//Z.debug("Linelist length" + lineList.length);
	for (i=0; i < lineList.length; i++){
		Z.debug("Line text" + lineList[i].textContent);
		var m = lineList[i].textContent.match(/(\d{1,2}\s[A-Z]*?\s\d{4})\.\s-\s([^<^;^\.^\(]*)/);
		if (m){
			item.dateEnacted = m[1].toLowerCase();
			Z.debug("Date Enacted: " + item.dateEnacted);
			item.nameOfAct = ZU.trimInternal(m[2]);
			item.nameOfAct = item.nameOfAct.replace(/[\[\]]/g, "");
			item.nameOfAct = item.nameOfAct.replace(/\.$/, "");

			if(item.nameOfAct.match(/Wet|Koninklijk besluit/)){
				item.nameOfAct = item.nameOfAct.replace(/(^(Wet|Koninklijk besluit)*\b)/, "$1 van " + item.dateEnacted.toLowerCase())
			}
			Z.debug("Title: " + item.nameOfAct);
			Z.debug("Item: " + item);
			break;
		}
	}
	return item
}
