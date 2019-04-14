/**
 * @jsx React.DOM
 */
// import React from "react"
// import reactDom from "react-dom"

var BODY = 1,
	FOOD = 2;
var KEYS = {
	left: 37,
	up: 38,
	right: 39,
	down: 40
};
var DIRS = {
	37: true,
	38: true,
	39: true,
	40: true
};

// Not being used yet
var audio = new Audio("Lil Nas X - Old Town Road (feat. Billy Ray Cyrus) [Remix].mp3");

// Variables for speed manipulation. 
var speedOne = true;
var speedTwo = false;
var speedThree = false;
var speed = Number;

var number = Number;


var SnakeGame = React.createClass({
	displayName: 'SnakeGame',
	getInitialState: function () {
		var start = this.props.startIndex || 22;
		var snake = [start],
			board = [];
		board[start] = BODY;
		return {
			snake: snake,
			board: board,
			growth: 0,
			paused: true,
			gameOver: false,
			direction: KEYS.right,
		}
	},

	componentDidMount: function () {
		this._resume();
	},

	_reset: React.autoBind(function () {
		this.setState(this.getInitialState());
		this._resume();
	}),

	_pause: React.autoBind(function () {
		if (this.state.gameOver || this.state.paused) {
			return;
		}
		this.setState({
			paused: true
		});
	}),

	_resume: React.autoBind(function () {
		if (this.state.gameOver || !this.state.paused) {
			return;
		}
		this.setState({
			paused: false
		});
		this.refs.board.getDOMNode().focus();
		setTimeout(this._tick, speed);

	}),

	// Sets speed based off button selected. 
	_currentSpeed: React.autoBind(function () {
		if (speedOne) {
			speed = 100;
		}
		if (speedTwo) {
			speed = 50;
		}
		if (speedThree) {
			speed = 10;
		}
		this.refs.board.getDOMNode().focus();
		setTimeout(this._tick, speed);
	}),

	// Sets speed to speed one 
	_speedOne: React.autoBind(function () {
		speedOne = true;
		speedTwo = false;
		speedThree = false;
		_currentSpeed();
	}),

	// Sets speed to speed Two 
	_speedTwo: React.autoBind(function () {
		speedOne = false;
		speedTwo = true;
		speedThree = false;
		_currentSpeed();
	}),

	// Sets speed to speed Three 
	_speedThree: React.autoBind(function () {
		speedOne = false;
		speedTwo = false;
		speedThree = true;
		_currentSpeed();
	}),

	// Sets snake color 
	_snakeColor: React.autoBind(function () {

		if (this.state.snake.length < 10) {
			number = 1;
		} else if (this.state.snake.length < 20) {
			number = 2;
		} else if (this.state.snake.length < 30) {
			number = 3;
		} else if (this.state.snake.length < 40) {
			number = 4;
		}else if (this.state.snake.length < 50) {
			number = 5;
		}
	}),

	_tick: React.autoBind(function () {
		if (this.state.paused) {
			return;
		}
		var snake = this.state.snake;
		var board = this.state.board;
		var growth = this.state.growth;
		var direction = this.state.direction;

		var numRows = this.props.numRows || 20;
		var numCols = this.props.numCols || 20;
		var head = getNextIndex(snake[0], direction, numRows, numCols);

		if (snake.indexOf(head) != -1) {
			this.setState({
				gameOver: true
			});
			return;
		}

		var needsFood = board[head] == FOOD || snake.length == 1;
		if (needsFood) {
			var ii, numCells = numRows * numCols;
			do {
				ii = Math.floor(Math.random() * numCells);
			} while (board[ii]);
			board[ii] = FOOD;
			growth += 2;
		} else if (growth) {
			growth -= 1;
		} else {
			board[snake.pop()] = null;
		}

		snake.unshift(head);
		board[head] = BODY;

		if (this._nextDirection) {
			direction = this._nextDirection;
			this._nextDirection = null;
		}

		this.setState({
			snake: snake,
			board: board,
			growth: growth,
			direction: direction,
		});

		// Replaced method to change speed. 
		this._currentSpeed();

	}),

	_handleKey: React.autoBind(function (event) {
		var direction = event.nativeEvent.keyCode;
		var difference = Math.abs(this.state.direction - direction);
		// if key is invalid, or the same, or in the opposite direction, ignore it
		if (DIRS[direction] && difference !== 0 && difference !== 2) {
			this._nextDirection = direction;
		}
	}),

	render: function () {
		var cells = [];
		var numRows = this.props.numRows || 20;
		var numCols = this.props.numCols || 20;
		var cellSize = this.props.cellSize || 30;

		this._snakeColor();

		for (var row = 0; row < numRows; row++) {
			for (var col = 0; col < numCols; col++) {
				var code = this.state.board[numCols * row + col];
				var type = code == BODY ? 'body' : code == FOOD ? 'food' : 'null';
				if (type == 'body') {
					cells.push(React.DOM.div({
						className: type + number + '-cell'
					}, null))
				} else {
					cells.push(React.DOM.div({
						className: type + '-cell'
					}, null));
				}
			}
		}

		// Added 3 speed buttons, pause button & title. 
		return (
			React.DOM.div({
				className: "snake-game"
			}, [
        React.DOM.h1({
					className: "snake-header"
				}, ["Snake Game"]),
        React.DOM.h1({
					className: "snake-score"
				}, ["Length: ", this.state.snake.length]),
		React.DOM.button({
					onClick: this._pause
				}, "Pause"),
		React.DOM.button({
					onClick: this._speedOne
				}, "Beginner"),
		React.DOM.button({
					onClick: this._speedTwo
				}, "Intermediate"),
		React.DOM.button({
					onClick: this._speedThree
				}, "Expert"),
		React.DOM.h1({
					className: "snake-score"
				}, [""]),
        React.DOM.div({
						ref: "board",
						className: 'snake-board' + (this.state.gameOver ? ' game-over' : ''),
						tabIndex: 0,
						onFocus: this._resume,
						onKeyDown: this._handleKey,
						style: {
							width: numCols * cellSize,
							height: numRows * cellSize
						}
					},
					cells
				),
        React.DOM.div({
					className: "snake-controls"
				}, [
          this.state.paused ? React.DOM.button({
						onClick: this._resume
					}, "Resume") : null,
          this.state.gameOver ? React.DOM.button({
						onClick: this._reset
					}, "New Game") : null,
        ])
      ])
		);
	}
});


function getNextIndex(head, direction, numRows, numCols) {
	// translate index into x/y coords to make math easier
	var x = head % numCols;
	var y = Math.floor(head / numCols);

	// move forward one step in the correct direction, wrapping if needed
	switch (direction) {
		case KEYS.up:
			y = y <= 0 ? numRows - 1 : y - 1;
			break;
		case KEYS.down:
			y = y >= numRows - 1 ? 0 : y + 1;
			break;
		case KEYS.left:
			x = x <= 0 ? numCols - 1 : x - 1;
			break;
		case KEYS.right:
			x = x >= numCols - 1 ? 0 : x + 1;
			break;
		default:
			return;
	}

	// translate new x/y coords back into array index
	return (numCols * y) + x;
}

React.renderComponent(SnakeGame(null, null), document.body);
