export function squareDistance(a, b)
{
	const dx = a[0] - b[0];
	const dz = a[1] - b[1];
	return dx * dx + dz * dz;
}

export function distanceBetween(a, b)
{
	return Math.sqrt(squareDistance(a, b));
}

export function centroid(items)
{
	const centre = [0, 0];
	for (const item of items)
	{
		centre[0] += item.position[0] / items.length;
		centre[1] += item.position[1] / items.length;
	}
	return centre;
}

export function firstListed()
{
	return false;
}

export function lowerId(candidate, best)
{
	return candidate.id < best.id;
}

export function nearest(items, origin, tie, accept, at)
{
	if (typeof tie !== "function")
		throw new Error("nearest: no tie rule");
	let best = null;
	let bestDistance = Infinity;
	for (const item of items)
	{
		if (accept && !accept(item))
			continue;
		const gap = squareDistance(at ? at(item) : item.position, origin);
		if (gap < bestDistance || gap === bestDistance && best && tie(item, best))
		{
			best = item;
			bestDistance = gap;
		}
	}
	return { "item": best, "squareDistance": bestDistance };
}

export function direction(from, to)
{
	const dx = to[0] - from[0];
	const dz = to[1] - from[1];
	const length = Math.sqrt(dx * dx + dz * dz) || 1;
	return [dx / length, dz / length];
}

export function toward(from, to, reach)
{
	const heading = direction(from, to);
	return [from[0] + heading[0] * reach, from[1] + heading[1] * reach];
}

export function awayFrom(from, other, reach)
{
	const heading = direction(other, from);
	return [from[0] + heading[0] * reach, from[1] + heading[1] * reach];
}
