function flatten (plugins) {
	return plugins.reduce((explored, toExplore) => {
		if (toExplore.plugins) {
			return [...explored, toExplore, ...toExplore.plugins];
		}

		return explored.concat(toExplore.composes ? flatten(toExplore.composes) : toExplore);
	}, []);
}

function reduce (plugins) {
	const {reduced} = plugins.reduce((acc, plugin) => {
		if (!plugin.name) {
			acc.reduced.push(plugin);
		} else if (acc.named[plugin.name]) {
			acc.named[plugin.name].combine(plugin);
		} else {
			acc.named[plugin.name] = plugin;
			acc.reduced.push(plugin);
		}

		return acc;
	}, {reduced: [], named: {}});

	return reduced;
}

export default function decomposePlugins (plugins) {
	return reduce(flatten(plugins));
}