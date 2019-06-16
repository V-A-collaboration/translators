{
	"translatorID": "b24d66b4-8b93-4a4b-b9a6-1381db8f88da",
	"label": "ecli",
	"creator": "Mathijs van Westendorp",
	"target": "https?://e-justice.europa.eu/eclisearch/integrated/search.html\\?text=",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 1,
	"inRepository": true,
	"translatorType": 12,
	"browserSupport": "gcsibv",
	"lastUpdated": "2019-06-16 13:03:55"
}

function attr(docOrElem,selector,attr,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.getAttribute(attr):null}function text(docOrElem,selector,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.textContent:null}

function detectWeb(doc, url) {
	return 'case';
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

function getECLI(co){
	let m = co.match(/ECLI:(.*?:){3}.*/);
	if (m){
		return m[0];
	}
}

function detectSearch(item) {
	Z.debug('Detecting ECLI search: ' + JSON.stringify(item));
	if(item.ecli || getECLI(item.contextObject)) {
		return true;
	}
	return false;
}

function doSearch(item) {
	let ecli;
	if (item.contextObject) {
		ecli = getECLI(item.contextObject);
	}
	if (!ecli) ecli = item.ecli;
	
	if (typeof ecli == "string") ecli = [ecli];
	
	// Get language from ECLI
	Zotero.debug("Type: " + typeof ecli);
	const language = getLanguage(ecli);
	lookupECLI(ecli, language);
}

function getLanguage(ecli, url){
	let language = ecli.toString().match(/ECLI:(.*?):/)[1];
	language = language.toLowerCase();
	// Check if url overrides language
	if (url && url.includes('lang=')){
		language = url.match(/lang=(.*)&?/)[1];
	}
	// Some country codes are not languages
	if (language === "eu") { language = "en"; }
	// todo add Czech support
	if (language === "cz") { language = "en"; }
	if (!language) { language = "en"; }
	return language;
}


regexFieldsEnglish = {
	"provider": /^ECLI provider/,
	"jurisdiction": /^Issuing country or institution/,
	"court": /^Issuing court/,
	"decisionType": /^Decision.judgment type/,
	"dateDecided": /^Date of decision.judgment/,
	"publicationDate": /^Date of publication/,
	"url": /^Wording of decision.judgment/,
	"fieldOfLaw": /^Field of law/,
	"abstract": /^Abstract/,
	"caseDescription": /^Description/
}

regexFieldsFrench = {
	"provider": /^Fournisseur d'ECLI/,
	"jurisdiction": /^Institution ou pays émetteur/,
	"court": /^Juridiction émettrice/,
	"decisionType": /^Type de décision\/d'arrêt/,
	"dateDecided": /^Date d'adoption de la décision\/l'arrêt/,
	"publicationDate": /^Date de publication/,
	"url": /^Texte de la décision\/l'arrêt/,
	"fieldOfLaw": /^Domaine juridique/,
	"abstract": /^Résumé/,
	"caseDescription": /^Description/
}

regexFieldsDutch = {
	"provider": /^ECLI-verstrekker/,
	"jurisdiction": /^Land of instantie/,
	"court": /^Gerecht/,
	"decisionType": /^Soort gerechtelijke uitspraak/,
	"dateDecided": /^Datum gerechtelijke uitspraak/,
	"publicationDate": /^Datum van publicatie/,
	"url": /^Tekst gerechtelijke uitspraak/,
	"fieldOfLaw": /^Rechtsgebied/,
	"abstract": /^Samenvatting/,
	"caseDescription": /^Beschrijving/
}
regexFieldsCzech = {
	"provider": /^Poskytovatel ECLI:/,
	"jurisdiction": /^Vydávající země nebo instituce/,
	"court": /^Vydávající soud/,
	"decisionType": /^Druh rozhodnutí\/rozsudku/,
	"dateDecided": /^Datum rozhodnutí\/rozsudku/,
	"publicationDate": /^Datum zveřejnění/,
	"url": /^Znění rozhodnutí\/rozsudku/,
	"fieldOfLaw": /^Oblast práva/,
	"abstract": /^Výtah/,
	"caseDescription": /^Popis/
}

function lookupECLI(ecli, language) {
	var newUri = "https://e-justice.europa.eu/eclisearch/integrated/search.html?text="+ecli+"&lang="+language.toLowerCase();
	Zotero.debug("New URL: " + newUri);
	Zotero.Utilities.HTTP.processDocuments(newUri, function(doc, url) {
		//call the import translator
		Z.debug(url);
		scrape(doc, url);
	});
}

function getKey(row, language = 'en'){
	// Get a row and convert it to the correct Zotero Key and value
	let regexFields;
	switch(language){
		case "en":
			regexFields = regexFieldsEnglish;
			break;
		case "fr":
			regexFields = regexFieldsFrench;
			break;
		case "nl":
			regexFields = regexFieldsDutch;
			break;
		case "cs":
			regexFields = regexFieldsCzech;
			break;
		default:
			regexFields = regexFieldsEnglish;
	}
	row = row.innerText;
	if (row.match(regexFields.provider)) { 
		return "provider"; 
	}
	if (row.match(regexFields.jurisdiction)) { 
		return "country"; 
	}
	if (row.match(regexFields.court)) { 
		return "court"; 
	}
	if (row.match(regexFields.decisionType)) { 
		return "decisionType"; 
	}
	if (row.match(regexFields.dateDecided)) { 
		return "dateDecided"; 
	}
	if (row.match(regexFields.publicationDate)) { 
		return "publicationDate"; 
	}
	// todo may be available only in certain languages, do query for that
	if (row.match(regexFields.url)) { 
		return "url"; 
	}
	if (row.match(regexFields.fieldOfLaw)) { 
		return "fieldOfLaw";
	}
	if (row.match(regexFields.abstract)) { 
		return "abstractNote"; 
	}
	if (row.match(regexFields.caseDescription)) { 
		return "caseDescription"; 
	}
	return 'fail';
}

function getValue(row){
	row = row.innerText.replace('\n', '');
	// Metadata ~ not available in that language, ignore value
	if (row.includes('metadata')){
		return null;
	}
	return row.substring(row.indexOf(':')+1);
}

function readResultItem(resultItem, language){
	let item = new Zotero.Item('case');
	let rows = resultItem.children;
	let ecli = rows[0].innerText;
	item.jurisdiction = rows[0].innerText.match(/ECLI:(.*?):/)[1];
	for (let i = 2; i < rows.length; i++){
		// Some items have multiple language
		// Todo check which 'language' contains more information for a field.
		if(rows[i].className=="arrow-right"){
			const innerRows = rows[i].children;
			for (let j = 2; j < innerRows.length; j++){
				if (!item[getKey(innerRows[j], language)]){
					const value = getValue(innerRows[j]);
					if (value){
						item[getKey(innerRows[j], language)] = value.trim();
					}
				}
			}
		} else {
			const value = getValue(rows[i]);
			if (value){
				item[getKey(rows[i], language)] = value.trim();
			}
		}
		
	}

	item.extra = 'ecli: ' + ecli;
	if (item.publicationDate){
		item.publicationDate = item.publicationDate.replace(/\//g, '-');
	}
	item.dateDecided = item.dateDecided.replace(/\//g, '-');
	
	// fix url
	if (item.url && item.url.includes('http')){
		item.url = item.url.match(/http:.*?\s/)[0]
	}
	if (item.url && item.url.includes('meta')){
		delete item.url;
	}
	
	// for NL get docketNumber
	if (language == 'nl' && item.caseDescription){
		item.docketNumber = item.caseDescription.match(/Zaaknummer:(\s.*(\d|\)))/m)[1];
	}
	// fix court
	if (item.court.includes("-")){
		item.court = item.court.split("-")[1].trim();
	}
	
	// remove unnecessary keys
	delete item.caseDescription;
	//item.docketNumber = number;
	Z.debug(item);

	return item;
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	// Adjust the CSS Selectors 
	var resultList = doc.querySelectorAll('.result-item');
	for (var i=0; i<resultList.length; i++) {
		var resultItem = readResultItem(resultList[i]);
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
	Z.debug(url);
	let targetECLI = url.match(/=(ECLI.*?)(&|$)/, url)[1];
	targetECLI = htmlDecode(targetECLI);
	Z.debug(targetECLI);
	var resultList = doc.querySelectorAll('.result-item');
	// select right result by matching ecli..
	// todo e.g https://e-justice.europa.eu/eclisearch/integrated/search.html?text=ECLI:CZ:NS:2015:32.CDO.2051.2013.1
	// has values spread over different result-items
	let resultIter;
	for(let i = 0; i<resultList.length; i++){
		if (targetECLI == resultList[i].children[0].innerText){
			resultIter = i;
		}
	}
	const language = getLanguage(targetECLI, url);
	// todo merge items to get all relevant fields
	item = readResultItem(resultList[resultIter], language)
	item.complete();
	
}

function getCuriaData(curiaURL){
	// todo for EU cases get extra data from curia
}



function htmlDecode(input)
{
  return input.replace(/%3A/g, ':');
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://e-justice.europa.eu/eclisearch/integrated/search.html?text=ECLI:NL:RBOVE:2019:1347&lang=en",
		"items": [
			{
				"itemType": "case",
				"creators": [],
				"dateDecided": "19-04-2019",
				"court": "Rechtbank Overijssel (RBOVE)",
				"extra": "ecli: ECLI:NL:RBOVE:2019:1347",
				"jurisdiction": "NL",
				"publicationDate": "19-04-2019",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://e-justice.europa.eu/eclisearch/integrated/search.html?text=ECLI:NL:RBOVE:2019:1347&lang=nl",
		"items": [
			{
				"itemType": "case",
				"creators": [],
				"dateDecided": "19-04-2019",
				"abstractNote": "De 33-jarige Maick S. is verantwoordelijk voor de gewelddadige dood van de 14 maanden oude peuter Xaja uit Hengelo. De rechtbank Overijssel veroordeelt de Hengeloër voor moord tot een celstraf van 22  \n\njaar. De moeder van Xaja is vrijgesproken. Tegen de 23-jarige Sarinda van E. is geen bewijs dat zij haar dochter iets heeft aangedaan of bewust heeft nagelaten haar te helpen. De man moet zo’n 84.000 euro aan schadevergoedingen betalen aan de vader en oma van het slachtoffertje. Zie ook ECLI:NL:RBOVE:2019:1362",
				"court": "Rechtbank Overijssel (RBOVE)",
				"docketNumber": "08/910063-17 en 08/113062-16 (tul) (P)",
				"extra": "ecli: ECLI:NL:RBOVE:2019:1347",
				"jurisdiction": "NL",
				"publicationDate": "19-04-2019",
				"url": "http://deeplink.rechtspraak.nl/uitspraak?id=ECLI:NL:RBOVE:2019:1347",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://e-justice.europa.eu/eclisearch/integrated/search.html?text=ECLI%3AEU%3AC%3A2015%3A148&ascending=false&sort=ECLI&lang=nl",
		"items": [
			{
				"itemType": "case",
				"creators": [],
				"dateDecided": "05-03-2015",
				"court": "Hof van Justitie (C)",
				"extra": "ecli: ECLI:EU:C:2015:148",
				"jurisdiction": "EU",
				"publicationDate": "09-10-2015",
				"url": "http://curia.europa.eu/juris/document/document.jsf?text=&docid=162686&doclang=NL",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://e-justice.europa.eu/eclisearch/integrated/search.html?text=ECLI:EU:C:2015:148&lang=en",
		"items": [
			{
				"itemType": "case",
				"creators": [],
				"dateDecided": "05-03-2015",
				"court": "Court of Justice (C)",
				"extra": "ecli: ECLI:EU:C:2015:148",
				"jurisdiction": "EU",
				"publicationDate": "09-10-2015",
				"url": "http://curia.europa.eu/juris/document/document.jsf?text=&docid=162686&doclang=EN",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://e-justice.europa.eu/eclisearch/integrated/search.html?text=ECLI:CZ:NS:2015:32.CDO.2051.2013.1",
		"items": [
			{
				"itemType": "case",
				"creators": [],
				"dateDecided": "13-07-2015",
				"abstractNote": "Judgement of the Supreme Court dated 4 November 2015, file number 32 Cdo 2051/2013 (invalidity of legal proceedings, conciliation procedure related to payments for medical care) The judgement factuall \n\ny related to payments for medical care provided. The health insurance company and the provider of medical services had made a contract on payments for medical care, and subsequently a few amendments were made setting limits of total payments for the given period to amount really paid in the preceding period. Medical care provided by the sued medical institution exceeded the agreed limit. Merit of the case was the question whether amendments to the general contract limiting amount of the payments (within the parties’ freedom of contract) were valid or whether the parties were obliged to act strictly within the limits set by the general agreement, and the amendments were invalid. The court of first instance based its decision on the principle of autonomous volition of the parties and the fact that the amendments limiting the payments were valid. The appellate court stated that the requirement to follow the general meeting based on the conciliation procedure was an example of legal regulation of peremptory nature. In the application for appellate review of the decision the plaintiff namely argued that necessity to follow result of the conciliation procedure did not relate to a specific agreement on amount of payments for provision of the medical services, and the method of determining conditions and amount of the payments, as it was decided by the appellate court, contradicted to prohibition of state aid in accordance with para. 1 of Art. 107 of TFEU and the judgement of the Court of Justice dated 24 July 2003, in case C-280/00, Altmark. The Supreme Court stated that public health insurance was governed by the legal regulation that, considering public interest in its proper functioning, was based on the provisions governed by public law, limiting the parties’ freedom of contract. The list of medical operations with point values, amount of a point value, etc. resulted from the conciliation procedure. Public interest in quality and accessibility of medical care as well as financial stability of the system related not only to the contract on provision and payment of medical care, but also to the connected legal facts making its particular content complete. As relates to conflict with the Union law, the Supreme Court stated that it wasn’t a conflict with the interior market, because the problem related to legal norm that subsequently related to the others in the same way, and that’s why the plaintiff wouldn’t have been given preferential treatment if compared with the other medical care providers, or no other condition would have been fulfilled so that it would have represented the conflict with the interior market within the intention of paragraph 1 of Art. 107 SFEU and within the framework of the decision made by the Court of Justice in the case of Altmark, because the trade between the member states of the European Union wouldn’t have been affected.",
				"court": "Nejvyšší soud ČR (NS)",
				"extra": "ecli: ECLI:CZ:NS:2015:32.CDO.2051.2013.1",
				"jurisdiction": "CZ",
				"publicationDate": "13-07-2015",
				"url": "http://www.aca-europe.eu/index.php/en/jurifast-en?ID=2738",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
