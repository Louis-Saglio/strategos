function wealthAround(grid, codes, i, j, cap, favoured, weight)
{
	let wealth = 0;
	for (const code of codes)
	{
		let total = 0;
		for (let dj = -1; dj <= 1; ++dj)
			for (let di = -1; di <= 1; ++di)
			{
				const ii = i + di;
				const jj = j + dj;
				if (ii >= 0 && jj >= 0 && ii < grid.width && jj < grid.height && grid.totals[code])
					total += grid.totals[code][ii + jj * grid.width];
			}
		wealth += Math.min(total, cap) * (code === favoured ? weight : 1);
		if (code === favoured && !total)
			wealth = -Infinity;
	}
	return wealth;
}

export function rankedSites(grid, codes, cap, favoured, weight, admit, score)
{
	const sites = [];
	for (let j = 0; j < grid.height; ++j)
		for (let i = 0; i < grid.width; ++i)
		{
			const position = [(i + 0.5) * grid.cellSize, (j + 0.5) * grid.cellSize];
			const index = i + j * grid.width;
			const stand = admit(position, index);
			if (stand === null)
				continue;
			const value = score(wealthAround(grid, codes, i, j, cap, favoured, weight), position, stand);
			if (value !== null)
				sites.push({ "position": position, "index": index, "stand": stand, "score": value });
		}
	return sites.sort((a, b) => b.score - a.score || a.index - b.index);
}
