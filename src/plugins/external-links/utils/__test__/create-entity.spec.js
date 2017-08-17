/* eslint-env jest */
import {Entity} from 'draft-js';

import createEntity from '../create-entity';


describe('create-entity', () => {
	test('Creates Mutable entity with the correct href', () => {
		const link = 'http://www.google.com';
		const entityKey = createEntity(link);
		const entity = Entity.get(entityKey);

		const data = entity.getData();

		expect(entity.getMutability()).toEqual('MUTABLE');
		expect(data.href).toEqual(link);
	});
});
