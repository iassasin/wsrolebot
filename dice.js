'use strict';

let d = {
	exp: '', pos: 0, res: '',

	doDice: function(c, m, b){
		var r = {0:0}, i;
		for (i = 1; i <= c; ++i){
			var k = Math.floor(Math.random() * m + 1);
			r[0] += k;
			r[i] = k;
		}
		r[0] += b;
		return r;
	},

	token: function(){
		if (this.pos >= this.exp.length){
			return null;
		}
		var c = this.exp[this.pos];
		if (c == '(' || c == ')'){
			++this.pos;
			return c;
		} else if (c.search(/[dдк]/i) != -1){
			++this.pos;
			return 'd';
		} else if (c.search(/[\d\+\-]/) != -1){
			var l = this.pos++;
			while (this.pos < this.exp.length && this.exp[this.pos].search(/\d/) != -1){
				++this.pos;
			}
			return this.exp.slice(l, this.pos);
		}
		return null;
	},

	parse: function(exp){
		if (exp != undefined){
			this.pos = 0;
			this.exp = exp;
			this.res = '';
		}

		var r = {};
		var i, t;

		for (i = 0; i < 3; ++i){
			t = this.token();
			if (t === null && i == 2){
				r[i] = 0;
				break;
			}
//				alert(''+i + '|' + t);
			if (t.search(/[\+\-]?\d+/) != -1){
//					alert('i|' + +t);
				r[i] = +t;
			} else if (t == '('){
//					alert('()|()');
				r[i] = this.parse();
				if (r[i] === null){
					return null;
				}
//					alert(')|');
			} else if (t == 'd'){
//					alert('d()|' + t);
				--i;
			} else if (t == ')'){
				--this.pos;
			} else {
				return null;
			}
		}

		t = this.token();
//			alert('|' + t);
		if (t != ')' && t !== null){
			return null;
		}

		return r;
	},

	calc: function(r){
		if (r === null){
			return null;
		}

		if (r === undefined){
			return 0;
		} else if ((typeof r) == 'number'){
			return r;
		} else if ((typeof r) != 'object'){
			return 0;
		}

//			alert(''+r + '|' + r[0] + '|' + r[1] + '|' + r[2]);
		var c = this.calc(r[0]);
//			alert('c|'+c);
		if (c < 1)		c = 1;
		if (c > 10)	c = 10;

		var m = this.calc(r[1]);
//			alert('m|'+m);
		if (m < 1) m = 1;
		if (m > 1000) m = 1000;

		var b = this.calc(r[2]);
//			alert('b|'+b);

//			alert(''+c + '|' + m + '|' + b);
		this.res += ''+c + 'd' + m + (b != 0 ? (b > 0 ? '+' + b : ''+b) : '');
		var rs = this.doDice(c, m, b);

		if (c > 1 || b != 0){
			this.res += ' = ';
			for (var i = 1; i <= c; ++i){
				this.res += '[' + rs[i] + ']';
			}
		}
		if (b != 0){
			this.res += (b > 0 ? '+' + b : ''+b);
		}
		this.res += ' = [' + rs[0] + ']\n';

		return rs[0];
	},

	dice: function(exp){
		this.calc(this.parse(exp));
		return this.res;
	}
};

module.exports = function(dicestr){
	return d.dice(dicestr);
};
