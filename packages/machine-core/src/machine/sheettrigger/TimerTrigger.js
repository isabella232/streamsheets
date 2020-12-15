const AbstractStreamSheetTrigger = require('./AbstractStreamSheetTrigger');

const UNITS = {};
UNITS.ms = 1;
UNITS.s = 1000 * UNITS.ms;
UNITS.m = 60 * UNITS.s;
UNITS.h = 60 * UNITS.m;
UNITS.d = 24 * UNITS.h;

const parseTime = (time) => {
	const ms = Date.parse(time);
	return ms == null || isNaN(ms) ? null : ms;
};

const random = (nr) => Math.floor(Math.random() * Math.floor(nr));

const getStartInterval = (time) => {
	const now = Date.now();
	const ms = parseTime(time) || now;
	return ms > now ? ms - now : 1;
};
const getInterval = (config) => {
	const interval = config.type === 'random' ? random(2 * config.interval) : config.interval;
	return interval * UNITS[config.intervalUnit];
};
const clearTriggerInterval = (trigger) => {
	if (trigger._intervalId != null) {
		clearInterval(trigger._intervalId);
		trigger._intervalId = undefined;
	}
};
const registerTriggerInterval = (trigger, timeout = 1) => {
	clearTriggerInterval(trigger);
	// trigger._intervalId = setInterval(trigger._repeatStep, getInterval(trigger.config));
	trigger._intervalId = setTimeout(trigger._intervalTrigger, timeout);
};


const TIMER_DEF = {
	interval: 500,
	intervalUnit: 'ms'
};


class TimerTrigger extends AbstractStreamSheetTrigger {
	// call registered callback on given interval and with random distributed ticks
	constructor(config) {
		super(Object.assign({}, TIMER_DEF, config));
		this._intervalId = undefined;
		this._intervalTrigger = this._intervalTrigger.bind(this);
	}

	update(config = {}) {
		Object.assign(this.config, config);
		this.startTrigger = config.start;
	}

	get interval() {
		return this.config.interval;
	}
	get intervalUnit() {
		return this.config.intervalUnit;
	}

	step(manual) {
		if (manual) this.trigger();
	}
	start() {
		if (this.config.start) registerTriggerInterval(this, getStartInterval(this.config.start));
		else this._intervalTrigger();
	}
	stop(onUpdate, onProcessing) {
		if (!onProcessing) clearTriggerInterval(this);
		return super.stop(onUpdate, onProcessing);
	}
	pause() {
		clearTriggerInterval(this);
		super.pause();
	}
	resume() {
		registerTriggerInterval(this, getInterval(this.config));
		super.resume();
	}

	_intervalTrigger() {
		registerTriggerInterval(this, getInterval(this.config));
		this.trigger();
	}
}
TimerTrigger.TYPE_RANDOM = 'random';
TimerTrigger.TYPE_TIME = 'time';

module.exports = TimerTrigger;