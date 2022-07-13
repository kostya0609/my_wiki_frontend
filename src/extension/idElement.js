import { Extension } from '@tiptap/core';

export default Extension.create({
    name: 'idElement',
    addOptions() {
        return {
            defaultId: null,
            types: ['heading'],
        };
    },
    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    id: {
                        default: this.options.defaultId,
                        parseHTML: element => element.id || null,
                        renderHTML: attributes => {
                            if (attributes.id === null) {
                                return {};
                            }
                            return { id : attributes.id };
                        },
                    },
                },
            },
        ];
    },
    addCommands() {
        return {
            setIdElement: (id) => ({ commands }) => {
                commands.updateAttributes('heading', { id : id })
            },
            unsetIdElement: () => ({ commands }) => {
                commands.resetAttributes('heading', 'id');
            },
        };
    }
});
