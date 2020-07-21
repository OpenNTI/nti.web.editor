import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import {scoped} from '@nti/lib-locale';
import {Form, Button} from '@nti/web-commons';

import Styles from './Styles.css';

const cx = classnames.bind(Styles);
const t = scoped('web-editor.plugins.links.custom-links.components.LinkEditor', {
	urlLabel: 'URL',
	displayLabel: 'Display Text',
	cancel: 'Cancel',
	save: 'Save'
});

LinkEditor.propTypes = {
	entityData: PropTypes.shape({
		href: PropTypes.string,
		decoratedText: PropTypes.string
	})
};
export default function LinkEditor ({entityData}) {
	const {href, decoratedText} = entityData;

	const onSubmit = () => {
		debugger;
	};

	const onCancel = () => {
		debugger;
	};

	return (
		<Form onSubmit={onSubmit} className={cx('link-editor')}>
			<Form.Input.Text
				className={cx('url-input')}
				defaultValue={href}
				label={t('urlLabel')}
				autoFocus
				locked
				required
			/>
			<Form.Input.Text
				className={cx('display-input')}
				defaultValue={decoratedText}
				label={t('displayLabel')}
				locked
			/>
			<div className={cx('buttons')}>
				<Button className={cx('cancel')} rounded secondary onClick={onCancel}>{t('cancel')}</Button>
				<Button component={Form.SubmitButton} className={cx('save')} rounded>{t('save')}</Button>
			</div>
		</Form>
	);
}