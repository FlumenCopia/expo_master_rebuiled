/**
 * Supabase Client Configuration for Masters Kerala RE 2.0 EXPO26
 * Project URL: https://cawacfivjjeyazppekip.supabase.co
 */

(function () {
    var SUPABASE_URL = 'https://cawacfivjjeyazppekip.supabase.co';
    var SUPABASE_ANON_KEY = 'sb_publishable_DYSoNEHAWExuriojhjD-pA_rTAD3rIF';

    window.EXPO_SUPABASE_CONFIG = {
        url: SUPABASE_URL,
        anonKey: SUPABASE_ANON_KEY
    };

    function initClient() {
        if (window.supabase && typeof window.supabase.createClient === 'function') {
            try {
                // Public Client using publishable key for browser environment
                window.expoSupabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
                    auth: { storageKey: 'expo_public_auth', persistSession: true },
                    global: {
                        headers: {
                            'apikey': SUPABASE_ANON_KEY,
                            'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
                        }
                    }
                });

                // Admin Client using publishable key (with RLS enabled policies)
                window.expoSupabaseAdmin = window.expoSupabase;
                console.info('⚡ [Supabase Config] Client successfully initialized for:', SUPABASE_URL);
            } catch (err) {
                console.warn('⚠️ [Supabase Config] Init warning:', err);
            }
        } else {
            console.warn('⚠️ [Supabase Config] Supabase SDK script not loaded yet.');
        }
    }

    if (window.supabase) {
        initClient();
    } else {
        document.addEventListener('DOMContentLoaded', initClient);
    }
})();
