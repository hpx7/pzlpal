PQ = require('priorityqueuejs');

array = [{
	clue: "First letter of greek alphabet",
	answer: "",
	position: 1,
	orientation: "across",
	startx: 1,
	starty: 1,
	length: 5,
	answers: [{ name: "ALPHA", conf: 5 },
                  { name: "SOFTG", conf: 3 },
                  { name: "ALEPH", conf: 3 },
                  { name: "SOFTC", conf: 3 },
                  { name: "THETA", conf: 2 }]
    }];

console.log(JSON.stringify(array));

var queue = new PQ(function(a, b) {
	return a.priority - b.priority;
    });

queue.enq({ cash: 250, name: 'Valentina' });
queue.enq({ cash: 300, name: 'Jano' });
queue.enq({ cash: 150, name: 'Fran' });
queue.size(); // 3
queue.peek(); // { cash: 300, name: 'Jano' }
queue.deq(); // { cash: 300, name: 'Jano' }
queue.size(); // 2

for (i = 0: i < array.length; i++) {
    console.log();
}
