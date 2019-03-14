{
	"translatorID": "75ba85cd-2a9b-41f3-b717-7c582f29610e",
	"label": "Jurisquare",
	"creator": "Mathijs van Westendorp",
	"target": "^https?://jurisquare.be/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2019-03-14 12:15:11"
}

function attr(docOrElem,selector,attr,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.getAttribute(attr):null}function text(docOrElem,selector,index){var elem=index?docOrElem.querySelectorAll(selector).item(index):docOrElem.querySelector(selector);return elem?elem.textContent:null}

function detectWeb(doc, url) {
	// Adjust the inspection of url as required
	if (( url.indexOf('search') != -1 || url.indexOf('content/index') ) && getSearchResults(doc, true)) {
		return 'multiple';
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
		Zotero.selectItems(getSearchResults(doc, false), function (items) {
			if (!items) {
				return true;
			}
			var articles = [];
			for (var i in items) {
				articles.push(i);
			}
			ZU.processDocuments(articles, scrape);
		});
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
	var ISBN = url.match(/book\/([\d\-]{10,18})\//);
	if (ISBN){
		ISBN = ISBN[1]; //select match group
		Z.debug("RIS failed, trying ISBN: " + ISBN);
		scrapeBook(ISBN);
	}
	else{
		var baseURL = url.match(/(^.*\/)[^\/]*?#/);
		if (baseURL){
			baseURL = baseURL[1];
		}
		Z.debug(baseURL)
		var risURL = baseURL + "reference.ris";
		Z.debug(risURL)
		
		var pdfURL;
		if (doc.getElementsByClassName("greybutton pdf")[0]){
			pdfURL = baseURL + "document.pdf";
		}
		Z.debug("pdfURL: " + pdfURL);
		scrapeRIS(doc, url, risURL, pdfURL);
	}
}


function scrapeBook(ISBN){
	//parse book using ISBN
	var item = new Zotero.Item("book")
	item.ISBN = ZU.cleanISBN(ISBN);
	Z.debug("Searching for additional metadata by ISBN: " + item.ISBN);
	var search = Zotero.loadTranslator("search");
	search.setHandler("translators", function(obj, translators) {
		search.setTranslator(translators);
		search.setHandler("itemDone", function(obj, lookupItem) {
			Z.debug(lookupItem.libraryCatalog);
			if (lookupItem){
				item = lookupItem;
			}
		});
		search.translate();
	});
	search.setHandler("error", function(error) {
		// we mostly need this handler to prevent the default one from kicking in
		Z.debug("ISBN search for " + item.ISBN + " failed: " + error);
	});
	search.setHandler("done", function() {
		item.complete();
	});
	search.setSearch({ ISBN: item.ISBN });
	search.getTranslators();
}

function scrapeRIS(doc, url, risURL, pdfURL){
	ZU.doGet(risURL, function(text) {
		Z.debug("Trying to get RIS from page.");
		var translator = Zotero.loadTranslator("import");
		translator.setTranslator("32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7");
		translator.setString(text);
		translator.setHandler("itemDone", function(obj, item) {
			// TODO fix access problem jurisquare
			/*if (pdfURL) {
				item.attachments.push({
					url: pdfURL.href,
					title: "Full Text PDF",
					mimeType: "application/pdf"
				});
			}
			item.attachments.push({
				title: "Snapshot",
				document: doc
			});*/
			//item.archive = "Jurisquare.be"
			Z.debug("Item title: " + item.title);
			item.complete();
			
		});
		translator.translate();
	});
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://jurisquare.be/nl/journal/lens/2019-1/aansprakelijkheid-hulpverlener-voor-het-plaatsen-van-een-totale-heup-prothese/index.html#page/5/search/",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Aansprakelijkheid hulpverlener voor het plaatsen van een Totale Heup Prothese",
				"creators": [
					{
						"lastName": "Hiemstra",
						"firstName": "J.",
						"creatorType": "author",
						"multi": {
							"_key": {}
						}
					},
					{
						"lastName": "Peters",
						"firstName": "R.",
						"creatorType": "author",
						"multi": {
							"_key": {}
						}
					}
				],
				"date": "2019",
				"issue": "1",
				"journalAbbreviation": "LenS",
				"libraryCatalog": "Jurisquare",
				"pages": "5-13",
				"publicationTitle": "Letsel & Schade (L&S)",
				"url": "https://www.jurisquare.be/en/journal/lens/2019-1/aansprakelijkheid-hulpverlener-voor-het-plaatsen-van-een-totale-heup-prothese/",
				"volume": "2019",
				"attachments": [
					{
						"title": "Attachment"
					}
				],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://jurisquare.be/nl/book/9789048635153/index.html",
		"items": [
			{
				"itemType": "book",
				"title": "Schets van het familiaal vermogensrecht.",
				"creators": [
					{
						"lastName": "Declerck",
						"firstName": "Charlotte",
						"creatorType": "author",
						"multi": {
							"_key": {}
						}
					},
					{
						"lastName": "Pintens",
						"firstName": "Walter",
						"creatorType": "author",
						"multi": {
							"_key": {}
						}
					}
				],
				"date": "2019",
				"ISBN": "9789048635153",
				"abstractNote": "Dit boek verduidelijkt de algemene beginselen van het familiaal vermogensrecht. Zelfs de meest elementaire beginselen kunnen niet worden uiteengezet zonder de lezer enigszins vertrouwd te maken met een aantal vaktechnische begrippen en technieken. 0In deze zevende editie werd rekening gehouden met belangrijke nieuwe wetgeving, zoals de wet van 31 juli 2017 over het nieuwe erfrecht en de wet van 22 juli 2018 over het nieuwe huwelijksvermogensrecht.",
				"extra": "OCLC: 1089234168",
				"language": "Dutch",
				"libraryCatalog": "Open WorldCat",
				"place": "Brugge",
				"publisher": "Die Keure",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://jurisquare.be/nl/book/978-2-8072-0510-9/index.html",
		"items": [
			{
				"itemType": "book",
				"title": "En faut-il peu pour être heureux ? Conditions de vie, bonheur et bien-être en Belgique.",
				"creators": [
					{
						"lastName": "Capéau",
						"firstName": "Bart",
						"creatorType": "author",
						"multi": {
							"_key": {}
						}
					}
				],
				"date": "2019",
				"ISBN": "9782807205109",
				"abstractNote": "Qu?est-ce qu?une belle vie ? Pour la plupart des gens, la notion de bien-être s?étend au-delà de la richesse financière ou matérielle. En effet, beaucoup d?aspects non matériels, tels que la santé, la vie de famille, le cadre de vie, la répartition du temps et la qualité du travail, sont au moins aussi importants. Tous ces aspects influencent la mesure dans laquelle les gens sont satisfaits de leur vie et se sentent heureux.0Dans ce livre, les auteurs soutiennent toutefois que le bonheur et la satisfaction à l?égard de la vie ne sont pas de bons indicateurs pour la mesure du bien-être. Ils proposent une méthode alternative, celle du revenu équivalent, tenant non seulement compte des différentes dimensions du bien-être, mais également de l?opinion qu?ont les individus quant à ce qui est important dans leur propre vie.0Le livre ne se base pas que sur de la théorie. Une enquête à grande échelle menée auprès d?un échantillon représentatif de plus de 3.000 adultes issus de 2.000 familles belges a permis de décrire de manière détaillée les différents aspects du bien-être individuel des Belges. Son originalité réside dans l?attention portée à la répartition inégale de différents aspects du bien-être au sein même des familles.0Il ressort de l?enquête que certains Belges cumulent des désavantages dans plusieurs dimensions du bien-être. La méthode du revenu équivalent permet d?identifier les personnes les plus démunies dans notre société, qui ne s?avèrent pas nécessairement être celles qui perçoivent les revenus les plus faibles ni les plus malheureuses. Ces personnes méritent, selon les auteurs, une attention particulière de la part des responsables politiques.",
				"extra": "OCLC: 1082324663",
				"language": "French",
				"libraryCatalog": "Open WorldCat",
				"place": "Louvain-La Neuve",
				"publisher": "Anthemis",
				"shortTitle": "En faut-il peu pour être heureux ?",
				"attachments": [],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
