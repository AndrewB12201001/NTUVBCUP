(function () {
    "use strict";

    const config = window.NTUCUP_CONFIG || {};
    const script = document.currentScript;
    const loginUrl = script?.dataset.loginUrl || "login.html";

    function redirectToLogin(reason) {
        const target = new URL(loginUrl, window.location.href);
        if (reason) target.searchParams.set("error", reason);
        target.searchParams.set("returnTo", `${window.location.pathname}${window.location.search}`);
        window.location.replace(target.href);
        return new Promise(() => {});
    }

    window.ntucupAuthReady = (async function () {
        if (!config.supabaseUrl || !config.supabasePublishableKey || !window.supabase?.createClient) {
            return redirectToLogin("configuration");
        }

        const client = window.supabase.createClient(
            config.supabaseUrl,
            config.supabasePublishableKey,
            {
                auth: {
                    persistSession: true,
                    autoRefreshToken: true,
                    detectSessionInUrl: true
                }
            }
        );
        window.ntucupSupabase = client;

        const { data: userData, error: userError } = await client.auth.getUser();
        if (userError || !userData.user) return redirectToLogin("signin-required");

        const { data: membership, error: membershipError } = await client
            .from("admin_users")
            .select("user_id")
            .eq("user_id", userData.user.id)
            .maybeSingle();

        if (membershipError || !membership) {
            await client.auth.signOut({ scope: "local" });
            return redirectToLogin("not-authorized");
        }

        window.dispatchEvent(new CustomEvent("ntucup:auth-ready", {
            detail: { user: userData.user }
        }));
        return { client, user: userData.user };
    })();
})();
