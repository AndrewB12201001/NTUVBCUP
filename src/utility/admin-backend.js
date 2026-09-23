(function () {
    "use strict";

    const config = window.NTUCUP_CONFIG || {};
    const META_PREFIX = "ntucup:";
    const REMOTE_UPDATED_KEY = `${META_PREFIX}remote-updated-at`;
    const REMOTE_ENABLED_KEY = `${META_PREFIX}remote-enabled`;
    const DIRTY_KEY = `${META_PREFIX}dirty`;
    const CORE_KEYS = new Set([
        "matches", "teams", "newbieTeams", "teamData", "brackets",
        "officialStats", "gameIDCounter", "customTeams", "customMatches",
        "customTournaments", "customGameIDCounter", "gamesStarted",
        "newbieStarted", "payPerMatch", "initialized"
    ]);

    let publishTimer = null;
    let publishInFlight = null;

    function isTournamentKey(key) {
        return CORE_KEYS.has(key) || key.endsWith("FirstClick");
    }

    function readSnapshotFromStorage() {
        const payload = {};
        for (let index = 0; index < localStorage.length; index += 1) {
            const key = localStorage.key(index);
            if (key && isTournamentKey(key)) payload[key] = localStorage.getItem(key);
        }
        return payload;
    }

    function validateSnapshot(payload) {
        if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
            throw new Error("The tournament snapshot must be a JSON object.");
        }
        if (JSON.stringify(payload).length > 8 * 1024 * 1024) {
            throw new Error("The tournament snapshot is larger than the 8 MB limit.");
        }

        for (const [key, value] of Object.entries(payload)) {
            if (!isTournamentKey(key)) continue;
            const serialized = typeof value === "string" ? value : JSON.stringify(value);
            if (serialized.includes("<") || serialized.includes(">")) {
                throw new Error(`The ${key} data contains HTML-like markup. Remove < and > before importing or publishing.`);
            }
            if (serialized.length > 4 * 1024 * 1024) {
                throw new Error(`The ${key} value is too large.`);
            }
        }
        return payload;
    }

    function hasLocalTournamentData() {
        const populatedCollections = [
            ["matches", []],
            ["teams", {}],
            ["newbieTeams", {}],
            ["teamData", {}],
            ["brackets", {}],
            ["customTeams", {}],
            ["customTournaments", {}]
        ];

        return populatedCollections.some(([key, fallback]) => {
            const raw = localStorage.getItem(key);
            if (!raw) return false;
            try {
                const value = JSON.parse(raw);
                return Array.isArray(value)
                    ? value.length > 0
                    : value && typeof value === "object" && Object.keys(value).length > 0;
            } catch {
                return raw !== JSON.stringify(fallback);
            }
        });
    }

    function importSnapshot(payload) {
        validateSnapshot(payload);

        for (const [key, value] of Object.entries(payload)) {
            if (!isTournamentKey(key)) continue;
            localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
        }
    }

    function setSyncStatus(message, state = "idle") {
        const status = document.getElementById("sync-status");
        if (!status) return;
        status.textContent = message;
        status.dataset.state = state;
    }

    async function fetchRemoteSnapshot(client) {
        const { data, error } = await client
            .from("tournament_snapshots")
            .select("payload, updated_at, is_published")
            .eq("slug", config.tournamentSlug || "ntu-cup")
            .maybeSingle();
        if (error) throw error;
        return data;
    }

    async function publishSnapshot(options = {}) {
        if (publishInFlight) return publishInFlight;

        publishInFlight = (async function () {
            const { client } = await window.ntucupAuthReady;
            const current = await fetchRemoteSnapshot(client);
            const knownUpdatedAt = localStorage.getItem(REMOTE_UPDATED_KEY);

            if (current && knownUpdatedAt && current.updated_at !== knownUpdatedAt && !options.force) {
                throw new Error("A newer cloud copy exists. Reload this page before publishing your changes.");
            }

            if (current && !knownUpdatedAt && hasLocalTournamentData() && !options.force) {
                throw new Error("This browser is not linked to the cloud copy yet. Use Publish now and confirm replacement.");
            }

            setSyncStatus("Publishing…", "working");
            const { data: sessionData } = await client.auth.getSession();
            const accessToken = sessionData.session?.access_token;
            if (!accessToken) throw new Error("Your administrator session has expired. Sign in again.");

            const response = await fetch("/api/publish", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    slug: config.tournamentSlug || "ntu-cup",
                    payload: validateSnapshot(readSnapshotFromStorage())
                })
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok || !data.updated_at) {
                throw new Error(data.error || "The Cloudflare publish service rejected the update.");
            }

            localStorage.setItem(REMOTE_UPDATED_KEY, data.updated_at);
            localStorage.setItem(REMOTE_ENABLED_KEY, "true");
            localStorage.removeItem(DIRTY_KEY);
            setSyncStatus(`Published ${new Date(data.updated_at).toLocaleString()}`, "success");
            window.dispatchEvent(new CustomEvent("ntucup:published", { detail: data }));
            return data;
        })();

        try {
            return await publishInFlight;
        } catch (error) {
            setSyncStatus(error.message || "Publish failed", "error");
            throw error;
        } finally {
            publishInFlight = null;
        }
    }

    function markDirty() {
        localStorage.setItem(DIRTY_KEY, "true");
        setSyncStatus("Local changes not published", "warning");
    }

    function queuePublish() {
        markDirty();
        if (localStorage.getItem(REMOTE_ENABLED_KEY) !== "true") return;
        window.clearTimeout(publishTimer);
        publishTimer = window.setTimeout(() => {
            publishSnapshot().catch(error => console.error("Automatic publish failed:", error));
        }, 1200);
    }

    window.ntucupBackend = {
        publishSnapshot,
        queuePublish,
        markDirty,
        readSnapshotFromStorage,
        importSnapshot
    };

    window.ntucupBackendReady = (async function () {
        try {
            const { client } = await window.ntucupAuthReady;
            const remote = await fetchRemoteSnapshot(client);
            const knownUpdatedAt = localStorage.getItem(REMOTE_UPDATED_KEY);
            const isDirty = localStorage.getItem(DIRTY_KEY) === "true";

            if (remote) {
                localStorage.setItem(REMOTE_ENABLED_KEY, "true");
                if (!isDirty && (!hasLocalTournamentData() || (knownUpdatedAt && knownUpdatedAt !== remote.updated_at))) {
                    importSnapshot(remote.payload);
                    localStorage.setItem(REMOTE_UPDATED_KEY, remote.updated_at);
                    window.location.reload();
                    return new Promise(() => {});
                }
                if (knownUpdatedAt === remote.updated_at && !isDirty) {
                    setSyncStatus(`Published ${new Date(remote.updated_at).toLocaleString()}`, "success");
                } else if (isDirty) {
                    setSyncStatus("Local changes not published", "warning");
                } else if (!knownUpdatedAt && hasLocalTournamentData()) {
                    setSyncStatus("Local data is not linked — publish when ready", "warning");
                }
            } else {
                setSyncStatus("No cloud copy yet — publish when ready", "warning");
            }
        } catch (error) {
            console.error("Unable to initialize tournament backend:", error);
            setSyncStatus("Cloud unavailable — changes remain local", "error");
        } finally {
            document.documentElement.classList.remove("admin-auth-pending");
        }
    })();

    document.addEventListener("DOMContentLoaded", function () {
        const publishButton = document.getElementById("publish-now-btn");
        publishButton?.addEventListener("click", async function () {
            const replacingUnlinkedCloudCopy = localStorage.getItem(REMOTE_UPDATED_KEY) === null;
            if (replacingUnlinkedCloudCopy) {
                const confirmed = window.confirm(
                    "Publish this browser's tournament data as the public cloud copy? Existing public results will be replaced."
                );
                if (!confirmed) return;
            }
            publishButton.disabled = true;
            try {
                await publishSnapshot({ force: replacingUnlinkedCloudCopy });
            } catch (error) {
                window.alert(error.message || "Unable to publish tournament results.");
            } finally {
                publishButton.disabled = false;
            }
        });

        document.getElementById("sign-out-btn")?.addEventListener("click", async function () {
            const { client } = await window.ntucupAuthReady;
            await client.auth.signOut();
            window.location.replace(this.dataset.loginUrl || "login.html");
        });
    });
})();
