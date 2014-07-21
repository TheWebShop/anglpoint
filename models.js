'use strict';

/* Data models for any lists/libraries to be used for app */

var models = [
	{
		item: {
			enableCaching: true,
			listName: "Some Site",
			siteUrl: "/some/site",
			restParams: "?$orderby=Modified%20desc&$expand=Keywords,ItemType"
		}
	}
];
