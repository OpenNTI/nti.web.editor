function flatten (plugins) {
	return plugins.reduce((explored, toExplore) => {
		return explored.concat(toExplore.composes ? flatten(toExplore.composes) : toExplore);
	}, []);
}

export default function decomposePlugins (plugins) {
	return flatten(plugins);
}