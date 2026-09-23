(function () {
    "use strict";

    const config = window.NTUCUP_CONFIG || {};
    const form = document.getElementById("login-form");
    const emailInput = document.getElementById("email");
    const status = document.getElementById("login-status");
    const submitButton = document.getElementById("login-submit");

    function showStatus(message, state = "idle") {
        status.textContent = message;
        status.dataset.state = state;
    }

    async function initialize() {
        if (!config.supabaseUrl || !config.supabasePublishableKey || !window.supabase?.createClient) {
            showStatus("Supabase is not configured. Add the Cloudflare Pages environment variables and rebuild.", "error");
            form.hidden = true;
            return;
        }

        const client = window.supabase.createClient(config.supabaseUrl, config.supabasePublishableKey);
        const { data: userData } = await client.auth.getUser();
        if (userData.user) {
            const { data: membership } = await client
                .from("admin_users")
                .select("user_id")
                .eq("user_id", userData.user.id)
                .maybeSingle();
            if (membership) {
                const returnTo = new URLSearchParams(window.location.search).get("returnTo");
                window.location.replace(returnTo && returnTo.startsWith("/") ? returnTo : "index.html");
                return;
            }
            showStatus("This account is signed in but is not an NTU Cup administrator.", "error");
            await client.auth.signOut({ scope: "local" });
        }

        const error = new URLSearchParams(window.location.search).get("error");
        if (error === "not-authorized") showStatus("That account is not authorized as an administrator.", "error");
        if (error === "signin-required") showStatus("Sign in to open the organizer tools.", "idle");

        form.addEventListener("submit", async function (event) {
            event.preventDefault();
            submitButton.disabled = true;
            showStatus("Sending a secure sign-in link…", "working");
            const redirectUrl = new URL("login.html", window.location.href);
            const returnTo = new URLSearchParams(window.location.search).get("returnTo");
            if (returnTo?.startsWith("/")) redirectUrl.searchParams.set("returnTo", returnTo);

            const { error: signInError } = await client.auth.signInWithOtp({
                email: emailInput.value.trim(),
                options: {
                    shouldCreateUser: false,
                    emailRedirectTo: redirectUrl.href
                }
            });

            if (signInError) {
                showStatus(signInError.message, "error");
                submitButton.disabled = false;
                return;
            }
            showStatus("Check your email and open the sign-in link on this device.", "success");
        });
    }

    initialize().catch(error => {
        console.error(error);
        showStatus("Unable to start sign-in. Please try again.", "error");
    });
})();
