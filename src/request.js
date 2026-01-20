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
        const resp = await fetch("https://hzfarm.ru/api", {
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
