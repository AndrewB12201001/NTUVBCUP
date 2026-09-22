const CORE_KEYS = new Set([
    "matches", "teams", "newbieTeams", "teamData", "brackets",
    "officialStats", "gameIDCounter", "customTeams", "customMatches",
    "customTournaments", "customGameIDCounter", "gamesStarted",
    "newbieStarted", "payPerMatch", "initialized"
]);

function json(body, status = 200) {
    return Response.json(body, {
        status,
        headers: {
            "Cache-Control": "no-store",
            "X-Content-Type-Options": "nosniff"
        }
    });
}

function isTournamentKey(key) {
    return CORE_KEYS.has(key) || key.endsWith("FirstClick");
}

function validatePayload(payload) {
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
        throw new Error("Tournament data must be a JSON object.");
    }

    const serializedPayload = JSON.stringify(payload);
    if (serializedPayload.length > 8 * 1024 * 1024) {
        throw new Error("Tournament data exceeds the 8 MB limit.");
    }

    for (const [key, value] of Object.entries(payload)) {
        if (!isTournamentKey(key)) throw new Error(`Unexpected tournament key: ${key}`);
        if (typeof value !== "string") throw new Error(`Tournament value ${key} must use the backup string format.`);
        if (value.length > 4 * 1024 * 1024) throw new Error(`Tournament value ${key} is too large.`);
        if (value.includes("<") || value.includes(">")) {
            throw new Error(`Tournament value ${key} contains HTML-like markup.`);
        }
    }
}

export async function onRequestPost({ request, env }) {
    if (!env.SUPABASE_URL || !env.SUPABASE_PUBLISHABLE_KEY) {
        return json({ error: "Backend configuration is incomplete." }, 503);
    }

    const authorization = request.headers.get("Authorization") || "";
    if (!authorization.startsWith("Bearer ") || authorization.length > 8192) {
        return json({ error: "A valid administrator session is required." }, 401);
    }

    const contentLength = Number(request.headers.get("Content-Length") || 0);
    if (contentLength > 9 * 1024 * 1024) {
        return json({ error: "Request body is too large." }, 413);
    }

    let body;
    try {
        body = await request.json();
        if (!body || typeof body.slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(body.slug)) {
            throw new Error("Tournament slug is invalid.");
        }
        validatePayload(body.payload);
    } catch (error) {
        return json({ error: error.message || "Invalid request body." }, 400);
    }

    const supabaseUrl = env.SUPABASE_URL.replace(/\/$/, "");
    const authHeaders = {
        apikey: env.SUPABASE_PUBLISHABLE_KEY,
        Authorization: authorization
    };

    const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, { headers: authHeaders });
    if (!userResponse.ok) return json({ error: "The administrator session is invalid or expired." }, 401);

    const databaseResponse = await fetch(
        `${supabaseUrl}/rest/v1/tournament_snapshots?on_conflict=slug&select=updated_at`,
        {
            method: "POST",
            headers: {
                ...authHeaders,
                "Content-Type": "application/json",
                Prefer: "resolution=merge-duplicates,return=representation"
            },
            body: JSON.stringify({
                slug: body.slug,
                payload: body.payload,
                is_published: true
            })
        }
    );

    const result = await databaseResponse.json().catch(() => null);
    if (!databaseResponse.ok) {
        const denied = databaseResponse.status === 401 || databaseResponse.status === 403;
        return json({ error: denied ? "This account is not authorized to publish." : "Supabase rejected the publish request." }, denied ? 403 : 502);
    }

    return json({ updated_at: Array.isArray(result) ? result[0]?.updated_at : result?.updated_at });
}

export function onRequest() {
    return json({ error: "Method not allowed." }, 405);
}
