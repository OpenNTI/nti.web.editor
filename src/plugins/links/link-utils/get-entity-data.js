export default function getEntityData (entityKey, getEditorState) {
	return getEditorState().getCurrentContent().getEntity(entityKey).getData();
}