import createHook from "./createHook.js";

const defaultConversationSetting = {
    id: null,
    temperature: 0.2,
    top_k: 40,
    top_p: 0.9,
    n_keep: null,
    n_predict: 128,
    history: []
}

let currentConversation = {
    ...defaultConversationSetting
}

const { onmount, dismount, updateAll } = createHook();

export default function useConversation(updated) {
    onmount(updated);

    function addHistory(histories) {
        currentConversation.history.push(...histories);
        updateAll(currentConversation);
    }

    function selectConversation(id, settings = null) {
        // TODO: query history by id
        const history = [
            { type: 'out', message: 'hello world from me' },
            { type: 'in', message: 'hello world from bot' },
            { type: 'out', message: 'this is a longlonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglong sentence' },
        ];
        currentConversation = {
            ...(settings || defaultConversationSetting), id, history
        }
        updateAll(currentConversation);
    }

    async function updateSetting(setting) {
        currentConversation = {
            ...currentConversation,
            ...setting
        }
        updateAll(currentConversation);
        return true;
    }

    updated(currentConversation);

    return { addHistory, selectConversation, updateSetting, componetDismount:dismount(updated) }
}