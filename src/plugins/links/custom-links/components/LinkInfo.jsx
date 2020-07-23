import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import {scoped} from '@nti/lib-locale';
import {Text, Icons} from '@nti/web-commons';

import Styles from './Styles.css';

const cx = classnames.bind(Styles);
const t = scoped('web-editor.plugins.links.custom-links.components.LinkInfo', {
	change: 'Change',
	remove: 'Remove'
});

const stop = e => e.preventDefault();

LinkInfo.propTypes = {
	entityData: PropTypes.shape({
		href: PropTypes.string
	}),
	onEdit: PropTypes.func,
	onRemove: PropTypes.func
};
export default function LinkInfo ({entityData, onEdit, onRemove}) {
	const {href} = entityData;

	return (
		<div className={cx('link-info')} onMouseDown={stop}>
			<a href={href} className={cx('link')} target="_blank" rel="noopener noreferrer">
				<Text.Base className={cx('label')}>
					{href}
				</Text.Base>
				<Icons.Arrow.UpRight className={cx('icon')} />
			</a>
			<Text.Base
				className={cx('action')}
				role="button"
				onClick={(e) => (stop(e), onEdit())}
			>
				{t('change')}
			</Text.Base>
		</div>
	);
}