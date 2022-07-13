import { Node, mergeAttributes } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-2'
import Component from '../components/imageElement'

export default Node.create({
    name: 'mainResize',

    group: 'block',

    atom: true,

    addAttributes() {
        return {
            count: {
                default: 0,
            },
        }
    },

    parseHTML() {
        return [
            {
                tag: 'main-resize',
            },
        ]
    },

    renderHTML({ HTMLAttributes }) {
        return ['main-resize', mergeAttributes(HTMLAttributes)]
    },

    addNodeView() {
        return VueNodeViewRenderer(Component)
    },
})