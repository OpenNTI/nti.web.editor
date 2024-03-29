import './Link.scss';
import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';

import { SelectedEntityKey, EditingEntityKey } from '../Constants';
import { getEventFor } from '../../Store';

const selectedEntityKeyEvent = getEventFor(SelectedEntityKey);
const editingEntityKeyEvent = getEventFor(EditingEntityKey);

export default class ExternalLink extends React.Component {
	static propTypes = {
		entityKey: PropTypes.string,
		children: PropTypes.any,
		offsetKey: PropTypes.string,
		decoratedText: PropTypes.string,
		getEditorState: PropTypes.func,
		store: PropTypes.shape({
			addListeners: PropTypes.func,
			removeListeners: PropTypes.func,
		}),
	};

	state = { focused: false, editing: false };

	setAnchorRef = x => {
		this.anchorRef = x;
	};

	get entityData() {
		const { getEditorState, entityKey } = this.props;

		return getEditorState()
			.getCurrentContent()
			.getEntity(entityKey)
			.getData();
	}

	get offsetKey() {
		return this.props.offsetKey;
	}

	get decoratedText() {
		return this.props.decoratedText;
	}

	get node() {
		return this.anchorRef;
	}

	getBoundingClientRect() {
		return this.anchorRef && this.anchorRef.getBoundingClientRect
			? this.anchorRef.getBoundingClientRect()
			: { top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 };
	}

	events = {
		[selectedEntityKeyEvent]: x => this.onSelectedEntityKeyChanged(x),
		[editingEntityKeyEvent]: x => this.onEditingEntityKeyChanged(x),
	};

	componentDidUpdate(prevProps) {
		const { entityKey: newKey } = this.props;
		const { entityKey: oldKey } = prevProps;

		if (newKey !== oldKey) {
			this.unregisterCmp(prevProps);
			this.registerCmp(this.props);
		}
	}

	componentDidMount() {
		const { store } = this.props;

		if (store) {
			store.addListeners(this.events);

			this.registerCmp();
		}
	}

	componentWillUnmount() {
		const { store } = this.props;

		if (store) {
			store.removeListeners(this.events);

			this.unregisterCmp();
		}
	}

	registerCmp(props = this.props) {
		const { store, entityKey } = props;

		if (store) {
			this.unregisterCmp();

			const cmps = store.getItem(entityKey) || [];

			store.setItem(entityKey, [...cmps, this]);
		}
	}

	unregisterCmp(props = this.props) {
		const { store, entityKey } = props;

		if (store) {
			const cmps = store.getItem(entityKey) || [];
			const newCmps = cmps.filter(x => x !== this);

			if (newCmps.length) {
				store.setItem(entityKey, newCmps);
			} else {
				store.clearItem(entityKey);
			}
		}
	}

	onSelectedEntityKeyChanged = selectedKey => {
		const { entityKey } = this.props;
		const { focused } = this.state;
		const shouldFocus = entityKey === selectedKey;

		if (focused !== shouldFocus) {
			this.setState({
				focused: shouldFocus,
			});
		}
	};

	onEditingEntityKeyChanged = editingKey => {
		const { entityKey } = this.props;

		this.setState({
			editing: entityKey === editingKey,
		});
	};

	render() {
		const { children } = this.props;
		const { focused, editing } = this.state;
		const { href } = this.entityData;
		const cls = cx('draft-core-external-link', { focused, editing });

		return (
			<a href={href} className={cls} ref={this.setAnchorRef}>
				{children}
			</a>
		);
	}
}
