export function getCookie(name) {
    const cookies = document.cookie ? document.cookie.split("; ") : [];
    for (const cookie of cookies) {
        const [key, ...rest] = cookie.split("=");
        if (key === name) {
            return decodeURIComponent(rest.join("="));
        }
    }
    return null;
}

export function getCsrfToken() {
    return getCookie("XSRF-TOKEN");
}

export function generateIdempotencyKey() {
    if (window.crypto && window.crypto.randomUUID) {
        return window.crypto.randomUUID();
    }
    return "idem-" + Date.now() + "-" + Math.random().toString(16).slice(2);
}

export async function callGraphQL(query, variables, description) {
    const key = generateIdempotencyKey();
    const csrf = getCsrfToken();

    const headers = {
        "Content-Type": "application/json",
        "Idempotency-Key": key,
        "X-XSRF-TOKEN": csrf
    };

    const body = JSON.stringify({
        query: query,
        variables: variables || {}
    });

    const meta = {
        description: description || "",
        idempotencyKey: key,
        hasCsrf: true,
        body: JSON.parse(body)
    };

    try {
        const resp = await fetch("https://hzfarm.ru/api/graphql", {
            method: "POST",
            headers: headers,
            credentials: "include",
            body: body
        });

        const text = await resp.text();
        let json;
        try {
            json = JSON.parse(text);
        } catch (e) {
            json = null;
        }

        return {
            ok: resp.ok,
            status: resp.status,
            statusText: resp.statusText,
            json: json,
            rawText: text,
            meta: meta
        };
    } catch (e) {
        return {
            ok: false,
            status: 0,
            statusText: "NETWORK_ERROR",
            json: null,
            rawText: String(e),
            meta: meta
        };
    }
}

export async function postAuthRefresh() {
    const res = await fetch('https://hzfarm.ru/api/auth/refresh', {
        method: 'POST',
        credentials: 'include'
    });

    return res;
}

export async function getScrfToken() {
    const res = await fetch('https://hzfarm.ru/api/auth/gen-csrf', {
        method: 'GET',
        credentials: 'include'
    });

    return res;
}

export async function postAuthLogout() {
    const res = await fetch('https://hzfarm.ru/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
    });

    return res;
}

export async function onTelegramAuth(user) {
    try {
        const resp = await fetch("https://hzfarm.ru/api/auth/telegram-login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(user)
        });
        if (resp.ok) {
            const data = await resp.json().catch(()=>null);
            return { ok: true, data, status: resp.status };
        } else {
            const err = await resp.json().catch(()=>null);
            return { ok: false, status: resp.status, error: err };
        }
    } catch (e) {
        return { ok: false, status: 0, error: String(e) };
    }
}

// Вызывается всегда
(async () => {
    const params = new URLSearchParams(window.location.search);
    const redirectTo = params.get('redirect');

    const res = await postAuthRefresh();  // POST /auth/refresh

    if (!redirectTo) {
        // обычный заход на страницу
        return;
    }

    if (res.ok) {
        window.location.href = redirectTo; // вернуться на защищённую страницу
    }
})();

const GET_PLAYER_QUERY = `
  query GetPlayer {
    getPlayer {
      id
      username
      photoUrl
      meat
      gold
      brain
      boardColor
      houses {
        id
        type
        level
        skin
        cell
      }
    }
  }
`;

export async function apiGetPlayer() {
    const res = await callGraphQL(GET_PLAYER_QUERY, {}, "GetPlayer");
    if (!res.ok || !res.json) {
        return { ok: false, error: res.statusText || "NETWORK_OR_GQL_ERROR", raw: res };
    }
    if (res.json.errors && res.json.errors.length) {
        return { ok: false, error: res.json.errors, raw: res };
    }
    return {
        ok: true,
        player: res.json.data.getPlayer,
        raw: res
    };
}

const GET_PLAYER_HOUSES_QUERY = `
  query GetPlayerHouses {
    getPlayerHouses {
      id
      type
      level
      skin
      cell
    }
  }
`;

export async function apiGetPlayerHouses() {
    const res = await callGraphQL(GET_PLAYER_HOUSES_QUERY, {}, "GetPlayerHouses");
    if (!res.ok || !res.json) {
        return { ok: false, error: res.statusText || "NETWORK_OR_GQL_ERROR", raw: res };
    }
    if (res.json.errors && res.json.errors.length) {
        return { ok: false, error: res.json.errors, raw: res };
    }
    return {
        ok: true,
        houses: res.json.data.getPlayerHouses,
        raw: res
    };
}

const BUILD_HOUSE_MUTATION = `
  mutation BuildHouse($input: BuildHouseInput!) {
    buildHouse(input: $input) {
      id
      playerId
      type
      level
      skin
      cell
    }
  }
`;

export async function apiBuildHouse(input) {
    const res = await callGraphQL(BUILD_HOUSE_MUTATION, { input }, "BuildHouse");
    if (!res.ok || !res.json) {
        return { ok: false, error: res.statusText || "NETWORK_OR_GQL_ERROR", raw: res };
    }

    if (res.json.errors && res.json.errors.length) {
        return { ok: false, error: res.json.errors, raw: res };
    }

    return {
        ok: true,
        house: res.json.data.buildHouse,
        raw: res
    };
}