import createHook from "./createHook.js";
import request from "../tools/request.js";
import useSessionId from "./useSessionId.js";
import formatDateTime from "../tools/formatDateTime.js";

const history = [];
let currentSession;

const { onmount, remount, dismount, updateAll } = createHook();

async function requestUpdateHistory() {
    if(!currentSession) return;
    
    const response = await request('chat');

    if(!Array.isArray(response)) return;
    const chat_history = response.map(e=>{return {...e, createdAt: new Date(e.createdAt)}})
    chat_history.sort((a, b)=>b.createdAt - a.createdAt);

    history.length = 0;
    chat_history.forEach(({
        sessionUuid, name, 
        sessionType:session_type, 
        datasetName:dataset_name, 
        createdAt
    }) => {
        history.push({
            id: sessionUuid, name, 
            session_type, dataset_name, 
            createdAt: formatDateTime(createdAt)
        });
    });
    updateAll(history);
}

function addHistory(new_ticket) {
    history.unshift({...new_ticket, createdAt: formatDateTime(new_ticket.createdAt)});
    updateAll(history);
}

function removeHistory(id) {
    history.splice(history.findIndex(e=>e.id === id), 1);
    updateAll(history);
}

async function updateHistoryName(id, name) {
    history[history.findIndex(h=>h.id === id)].name = name;
    const { http_error } = await request('chat/session', {
        method: 'PATCH',
        body: { sessionUuid: id, name }
    })
    const success = !http_error;
    if(success) updateAll(history);
    return success;
}

function updateHistoryInfo(id, key, value) {
    history[history.findIndex(h=>h.id === id)][key] = value;
    updateAll(history)
}

function getHistory(id) {
    return history.filter(e=>e.id === id).pop();
}
useSessionId(id=>{
    currentSession = id;
    requestUpdateHistory();
})

export default function useHistory(updated = null) {
    const mount_key = onmount(updated)

    function componentReMount() {
        return remount(mount_key)(history)
    }

    updated && updated(history);

    return { 
        requestUpdateHistory, addHistory, removeHistory,
        getHistory, updateHistoryName, updateHistoryInfo,
        componetDismount: dismount(mount_key), componentReMount
    }
}