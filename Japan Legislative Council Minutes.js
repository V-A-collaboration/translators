{
	"translatorID": "0624386b-d70c-4a59-a95e-259656e82c27",
	"label": "Japan Legislative Council Minutes",
	"creator": "Frank Bennett",
	"target": "https?://(?:www.)*moj.go.jp/shingi1/",
	"minVersion": "1.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "g",
	"lastUpdated": "2013-08-03 05:47:18"
}

function sniffType (doc, url) {
    var ret;
    var m = url.match(/https?:\/\/(?:www\.)*moj\.go\.jp\/shingi1\/shingi.*\.html/);
    Zotero.debug("XXX m="+m);
    if (m) {
        var nodes = ZU.xpath(doc, '//div[@id="content"]/h2[contains(@class,"cnt_ttl01")]');
        Zotero.debug("XXX nodes="+nodes);
        if (nodes && nodes[0]) {
            var str = normalizeString(nodes[0].textContent);
            var mm = str.match(/.*第([0-9]+)回会議\s*\(平成([0-9]+)年([0-9]+)月([0-9]+)日.*\).*/);
            if (mm) {
                ret = "hearing";
            }
        }
    }
    if (!ret) {
        var nodes = ZU.xpath(doc, '//div[@id="content"]/h2[contains(@class,"cnt_ttl01")]');
        Zotero.debug("XXX nodes="+nodes);
        if (nodes && nodes[0]) {
            var mm = nodes[0].textContent.match(/^\s*法制審議会\s*[－-]*\s*.*部会\s*/);
            if (mm) {
                ret = "multiple";
            }
        }
    }
    return ret;
}

function DataObj (str, triedIndex) {
    this.triedIndex = triedIndex;
    this.data = {};
    this.refetch(str);
}

function normalizeString (str) {
    // Normalize some things
    var str = str.replace("　"," ","g");
    var str = str.replace("（","(","g");
    var str = str.replace("）",")","g");
    var numbers = ["０","１","２","３","４","５","６","７","８","９"];
    var lst = str.split("");
    for (var i=0,ilen=lst.length;i<ilen;i+=1) {
        if (numbers.indexOf(lst[i]) > -1) {
            lst[i] = numbers.indexOf(lst[i]);
        }
    }
    return lst.join("");
}

DataObj.prototype.refetch = function(str) {
    str = normalizeString(str);
    var m = str.match(/(?:法制審議会\s*[－-]*\s*)*(?:(.*部会))*\s*(?:第([0-9]+)回会議)*(?:\((平成)([0-9]+)年([0-9]+)月([0-9]+)日.*\))*/);
    if (m) {
        if (m[1]) {
            this.data.committee = "法制審議会" + m[1];
        }
        if (m[2]) {
            this.data.meetingNumber = m[2];
        }
        if (m[4] && m[5] && m[6]) { 
            this.data.date = (parseInt(m[4], 10) + 1988) + "-" + m[5] + "-" + m[6];
        }
    }
}

DataObj.prototype.makeItem = function() {
    var item = new Zotero.Item("hearing");
    item.url = this.data.url;
    item.jurisdiction = "jp";
    item.legislativeBody = "法務省";
    ZU.setMultiField(item, "legislativeBody", "Ministry of Justice", "en");
    item.committee = this.data.committee;
    if (this.data.committee) {
        Zotero.debug("XXX OOPS committee field should not go missing like this");
        var subcommittee = this.data.committee.replace(/^法制審議会/,"");
        ZU.setMultiField(item, "committee", "Legislative Council | " + subcommittee, "en");
    }
    item.meetingNumber = this.data.meetingNumber;
    item.date = this.data.date;
    if (this.data.pdfUrl) {
        var mimeType;
        var label;
        if (this.data.pdfUrl.match(/\.lzh$/)) {
            mimeType = "application/lzh";
            label = "LZH archive file";
        } else {
            mimeType = "application/pdf";
            label = "Full Text PDF";
        }
        item.attachments.push({url:this.data.pdfUrl,mimeType:mimeType,title:label});
    }
    item.complete();
}

function fixUrl (url) {
    if (url.match(/^\//)) {
        url = "http://www.moj.go.jp" + url;
    }
    return url;
}

function scrapeOneHearing (doc, url, data) {
    var dataObj;
    var str = ZU.xpath(doc, '//div[@id="content"]/h2[contains(@class,"cnt_ttl01")]')[0].textContent;
    if (data) {
        Zotero.debug("XXX myurl: "+url);
        for (var dataurl in data) {
            Zotero.debug("XXX   dataurl: "+dataurl);
        }
        dataObj = data[url];
    } else {
        dataObj = new DataObj(str);
    }

    dataObj.data.url = url;

    var linknode = ZU.xpath(doc, '//a[contains(text(),"ＰＤＦ版")]');
    if (linknode && linknode[0]) {
        dataObj.data.pdfUrl = linknode[0].getAttribute("href");
    }
    if (!dataObj.data.pdfUrl) {
        linknode = ZU.xpath(doc, '//a[contains(@href,".lzh")]');
        if (linknode && linknode[0]) {
            dataObj.data.pdfUrl = linknode[0].getAttribute("href");
        }
    }
    
    if (!dataObj.subcommittee && !dataObj.triedIndex) {
        // Get parent page and scrabble around for the committee name
        var parenturl = ZU.xpath(doc, '//div[@id="topicpath"]/a[last()]')[0].getAttribute("href");
        ZU.processDocuments(
            [parenturl], 
            function (doc, url) {
                var topnode = ZU.xpath(doc, '//div[@id="content"]/h2[contains(@class,"cnt_ttl01")]')[0];
                if (topnode) {
                    Zotero.debug("XXX SCRAPING WITH: "+topnode.textContent);
                    dataObj.refetch(topnode.textContent);
                }
                dataObj.makeItem();
            },
            function () {
                Zotero.done();
            }
        );
    } else {
        dataObj.makeItem();
    }
}

function detectWeb (doc, url) {
    return sniffType(doc, url);
}

function doWeb (doc, url) {
    var type = sniffType(doc, url);
    if (type === "multiple") {
        // scrape list titles and URLs
        // select
        // push urls and dataObj set to scrapeOneHearing()
        var items = {};
        var data = {};
        var nodes = ZU.xpath(doc, '//a[contains(@href,"/shingi1/")]');
        for (var i=0,ilen=nodes.length;i<ilen;i+=1) {
            var title = nodes[i].textContent;
            var dataObj = new DataObj(title, true);
            if (dataObj.data.date && dataObj.data.meetingNumber) {
                var url = fixUrl(nodes[i].getAttribute("href"));
                items[url] = title;
                // say that we've already seen the index page, thank you
                data[url] = dataObj;
            }
        }
        Zotero.selectItems(items, function (chosen) {
            var urls = [];
	        for (var j in chosen) {
		        urls.push(j);
	        };
            ZU.processDocuments(urls, function (doc, url) {
                scrapeOneHearing(doc, url, data);
            });
        });
    } else {
        scrapeOneHearing(doc, url);
    }
}
