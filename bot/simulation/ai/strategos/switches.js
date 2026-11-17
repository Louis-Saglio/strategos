export class Hysteresis
{
	constructor(on)
	{
		this.on = on;
	}

	threshold(enter, exit)
	{
		return this.on ? exit : enter;
	}

	atLeast(value, enter, exit)
	{
		this.on = value >= this.threshold(enter, exit);
		return this.on;
	}

	below(value, enter, exit)
	{
		this.on = value < this.threshold(enter, exit);
		return this.on;
	}
}

export class Retry
{
	constructor()
	{
		this.last = new Map();
	}

	due(time, delay, key)
	{
		return !this.last.has(key) || time - this.last.get(key) >= delay;
	}

	record(time, key)
	{
		this.last.set(key, time);
	}

	attempt(time, delay, key)
	{
		if (!this.due(time, delay, key))
			return false;
		this.record(time, key);
		return true;
	}
}

export class Change
{
	constructor(value)
	{
		this.value = value;
	}

	to(value)
	{
		if (value === this.value)
			return false;
		this.value = value;
		return true;
	}
}
