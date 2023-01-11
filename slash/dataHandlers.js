let token = localStorage.getItem('token');
let oauth;

const req = (path, body, json = true) => {
    return fetch(`https://discord.com/api/${path}`, body)
        .then(r => {
            if (!r.ok) throw new Error(r.statusText, { cause: r });
            return r;
        })
        .then(r => json ? r.json() : r.text())
}

const fetchToken = async (secret, id) => {
    const data = await req(`oauth2/token`, {
        method: 'POST',
        headers: {
            Authorization: 'Basic ' + btoa(id + ":" + secret),
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            grant_type: 'client_credentials',
            scope: 'identify applications.commands.update'
        })
    });

    token = `${data.token_type} ${data.access_token}`;
    localStorage.setItem('token', token);
};

const clearToken = () => {
    token = null;
    oauth = null;
    localStorage.removeItem('token');
};

const fetchOauth = async () => {
    const data = await req(`oauth2/@me`, {
        headers: {
            Authorization: token,
        },
    });

    oauth = data;
};

const fetchGlobalCommands = () => {
    return req(`applications/${oauth.application.id}/commands`, {
        headers: {
            Authorization: token,
        },
    });
};

const fetchGuildCommands = (guildID) => {
    return req(`applications/${oauth.application.id}/guilds/${guildID}/commands`, {
        headers: {
            Authorization: token,
        },
    });
};

const deleteCommand = (id, guildID) => {
    return req(`applications/${oauth.application.id}/${guildID ? `guilds/${guildID}/` : ''}commands/${id}`, {
        method: 'DELETE',
        headers: {
            Authorization: token,
        },
    }, false);
};

const bulkOverwriteCommands = (commands, guildID) => {
    return req(`applications/${oauth.application.id}/${guildID ? `guilds/${guildID}/` : ''}commands`, {
        method: 'PUT',
        headers: {
            Authorization: token,
            'Content-Type': 'Application/JSON'
        },
        body: JSON.stringify(commands),
    });
};

const hasToken = () => !!token;
const hasOauth = () => !!oauth;

export {
    req,
    fetchToken,
    clearToken,
    fetchOauth,
    fetchGlobalCommands,
    fetchGuildCommands,
    deleteCommand,
    bulkOverwriteCommands,
    hasToken,
    hasOauth,
    oauth,
}