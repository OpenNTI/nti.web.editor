export default function (count, config) {
	const {limit, countDown} = config || {};

	return {
		limit,
		count: countDown ? (limit - count) : count,
		over: limit && limit < count
	};
}
