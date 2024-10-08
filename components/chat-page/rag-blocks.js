import request from "../../tools/request.js";
import showMessage from "../../tools/message.js";
import useUser from "../../global/useUser.js";
import useHistory from "../../global/useHistory.js";
import useConversation from "../../global/useConversation.js";

const rag_modes = [
    { mode: 'on' },
    { mode: 'off' },
    { mode: 'hybrid', disabled: true },
]

let user_id = null, conversation = {};
useUser(user=>{
    user_id = user.id;
})

const { updateHistoryInfo } = useHistory();
const { updateConversationInfo } = useConversation(c=>{
    conversation = c;
})

async function updateRAG(mode, element, id, expand_setting) {
    if(mode === 'on') {
        const { http_error } = await request('chat/session', {
            method: 'PATCH',
            body: {
                sessionUuid: id,
                session_type: 'rag'
            }
        })
        if(http_error) {
            showMessage("Set RAG mode failed!", { type: 'err' });
            return;
        }
    }
    showMessage(`This session will start with RAG ${mode}`);
    updateHistoryInfo(id, 'session_type', 'chat');
    element.classList.add('completed');
    await new Promise(s=>setTimeout(s, 1000));
    element.insertAdjacentHTML(
        "beforebegin", 
        `<div class='greeting rag-info'>RAG <strong>${mode.toUpperCase()}</strong></div>`
    )
    element.remove();
    if(mode == 'on') {
        await new Promise(s=>setTimeout(s, 600));
        updateHistoryInfo(id, 'session_type', 'rag');
        updateConversationInfo('session_type', 'rag');
        showMessage("Please set your dataset for RAG");
        expand_setting();
    }
}

export default function createRAGSelector(expand_setting) {
    if(conversation.session_type || user_id === null) {
        const rag_info = document.createElement('div');
        rag_info.className = 'greeting rag-info';
        rag_info.innerHTML = `RAG <strong>${
            conversation.session_type === 'rag' ? 'ON' :
            conversation.session_type === 'chat' || user_id === null ? 'OFF' : ''
        }</strong>`
        return rag_info;
    }
    const rag_select = document.createElement('div');
    rag_select.className = 'rag-select';

    rag_modes.forEach(({mode, disabled})=>{
        const option = document.createElement('div');
        option.className = 'option';
        if(disabled) {
            option.classList.add('disabled');
        } else {
            option.classList.add('clickable')
            option.onclick = () => {
                updateRAG(mode, rag_select, conversation.id, expand_setting)
            };
        }
        option.innerHTML = `Start session with RAG <strong>${mode}</strong>`;
        rag_select.appendChild(option);
    })
    return rag_select;
}