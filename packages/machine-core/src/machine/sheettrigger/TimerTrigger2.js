/********************************************************************************
 * Copyright (c) 2021 Cedalo AG
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 ********************************************************************************/
const BaseTrigger2 = require('./BaseTrigger2');
const { ManualStepCycle, RepeatUntilCycle, TimerCycle } = require('./cycles');

const UNITS = {};
UNITS.ms = 1;
UNITS.s = 1000 * UNITS.ms;
UNITS.m = 60 * UNITS.s;
UNITS.h = 60 * UNITS.m;
UNITS.d = 24 * UNITS.h;

const TYPE = {
	RANDOM: 'random',
	TIME: 'time'
};

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

class IntervalCycle extends TimerCycle {
	activate() {
		super.activate();
		this.schedule();
	}
	getCycleTime() {
		return this.trigger.interval * UNITS[this.trigger.intervalUnit];
	}
	step() {
		this.trigger.streamsheet.stats.steps += 1;
		if (this.trigger.isEndless) {
			this.trigger.activeCycle = new RepeatUntilCycle(this.trigger, this);
			this.trigger.activeCycle.run();
		} else {
			this.trigger.processSheet();
		}
	}
}
class RandomIntervalCycle extends IntervalCycle {
	getCycleTime() {
		const interval = random(2 * this.trigger.interval);
		return interval * UNITS[this.trigger.intervalUnit];
	}
}

const TIMER_DEF = {
	interval: 500,
	intervalUnit: 'ms'
};

class TimerTrigger2 extends BaseTrigger2 {
	constructor(config = {}) {
		super(Object.assign({}, TIMER_DEF, config));
		this.delayId = undefined;
		this.activeCycle = new ManualStepCycle(this);
	}

	get interval() {
		return this.config.interval;
	}
	get intervalUnit() {
		return this.config.intervalUnit;
	}

	clearDelay() {
		if (this.delayId) {
			clearTimeout(this.delayId);
			this.delayId = undefined;
		}
	}

	update(config = {}) {
		const oldInterval = this.interval;
		const oldIntervalUnit = this.intervalUnit;
		super.update(config);
		if (oldInterval !== this.interval || oldIntervalUnit !== this.intervalUnit) {
			this.activeCycle.clear();
			if (!this.isMachineStopped && !this.sheet.isPaused) this.activeCycle.schedule();
		}
	}

	getManualCycle() {
		return new ManualStepCycle(this);
	}

	getTimerCycle() {
		return this.type === TYPE.TIME ? new IntervalCycle(this) : new RandomIntervalCycle(this);
	}

	start() {
		super.start();
		const delay = this.config.start ? getStartInterval(this.config.start) : undefined;
		// we run directly or after a specified delay...
		if (delay) this.delayId = setTimeout(this.activeCycle.run, delay);
		else this.activeCycle.run();
	}

	step(manual) {
		// only handle manual steps
		if (manual) super.step();
	}

	pause() {
		this.clearDelay();
		super.pause();
	}
	stop() {
		this.clearDelay();
		return super.stop();
	}
}

TimerTrigger2.TYPE_RANDOM = TYPE.RANDOM;
TimerTrigger2.TYPE_TIME = TYPE.TIME;

module.exports = TimerTrigger2;
