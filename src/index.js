export * from './components/style';
export * from './components/type';
export * from './components/entity';
export * from './Constants';

export * as Plugins from './plugins';
export * as Parsers from './parsers';
export * as Common from './common';

export { default as Editor } from './components/Editor';
export { default as PlaintextEditor } from './components/PlaintextEditor';
export { default as NestedEditorWrapper } from './components/NestedEditorWrapper';

export { default as Button } from './components/Button';

export { default as getAtomicBlockData } from './utils/get-atomic-block-data';

export { default as ContextProvider } from './ContextProvider';
export { default as EditorGroup } from './editor-group';

import IdRegistry from './IdRegistry';

export const generateID = () => IdRegistry.generateID();
