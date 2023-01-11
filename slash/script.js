import { bulkOverwriteCommands, clearToken, deleteCommand, fetchGlobalCommands, fetchGuildCommands, fetchOauth, fetchToken, hasOauth, hasToken, oauth } from "./dataHandlers.js";
import { setup } from "/shared/init.js";

let cmdState;
let elements;
let loading = false;

const loadCommands = (guildID) => {
    loading = true;
    handle();
    let promise;
    if (guildID) promise = fetchGuildCommands(guildID);
    else promise = fetchGlobalCommands();
    promise.then(data => {
        loading = false;
        cmdState = { global: !guildID, data, guildID };
        handle();
    }).catch(e => {
        alert('Error fetching commands: ' + e);
        loading = false;
    });
};

const handlers = [
    {
        id: 'login',
        addElements: ['clientID', 'clientSecret', 'loginButton'],
        setup: () => {
            elements.loginButton.addEventListener('click', async () => {
                const id = elements.clientID.value;
                const secret = elements.clientSecret.value;
                if (!id || !secret) return alert('Please enter a client ID and secret');

                loading = true;
                handle();
                await fetchToken(secret.trim(), id.trim())
                    .then(handle)
                    .catch(e => {
                        alert('Error fetching token: ' + e);
                        loading = false;
                        clearToken();
                        handle();
                    });
            });
        },
    },
    {
        id: 'loading',
        load: () => {
            if (!hasToken()) return;
            if (hasOauth()) return;
            fetchOauth()
                .then(() => {
                    loading = false;
                    handle();
                })
                .catch(e => {
                    alert('Error fetching oauth data: ' + e);
                    loading = false;
                    clearToken();
                    handle();
                });

        }
    },
    {
        id: 'commands',
        addElements: ['botName', 'userName', 'globalButton', 'guildID', 'guildButton', 'logoutButton'],
        setup: () => {
            elements.globalButton.addEventListener('click', () => {
                loadCommands();
            });
            elements.guildButton.addEventListener('click', () => {
                const id = elements.guildID.value;
                if (!id) return alert('Please enter a guild ID');
                loadCommands(id);
            });
            elements.logoutButton.addEventListener('click', () => {
                clearToken();
                handle();
            });
        },
        load: () => {
            elements.botName.textContent = oauth.application.name;
            elements.userName.textContent = oauth.user?.username ? `${oauth.user.username}#${oauth.user.discriminator}` : 'Unknown';
        }
    },
    {
        id: 'commandList',
        addElements: ['commandType', 'commandList', 'deleteAll', 'createCommand', 'backButton'],
        setup: () => {
            elements.deleteAll.addEventListener('click', () => {
                if (!confirm(`Are you sure you want to delete all ${cmdState.data.length} commands?`)) return;
                bulkOverwriteCommands([], cmdState.guildID)
                .then(() => loadCommands(cmdState.guildID))
                .catch(e => alert('Error deleting commands: ' + e));
            });
            elements.createCommand.addEventListener('click', () => {
                // TODO: Create command
            });
            elements.backButton.addEventListener('click', () => {
                cmdState = null;
                handle();
            });
        },
        load: () => {
            elements.commandType.textContent = `${cmdState.data.length} ${cmdState.global ? 'Global' : 'Guild'}`;
            const list = elements.commandList;
            list.innerHTML = '';
            cmdState.data.forEach(cmd => {
                const li = document.createElement('li');
                li.textContent = `${cmd.name} ${cmd.description ? `- ${cmd.description} ` : ''}`;
                const deleteButton = document.createElement('button');
                deleteButton.addEventListener('click', () => {
                    if (!confirm(`Are you sure you want to delete the command ${cmd.name}?`)) return;
                    deleteCommand(cmd.id, cmdState.guildID)
                        .catch(e => alert('Error deleting command: ' + e))
                        .then(() => loadCommands(cmdState.guildID));
                });
                deleteButton.textContent = 'Delete';
                li.appendChild(deleteButton);
                list.appendChild(li);
            });
        }
    },
];

const getState = () => {
    if (loading) return 'loading';
    if (!hasToken()) return 'login';
    if (!hasOauth()) return 'loading';
    if (!cmdState) return 'commands';
    return 'commandList';

};

const handle = () => {
    const state = getState();
    if (!state) return;
    const handler = handlers.find(h => h.id === state);
    if (!handler) return;
    handlers.forEach(h => h.div.hidden = true);
    handler.div.hidden = false;
    handler.load?.();
};

setup((e) => {
    elements = e;
    handlers.forEach(h => {
        h.div = e[h.id + 'Div'];
        h.setup?.();
    });
    console.log(handlers, e);
    handle();
},
    [...handlers.map(h => [h.id + 'Div', ...(h.addElements || [])]).flat()]
);