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
	"lastUpdated": "2021-05-28 14:36:20"
}

/*
	***** BEGIN LICENSE BLOCK *****
	*
	Copyright © 2021 Mathijs Van Westendorp

	This file is part of Zotero.
	Zotero is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.
	Zotero is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
	GNU Affero General Public License for more details.
	You should have received a copy of the GNU Affero General Public License
	along with Zotero. If not, see <http://www.gnu.org/licenses/>.
	***** END LICENSE BLOCK *****
*/

function detectWeb(doc, url) {
	// Adjust the inspection of url as required
	if (url.includes('wet') || url.includes('loi')) {
		return 'statute';
	}
	// Adjust the inspection of url as required
	else if (url.includes('book')) {
		return 'book';
	}
	else if (url.includes('journal')) {
		return 'journalArticle';
	}
	// Add other cases if needed
	return '';
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		Z.debug("Shouldn't happen");
	}
	else {
		scrape(doc, url);
	}
}

function scrape(doc, url) {
	let item = new Zotero.Item(detectWeb(doc, url));
	const frame = doc.querySelector('frame');
	Z.debug(frame);
	if (frame) {
		Z.debug('Need Frame!');
		doc = frame;
	}
	Z.debug("Document" + JSON.stringify(doc));

	let rows = doc.querySelectorAll('tr th');
	if (!rows.length) {
		// production code
		rows = frame[0].document.getElementsByTagName('th');
	}

	Z.debug("Rows length: " + rows.length + "Rows: " + rows);
	item = getLawEnacted(rows);
	item.jurisdiction = 'be';
	item.complete();
}

function getLawEnacted(lineList) {
	let item = new Zotero.Item('statute');

	for (let i = 0; i < lineList.length; i++) {
		Z.debug("Line text" + lineList[i].innerHTML);
		var m = lineList[i].innerHTML.match(/(<b>(\d{1,2}.{3,15}\d{4}).\s-\s(.*?)<.)/);
		if (m) {
			item.dateEnacted = m[2].toLowerCase();
			Z.debug("Date Enacted: " + item.dateEnacted);
			item.nameOfAct = ZU.trimInternal(m[3]);
			item.nameOfAct = item.nameOfAct.replace(/[[\]]/g, "");
			item.nameOfAct = item.nameOfAct.replace(/\.$/, "");
			item.publicationDate = lineList[i].innerHTML.match(/Publicat.*?(\d{2}-\d{2}-\d{4})/)[1];
			Z.debug("Publication Date: " + item.publicationDate);
			item.pages = lineList[i].innerHTML.match(/"red">\s?(page|bla).*?(\d+)/)[2];
			Z.debug("Pages: " + item.pages);
			if (item.nameOfAct.match(/(^.?(Wet|.*?\sbesluit|Ministerieel\sbesluit|Decreet)\b)/)) {
				item.nameOfAct = item.nameOfAct.replace(/(^.?(Wet|.*?\sbesluit|Ministerieel\sbesluit|Decreet)\b)/, "$1 van " + item.dateEnacted.toLowerCase());
			}
			Z.debug("Title: " + item.nameOfAct);
			item.code = "BS";
			break;
		}
	}
	return item;
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
				"code": "BS",
				"jurisdiction": "be",
				"pages": "43719",
				"publicationDate": "26-09-2002",
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
				"nameOfAct": "Koninklijk besluit van 10 november 1967 nr 78 betreffende de uitoefening van de gezondheidszorgberoepen &lt;W 2001-08-10/49, art. 27; 022;",
				"creators": [],
				"dateEnacted": "10 november 1967",
				"code": "BS",
				"jurisdiction": "be",
				"pages": "11881",
				"publicationDate": "14-11-1967",
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
				"code": "BS",
				"jurisdiction": "be",
				"pages": "11360",
				"publicationDate": "31-10-1967",
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
				"code": "BS",
				"jurisdiction": "be",
				"pages": "68793",
				"publicationDate": "30-12-2008",
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
				"code": "BS",
				"jurisdiction": "be",
				"pages": "10833",
				"publicationDate": "01-09-1981",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "http://www.ejustice.just.fgov.be/cgi_loi/loi_a1.pl?language=nl&la=N&cn=2019021403&table_name=wet&&caller=list&N&fromtab=wet&tri=dd+AS+RANK&rech=1&numero=1&sql=(text+contains+(%27%27))",
		"items": [
			{
				"itemType": "statute",
				"nameOfAct": "Ministerieel besluit van 14 februari 2019 betreffende de tegemoetkoming door het Vlaams Landbouwinvesteringsfonds aan varkensbedrijven die getroffen zijn door de Afrikaanse varkenspest",
				"creators": [],
				"dateEnacted": "14 februari 2019",
				"code": "BS",
				"jurisdiction": "be",
				"pages": "21555",
				"publicationDate": "04-03-2019",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
