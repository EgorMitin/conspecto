import { Mark } from '@tiptap/core'
import { mergeAttributes } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'


export const Qa = Mark.create({
  name: 'qa',

  priority: 1000,

  inclusive: false,

  addStorage() {
    return {
        status: "default"
    }
  },

  addAttributes() {
    const today = new Date()
    .toLocaleString("en-GB", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
      })
    .replace(",", "")

    return {
      question: {
        default: '',
        parseHTML: element => element.getAttribute('question'),
        renderHTML: attributes => ({
          question: attributes.question,
        }),
      },
      lastRep: {
        default: today,
        parseHTML: element => element.getAttribute('question'),
        renderHTML: attributes => ({
            lastRep: attributes.lastRep,
        }),
      },
      nextRep: {
        default: today,
        parseHTML: element => element.getAttribute('question'),
        renderHTML: attributes => ({
            nextRep: attributes.nextRep,
        }),
      },
      status: {
        default: 'default',
        parseHTML: element => element.getAttribute('question'),
        renderHTML: attributes => ({
            status: attributes.status,
        }),
      },
    }
  },

  parseHTML() {    
    return [
      {
        tag: 'span[data-type="qa"]',
        getAttrs: element => ({
          question: element.getAttribute('question'),
        }),
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const isStudyMode = this.editor.options.editorProps.attributes['data-study-mode']

    if (!isStudyMode) {
        return ['span', mergeAttributes(
            { 'data-type': 'qa' },
            HTMLAttributes,
            { class: 'qa-mark relative inline-block px-2 py-1 border border-yellow-200 rounded-md hover:border-yellow-400 hover:bg-yellow-50 transition-all duration-200 ease-in-out' }
            ), 0]
    }
    console.log(HTMLAttributes)
    if (HTMLAttributes.status === "active") {
        return ['span', mergeAttributes(
            { 'data-type': 'qa' },
            HTMLAttributes,
            { class: 'active relative inline-block px-2 py-1 border rounded-md border-blue-400 bg-blue-50 transition-all duration-200 ease-in-out text-transparent' }
            ), 0]
    } else if (HTMLAttributes.status === "open") {
        return ['span', mergeAttributes(
            { 'data-type': 'qa' },
            HTMLAttributes,
            { class: 'open relative inline-block px-2 py-1 border rounded-md border-yellow-400 bg-yellow-50 transition-all duration-200 ease-in-out' }
            ), 0]
    } else {
        return ['span', mergeAttributes(
            { 'data-type': 'qa' },
            HTMLAttributes,
            { class: 'relative inline-block px-2 py-1 border rounded-md border-yellow-200 transition-all duration-200 ease-in-out' }
            ), 0]
    }
  },

  addCommands() {
    return {

      setQa: (question: string) => ({ commands }) => {
        return commands.setMark(this.name, { question })
      },

      unsetQa: () => ({ commands, HTMLAttributes }) => {
        return commands.unsetMark(this.name)
      },

      updateQaStatus: (status: string) => ({ commands }) => {
        return commands.updateAttributes(this.name, {status})
      },

      updateQaRep: (answer: number) => ({ commands }) => {
        const today = new Date()
        .toLocaleString("en-GB", {
            day: "numeric",
            month: "numeric",
            year: "numeric",
          })
        .replace(",", "")
        let nextRep = new Date()

        if (answer === 4) {
            nextRep.ad
        }
        
        return commands.updateAttributes(this.name, {lastRep: today, nextRep})
      }

    }
  },

  addKeyboardShortcuts() {
    return {
      'Space': () => , //change qa to open, change editor to open mode,
    '1, 2, 3, 4': () => //change editor to new active quesiont mode, change the card Attrs, pick next question card
    }
  },

})

export default Qa