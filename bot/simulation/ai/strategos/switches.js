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

	save()
	{
		return this.on;
	}

	restore(on)
	{
		this.on = on;
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

	save()
	{
		return this.last;
	}

	restore(last)
	{
		this.last = last;
	}
}

export function retryFrom(last)
{
	const retry = new Retry();
	retry.restore(last);
	return retry;
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

	save()
	{
		return this.value;
	}

	restore(value)
	{
		this.value = value;
	}
}
