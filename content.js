var codeLookup = {
	'subtype_code': 'b',
	'affiliation_code': 'a',
	'faction_code': 'f',
	'type_code': 't',
	'rarity_code': 'y',
	'set_code': 's',
	'text_code': 'x'
};

class Query {
  constructor(queryString) {
	var fields = queryString.split(' ');

	var query = {};

	for (var i = 0; i < fields.length; i++) {
		var field = fields[i].split(':');
		if (field.length < 2) {
			continue;
		}
		var key = field[0];

		if (key == 'x') {
  			var freeText = queryString.match(/x:"(.*?)"/);
  			if (freeText && freeText.length > 1) {
  				query[key] = [freeText[1]];
  			} else {
				query[key] = [field[1]];
  			}
		} else {
			var values = field[1].split('|');
			query[key] = values;
		}
	}

	this.queryObject = query;
  }

  getValue(key) {
  	if (this.queryObject.hasOwnProperty(key)) {
  		return this.queryObject[key].join('|');
  	}
  	return false;
  }

  containsKey(key) {
  	return this.queryObject.hasOwnProperty(key);
  }

  containsValue(key, value) {
  	if (this.queryObject.hasOwnProperty(key)) {
  		if (value.indexOf('|') > -1) {
  			return this.queryObject[key].join('|') == value.toLowerCase();
  		} else {
  			return this.queryObject[key].indexOf(value.toLowerCase()) > -1;
  		}
  	}
  	return false;
  }

  removeKey(key) {
  	if (this.queryObject.hasOwnProperty(key)) {
  		delete this.queryObject[key];
  	}
  }

  removeValue(key, value) {
  	if (this.queryObject.hasOwnProperty(key)) {
  		if (value.indexOf('|') > -1) {
  			var values = value.split('|');
  			for (var i = 0; i < values.length; i++) {
  				this.removeValue(key, values[i]);
  			}
  		} else {
	  		var valueInd = this.queryObject[key].indexOf(value.toLowerCase());
	  		if (valueInd > -1) {
	  			this.queryObject[key].splice(valueInd, 1);
	  		}
  		}
  	}
  }

  addToQuery(key, value) {
	var queryValues = [];
	if (this.queryObject.hasOwnProperty(key)) {
		queryValues = this.queryObject[key];
	}
	if (queryValues.indexOf(value.toLowerCase()) == -1) {
		queryValues.push(value.toLowerCase());
		this.queryObject[key] = queryValues;
	}
  }

  toString() {
	var queryString = '';
	var queryKeys = Object.keys(this.queryObject);
	for (var i = 0; i < queryKeys.length; i++) {
		var key = queryKeys[i];
		if (this.queryObject[key].length > 0) {
			queryString += ' ' + key + ':' + this.queryObject[key].join('|');
		}
	}
	return queryString;
  }
}

var search = document.getElementById('search-form');

var textSearch = search.getElementsByTagName('input')[0];

var searchButtons = document.createElement('div');

var query;

if (textSearch) {
	query = new Query(textSearch.value);
}

if (search) {
	createSearchHtml();
	search.insertBefore(searchButtons, search.childNodes[0]);
	search.onsubmit = buildSearchQuery;
}

function buildSearchQuery(event) {
	query = new Query(textSearch.value);
	var inputs = searchButtons.getElementsByTagName('input');
	for (var i = 0; i < inputs.length; i++) {
		var group = inputs[i].parentElement.parentElement.getAttribute('data-filter');
		var groupCode = codeLookup[group];

		if (inputs[i].type == "checkbox" || inputs[i].type == "radio") {
			var name = inputs[i].parentElement.getAttribute('data-code');
			var enabled = inputs[i].checked;
			if (enabled && inputs[i].type == "radio") {
				query.removeKey(groupCode);
			}

			if (enabled && name != '') {
				query.addToQuery(groupCode, name);
			}
		} else if (inputs[i].type == "text" && inputs[i].value != '') {
			query.addToQuery(groupCode, '"' + inputs[i].value + '"');
		}
		inputs[i].disabled = true;
	}
	textSearch.value = query.toString();
	return true;
}

function createSearchHtml() {
	var html = `<div class="row">
    <div class="col-sm-6" style="margin-bottom:10px">
        <div class="btn-group btn-group-justified" data-filter="affiliation_code" data-toggle="buttons">
        	<label class="btn btn-default btn-sm" data-code="neutral" title="Neutral">
                <input type="checkbox" name="neutral">
                <strong>Neutral</strong>
            </label>
            <label class="btn btn-default btn-sm" data-code="hero" title="Hero">
                <input type="checkbox" name="hero">
                <strong>Hero</strong>
            </label>
            <label class="btn btn-default btn-sm" data-code="villain" title="Villain">
                <input type="checkbox" name="villain">
                <strong>Villain</strong>
            </label>
        </div>
    </div>
    <div class="col-sm-6" style="margin-bottom:10px">
        <div class="btn-group btn-group-justified" data-filter="faction_code" data-toggle="buttons"><label
                class="btn btn-default btn-sm fg-gray" data-code="gray" title="General">
                <input type="checkbox" name="gray">
                <span class="fa fa-square"></span>
            </label>
            <label class="btn btn-default btn-sm fg-blue" data-code="blue" title="Force">
                <input type="checkbox" name="blue">
                <span class="fa fa-square"></span>
            </label>
            <label class="btn btn-default btn-sm fg-red" data-code="red" title="Command">
                <input type="checkbox" name="red">
                <span class="fa fa-square"></span>
            </label>
            <label class="btn btn-default btn-sm fg-yellow" data-code="yellow" title="Rogue">
                <input type="checkbox" name="yellow">
                <span class="fa fa-square"></span>
            </label>
        </div>
    </div>
    <div class="col-sm-6" style="margin-bottom:10px">
        <div class="btn-group btn-group-justified" data-filter="rarity_code" data-toggle="buttons">
        	<label class="btn btn-default btn-sm fg-rarity-S" data-code="S" title="Starter">
                <input type="checkbox" name="S">
                <span class="icon-collectors"></span>
            </label>
            <label class="btn btn-default btn-sm fg-rarity-C" data-code="C" title="Common">
                <input type="checkbox" name="C">
                <span class="icon-collectors"></span>
            </label>
            <label class="btn btn-default btn-sm fg-rarity-U" data-code="U" title="Uncommon">
                <input type="checkbox" name="U">
                <span class="icon-collectors"></span>
            </label>
            <label class="btn btn-default btn-sm fg-rarity-R" data-code="R" title="Rare">
                <input type="checkbox" name="R">
                <span class="icon-collectors"></span>
            </label>
            <label class="btn btn-default btn-sm fg-rarity-L" data-code="L" title="Legendary">
                <input type="checkbox" name="L">
                <span class="icon-collectors"></span>
            </label>
        </div>
    </div>
    <div class="col-sm-6" style="margin-bottom:10px">
        <div class="btn-group btn-group-justified" data-filter="type_code" data-toggle="buttons">
        	<label class="btn btn-default btn-sm" data-code="battlefield" title="Battlefield">
                <input type="checkbox" name="battlefield">
                <span class="icon-battlefield"></span>
            </label>
            <label class="btn btn-default btn-sm" data-code="plot" title="Plot">
                <input type="checkbox" name="plot">
                <span class="icon-plot"></span>
            </label>
            <label class="btn btn-default btn-sm" data-code="character" title="Character">
                <input type="checkbox" name="character">
                <span class="icon-character"></span>
            </label>
            <label class="btn btn-default btn-sm" data-code="upgrade" title="Upgrade">
                <input type="checkbox" name="upgrade">
                <span class="icon-upgrade""></span>
            </label>
            <label class="btn btn-default btn-sm" data-code="downgrade" title="Downgrade">
                <input type="checkbox" name="downgrade">
                <span class="icon-downgrade"></span>
            </label>
            <label class="btn btn-default btn-sm" data-code="support" title="Support">
                <input type="checkbox" name="support">
                <span class="icon-support"></span>
            </label>
            <label class="btn btn-default btn-sm" data-code="event" title="Event">
                <input type="checkbox" name="event">
                <span class="icon-event"></span>
            </label>
        </div>
    </div>
    <div class="col-sm-6" style="margin-bottom:10px">
        <div class="btn-group btn-group-justified" data-filter="set_code" data-toggle="buttons">
            <label class="btn btn-default btn-sm" data-code="tpg|leg|wotf|riv|atg|conv|soh|aon" title="Standard">
                <input type="radio" name="set_select">
                <strong>Standard</strong>
            </label>
            <label class="btn btn-default btn-sm" data-code="conv|soh|aon" title="Trilogy">
                <input type="radio" name="set_select">
                <strong>Trilogy</strong>
            </label>
            <label class="btn btn-default btn-sm" data-code="" title="Infinite">
                <input type="radio" name="set_select">
                <strong>Infinite</strong>
            </label>
        </div>
    </div>
    <div class="col-sm-3" style="margin-bottom:10px" data-filter="subtype_code">
        <div data-code="subtype">
            <input class="form-control" name="subtype" type="text" size="30" name="q" placeholder="Subtype" value="" title="Subtype" title="">
        </div>
    </div>
    <div class="col-sm-3" style="margin-bottom:10px" data-filter="text_code">
        <div data-code="text">
            <input class="form-control" name="text" type="text" size="30" name="q" placeholder="Card Text" value="" title="Card Text" title="">
        </div>
    </div>
</div>`;
	
	searchButtons.innerHTML = html;
	searchButtons.className = 'col-sm-12';
	var inputs = searchButtons.getElementsByTagName('input');
	for (var i = 0; i < inputs.length; i++) {
		var group = inputs[i].parentElement.parentElement.getAttribute('data-filter');
		var groupCode = codeLookup[group];
		if (inputs[i].type == "checkbox" || inputs[i].type == "radio") {
			var value = inputs[i].parentElement.getAttribute('data-code');

			if (query.containsValue(groupCode, value)) {
				inputs[i].checked = true;
				inputs[i].parentElement.className += ' active';
				query.removeValue(groupCode, value);
			}
		} else if (inputs[i].type == "text") {
			if (query.containsKey(groupCode)) {
				inputs[i].value = query.getValue(groupCode);
				query.removeKey(groupCode);
			}
		}
	}

	textSearch.value = query.toString();

}

