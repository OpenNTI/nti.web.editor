import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';

import { scoped } from '@nti/lib-locale';
import { Form, Button, Input } from '@nti/web-commons';

import Styles from './Styles.css';

const cx = classnames.bind(Styles);
const t = scoped(
	'web-editor.plugins.links.custom-links.components.LinkEditor',
	{
		urlLabel: 'URL',
		displayLabel: 'Display Text',
		cancel: 'Cancel',
		save: 'Save',
		invalid: 'Please enter a valid url.',
	}
);

LinkEditor.propTypes = {
	entityData: PropTypes.shape({
		href: PropTypes.string,
		decoratedText: PropTypes.string,
	}),

	onCancel: PropTypes.func,
	onSave: PropTypes.func,
};
export default function LinkEditor({ entityData, onSave, onCancel }) {
	const formRef = React.useRef();
	const mousedownRef = React.useRef();
	const blurTimeoutRef = React.useRef();

	const { href, decoratedText } = entityData;

	const onSubmit = ({ json }) => {
		if (!Input.URL.isValidURL(json.href)) {
			const error = new Error(t('invalid'));
			error.field = 'href';

			throw error;
		}

		return onSave({
			href: Input.URL.getFullURL(json.href),
			decoratedText: json.decoratedText,
		});
	};

	const onFormMouseDown = () => (mousedownRef.current = true);
	const onFormMouseUp = () => (mousedownRef.current = false);

	const onBlur = e => {
		if (
			formRef.current?.contains(e.relatedTarget) || //if we are focusing something else in the form
			mousedownRef.current //we are in the middle of a click on the form
		) {
			return;
		}

		blurTimeoutRef.current = setTimeout(() => onCancel?.(), 100);
	};

	return (
		<Form
			ref={formRef}
			onSubmit={onSubmit}
			className={cx('link-editor')}
			onBlur={onBlur}
			onMouseDown={onFormMouseDown}
			onMouseUp={onFormMouseUp}
			autoComplete="off"
		>
			<Form.Input.Text
				className={cx('url-input')}
				defaultValue={href}
				label={t('urlLabel')}
				name="href"
				autoFocus
				locked
				required
			/>
			<Form.Input.Text
				className={cx('display-input')}
				defaultValue={decoratedText}
				label={t('displayLabel')}
				name="decoratedText"
				locked
			/>
			<div className={cx('buttons')}>
				<Button
					className={cx('cancel')}
					rounded
					secondary
					onClick={onCancel}
				>
					{t('cancel')}
				</Button>
				<Button
					component={Form.SubmitButton}
					className={cx('save')}
					rounded
				>
					{t('save')}
				</Button>
			</div>
		</Form>
	);
}
