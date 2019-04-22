{
	"translatorID": "06dcc7f5-3b6c-41b9-b8b3-eaef06bc7e61",
	"label": "HUDOC",
	"creator": "Mathijs van Westendorp",
	"target": "https?://hudoc.echr.coe.int.*itemid",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2019-04-22 07:20:21"
}

function attr(docOrElem,selector,attr,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.getAttribute(attr):null}function text(docOrElem,selector,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.textContent:null}

function detectWeb(doc, url) {
	// Adjust the inspection of url as required
	if(url.indexOf('itemid') != -1){
		return 'case';
	}
	else {
		return 'case'; //multiple';
	}
	// Add other cases if needed
}

function scrapeMultiple(doc, checkOnly) {
	var items = {};
	var found = false;
	// Adjust the CSS Selectors
	var rows = doc.querySelectorAll('.result-item');
	//Z.debug(rows);
	for (let i=0; i<rows.length; i++) {
		// Adjust if required, use Zotero.debug(rows) to check
		item = new Zotero.Item('case');
		item.title = getTitle(rows[i].querySelector('.document-link.headline').innerText);
		item.url = rows[i].querySelector('.document-link.headline').href;
		item.number = rows[i].querySelector('.textColumn').innerText;
		item.court = getCourt(rows[i].querySelector('.originatingBody').innerText);
		item.dateDecided = rows[i].querySelector('.dateColumn').innerText;
		item.jurisdiction = 'coe.int';
		item.complete();
		// Adjust if required, use Zotero.debug(rows) to check
	}
}


function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		Zotero.selectItems(getSearchResults(doc, false), function (items) {
			if (!items) {
				return true;
			}
			Z.debug(items);
			for(let i = 0; i < items.length; i++) {
				Z.debug('item: ' + items[i]);
				ZU.processDocuments(items[i], scrape);
			}
			
		});
	} else {
		scrape(doc, url);
	}
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	// Adjust the CSS Selectors 
	var rows = doc.querySelectorAll('.document-link.headline');
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
	item = new Zotero.Item('case');
	Z.debug(url);
	if (doc.querySelector('.navigator-heading .lineone').innerText.includes('AFFAIRE')){
		item.language = 'French';
	}
	else {
		item.language = 'English';
	}
	item.title = getTitle(doc.querySelector('.navigator-heading .lineone').innerText);
	item.number = doc.querySelector('.navigator-heading .column01').innerText.replace(/\s/, '; ')
	item.dateDecided = doc.querySelector('.navigator-heading .column04').innerText;
	item.jurisdiction = 'coe.int';
	item.court = getCourt(doc.querySelector('.navigator-heading .column03').innerText);
	//item.language = 'eng';
	item.url = doc.querySelector('.documenturl').value;
	const i = item.url.match(/\?i=(.*)/)[1];
	const filename = doc.querySelector('.navigator-heading .lineone').innerText.match(/\)\s(.*)/)[1];
	Z.debug(filename);
	const dlLink = 'https://hudoc.echr.coe.int/app/conversion/docx/pdf?library=ECHR&id='+ 
		i + 
		'&filename='+ 
		filename;
	//getAttachements(item, dlLink);
	Z.debug(item);
	item.complete();
	
}

function getTitle (title) {
	title = title.replace(/.*(CASE OF|AFFAIRE) /, '').toTitleCase();
	return title.replace(' V. ', '/');

}

function getCourt(courtString) {
	var court = 'echr';
	var section = '~section.';
	var courtNumberText = courtString.match(/\((.*?)\s/);
	if (!courtNumberText) {
		return court;
	}
	var courtNumber = 0;
	switch(courtNumberText[1]){
	case 'First':
		return court + section + '1';
	case 'Second':
		return court + section + '2';
	case 'Third':
		return court + section + '3';
	case 'Fourth':
		return court + section + '4';
	case 'Fifth':
		return court + section + '5';
	}
}

function getAttachements(item, dlURL){
	const pdfURL = dlURL + '.pdf';
	const docURL = dlURL.replace('/pdf?', '/?') + '.docx';
	item.attachments.push({
		title: 'HUDOC Full Text PDF',
		url: pdfURL,
		mimeType: 'application/pdf',
		proxy: false
	});
	item.attachments.push({
		title: 'HUDOC Full Text docx',
		url: docURL,
		mimeType: 'application/docx',
		proxy: false
	});
}

if(typeof(String.prototype.trim) === "undefined")
{
	String.prototype.trim = function() 
	{
		return String(this).replace(/^\s+|\s+$/g, '');
	};
}
String.prototype.toTitleCase = function () {
	return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};
