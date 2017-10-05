'use strict';

const https = require('https');
const WsChat = require('wschatapi');

const dice = require('./dice');

let target = '#' + (process.argv[2] ? process.argv[2] : 'chat');

var ws = new WsChat('wss://sinair.ru/ws/chat');

ws.onOpen = function(){
	ws.joinRoom(target, (success, room) => {
		room.sendMessage('/color 8f8');
		room.sendMessage('/nick dicebot');
		room.onMessage = function(msg){
			if (msg.from == this.getMyMemberId()){
				return;
			}

			let sender = this.getMemberById(msg.from);
			if (sender.is_owner || sender.is_moder){
				if (msg.message == '/exit'){
					ws.close();
				}
			}
			
			try {
				if (msg.message.match(/^\d+[dдк]\d+([\+\-]\d+)?$/gi)){
					this.sendMessage(dice(msg.message));
				}

				if (msg.message.match(/^(бот|прогер|tproger),? ?анекдот$/)){
					https.get('https://tproger.ru/wp-content/plugins/citation-widget/getQuotes.php', (res) => {
						let rawData = '';
					    res.on('data', (chunk) => { rawData += chunk; });
						res.on('end', () => {
							this.sendMessage('> ' + rawData);
						});
					}).on('error', (e) => {
						console.error('Error get quote: ', e);
					});
				}
			} catch (e){
				console.log('Exception: ', e);
			}
		};
	});
};

ws.onConnectionError = function(err){
	console.log('Connect error: ', arguments);
}

ws.onError = function(err){
	console.log('Error: ', arguments);
};

ws.open();
