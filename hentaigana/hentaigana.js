var kana = {
	'hentaigana-a':
		{ '𛀂': 'a', '𛀅': 'a', '𛀃': 'a', '𛀄': 'a' },
	'hk':
		{ 'か': 'ka', 'き': 'ki', 'く': 'ku', 'け': 'ke', 'こ': 'ko' },
	'hs':
		{ 'さ': 'sa', 'し': 'shi', 'す': 'su', 'せ': 'se', 'そ': 'so' },
	'ht':
		{ 'た': 'ta', 'ち': 'chi', 'つ': 'tsu', 'て': 'te', 'と': 'to' },
	'hn':
		{ 'な': 'na', 'に': 'ni', 'ぬ': 'nu', 'ね': 'ne', 'の': 'no' },
	'hh':
		{ 'は': 'ha', 'ひ': 'hi', 'ふ': 'fu', 'へ': 'he', 'ほ': 'ho' },
	'hm':
		{ 'ま': 'ma', 'み': 'mi', 'む': 'mu', 'め': 'me', 'も': 'mo' },
	'hy':
		{ 'や': 'ya', 'ゆ': 'yu', 'よ': 'yo' },
	'hr':
		{ 'ら': 'ra', 'り': 'ri', 'る': 'ru', 'れ': 're', 'ろ': 'ro' },
	'hw':
		{ 'わ': 'wa', 'を': 'o' },
	'hn1':
		{ 'ん': 'n' },
}

var active = [];
var shuffled = [];

var replacements = {
	'o': ['wo'],
	'chi': ['ci'],
	'shi': ['si'],
	'tsu': ['tu'],
	'zu': ['du'],
	'ji': ['di', 'zi'],
	'fu': ['hu'],
	'ja': ['dya'],
	'jo': ['dyo'],
	'ju': ['dyu']
};

var cur_kana;
var cur_reading;

var total_answered = 0;
var total_correct = 0;

function save_settings() {
	inputs = document.getElementsByTagName('input');
	for (i = 0; i < inputs.length; i++) {
		if (inputs[i].type == 'checkbox') {
			checked = inputs[i].checked ? '1' : '0';
			localStorage.setItem('kana_' + inputs[i].id, checked);
		}
	}

	collect();
}

function load_settings() {
	inputs = document.getElementsByTagName('input');
	for (i = 0; i < inputs.length; i++) {
		if (inputs[i].type == 'checkbox') {
			var setting = localStorage.getItem('kana_' + inputs[i].id);
			if (setting === '1') {
				inputs[i].checked = true;
			} else if (setting === '0') {
				inputs[i].checked = false;
			}
		}
	}

	collect();
}

function check(set) {
	var trs = document.getElementsByClassName(set);
	for (i = 0; i < trs.length; i++) {
		var tds = trs[i].children;
		for (x = 0; x < tds.length; x++) {
			if (tds[x].children[0].id != 'KOI-WIN') {
				tds[x].children[0].checked = true;
			}
		}
	}
	save_settings();
}

function uncheck(set) {
	var trs = document.getElementsByClassName(set);
	for (i = 0; i < trs.length; i++) {
		var tds = trs[i].children;
		for (x = 0; x < tds.length; x++) {
			tds[x].children[0].checked = false;
		}
	}
	save_settings();
}

function shuffle(orig_array) {
	var array = orig_array.slice(0);
	var currentIndex = array.length, temporaryValue, randomIndex;

	while (0 !== currentIndex) {

		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}

	return array;
}

function collect() {
	kanacheck = document.getElementsByClassName('kanacheck');
	active = [];
	shuffled = [];
	for (i = 0; i < kanacheck.length; i++) {
		cur = kanacheck[i];
		if (cur.checked == true) {
			for (p in kana[cur.id]) {
				active.push([p, kana[cur.id][p]]);
			}
		}
	}
}

function show_kana() {
	wrong = false;
	document.getElementById('input_box').value = '';

	if (active.length == 0) {
		document.getElementById('hsingle').checked = true;
		save_settings();
	}

	if (total_answered > 0) {
		document.getElementById('count').innerHTML = total_correct + '/' + total_answered;
	}

	if (shuffled.length == 0) {
		shuffled = shuffle(active);
	}

	if (cur_kana && shuffled[0][0] == cur_kana) {
		shuffled.shift();
	}

	cur_kana = shuffled[0][0];
	cur_reading = shuffled[0][1];

	shuffled.shift();

	document.getElementById('kana').innerHTML = cur_kana;

	document.getElementById('answer').innerHTML = cur_reading;
}

function check_answer() {
	answer = document.getElementById('input_box').value.toLowerCase();
	if (!answer) {
		answer = 'x';
	}

	chars = answer.split('');

	possible = [cur_reading];
	if (cur_reading in replacements) {
		possible = possible.concat(replacements[cur_reading]);
	}

	for (i = 0; i < chars.length; i++) {
		var err = true;

		for (x = 0; x < possible.length; x++) {
			if (chars[i] == possible[x].charAt(i)) {
				err = false;
			}
			if (answer == possible[x]) {
				answer = cur_reading;
			}
		}

		if (err) {
			break;
		}
	}

	if (err) {
		wrong = true;
		document.getElementById('message').innerHTML = '<span id="wrong">' + cur_kana + ' = ' + cur_reading + '</span>';
	}

	if (answer == cur_reading) {
		total_answered += 1;
		if (!wrong) {
			total_correct += 1;
		}
		show_kana();
	}
}

function force_next() {
	if (shuffled.length > 3) {
		shuffled.splice(3, 0, [cur_kana, cur_reading]);
	}
	if (shuffled.length > 13) {
		shuffled.splice(13, 0, [cur_kana, cur_reading]);
	}
	total_answered += 1;

	show_kana();
}

function show_answer() {
	document.getElementById('answer').style.visibility = 'visible';
}

function hide_answer() {
	document.getElementById('answer').style.visibility = 'hidden';
}

function play_sound() {
	var audio = new Audio('../audio/' + cur_reading + '.mp3');
	audio.play();
	document.getElementById('input_box').focus();
}

function play_other(file) {
	var audio = new Audio('../audio/' + file + '.mp3');
	audio.play();
}

function stroke_order() {
	document.getElementById('kana').innerHTML = '<img src="stroke/' + cur_kana + '.gif" id="stroke" />';
	document.getElementById('input_box').focus();
}


onload = function () {
	load_settings();

	inputs = document.getElementsByTagName('input');
	for (i = 0; i < inputs.length; i++) {
		if (inputs[i].type == 'checkbox') {
			inputs[i].onclick = save_settings;
			inputs[i].onpropertychange = inputs[i].oninput;
		}
	}

	show_kana();

	var kana_div = document.getElementById('kana');
	kana_div.onmouseover = show_answer;
	kana_div.onmouseout = hide_answer;

	var answer_input = document.getElementById('input_box');
	answer_input.focus();
	answer_input.oninput = check_answer;
	answer_input.onpropertychange = answer_input.oninput;

	document.body.onkeydown = function (e) {
		let focus_keys = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
		let submit_keys = [" ", "Enter"];
		if ((focus_keys.includes(e.key) || submit_keys.includes(e.key)) && !(e.ctrlKey || e.altKey || e.metaKey)) {
			document.getElementById('input_box').focus();
		}

		if (submit_keys.includes(e.key)) {
			e.preventDefault();
			if (!wrong) {
				check_answer();
			} else {
				force_next();
			}
		}
	}
}