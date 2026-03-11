/* ============================================================
   COOKIE CONSENT BANNER - GRÁTIS
   LGPD (Brasil) + COPPA (EUA) + GDPR (Europa)
   ============================================================ */

// CSS do Cookie Banner
const cookieBannerCSS = `
<style id="cookie-consent-styles">
    #cookie-consent-banner {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: linear-gradient(135deg, #1a1f3a, #2a2f4a);
        color: white;
        padding: 20px;
        box-shadow: 0 -5px 20px rgba(0,0,0,0.3);
        z-index: 999999;
        transform: translateY(100%);
        transition: transform 0.3s ease;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    
    #cookie-consent-banner.show {
        transform: translateY(0);
    }
    
    .cookie-content {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        gap: 20px;
        flex-wrap: wrap;
    }
    
    .cookie-text {
        flex: 1;
        min-width: 300px;
    }
    
    .cookie-text h3 {
        margin: 0 0 10px 0;
        font-size: 1.2em;
        color: #ffd700;
    }
    
    .cookie-text p {
        margin: 0;
        font-size: 0.95em;
        line-height: 1.5;
    }
    
    .cookie-text a {
        color: #4a90e2;
        text-decoration: underline;
    }
    
    .cookie-buttons {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
    }
    
    .cookie-btn {
        padding: 12px 24px;
        border: none;
        border-radius: 5px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s;
        font-size: 0.95em;
    }
    
    .cookie-btn-accept {
        background: #4CAF50;
        color: white;
    }
    
    .cookie-btn-accept:hover {
        background: #45a049;
    }
    
    .cookie-btn-reject {
        background: #f44336;
        color: white;
    }
    
    .cookie-btn-reject:hover {
        background: #da190b;
    }
    
    .cookie-btn-settings {
        background: rgba(255,255,255,0.2);
        color: white;
        border: 1px solid rgba(255,255,255,0.3);
    }
    
    .cookie-btn-settings:hover {
        background: rgba(255,255,255,0.3);
    }
    
    /* Cookie Settings Modal */
    #cookie-settings-modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.8);
        z-index: 1000000;
        overflow-y: auto;
    }
    
    #cookie-settings-modal.show {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
    }
    
    .cookie-settings-content {
        background: white;
        border-radius: 10px;
        padding: 30px;
        max-width: 600px;
        width: 100%;
        max-height: 80vh;
        overflow-y: auto;
        color: #333;
    }
    
    .cookie-settings-content h2 {
        margin-top: 0;
        color: #1a1f3a;
    }
    
    .cookie-category {
        margin: 20px 0;
        padding: 15px;
        background: #f5f5f5;
        border-radius: 5px;
    }
    
    .cookie-category h4 {
        margin: 0 0 10px 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .cookie-category p {
        margin: 5px 0;
        font-size: 0.9em;
        color: #666;
    }
    
    .cookie-toggle {
        position: relative;
        width: 50px;
        height: 24px;
    }
    
    .cookie-toggle input {
        opacity: 0;
        width: 0;
        height: 0;
    }
    
    .cookie-toggle label {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ccc;
        transition: 0.4s;
        border-radius: 24px;
    }
    
    .cookie-toggle label:before {
        position: absolute;
        content: "";
        height: 18px;
        width: 18px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        transition: 0.4s;
        border-radius: 50%;
    }
    
    .cookie-toggle input:checked + label {
        background-color: #4CAF50;
    }
    
    .cookie-toggle input:checked + label:before {
        transform: translateX(26px);
    }
    
    .cookie-toggle input:disabled + label {
        opacity: 0.5;
        cursor: not-allowed;
    }
    
    @media (max-width: 768px) {
        .cookie-content {
            flex-direction: column;
        }
        
        .cookie-buttons {
            width: 100%;
            flex-direction: column;
        }
        
        .cookie-btn {
            width: 100%;
        }
    }
</style>
`;

// HTML do Cookie Banner
const cookieBannerHTML = `
<div id="cookie-consent-banner">
    <div class="cookie-content">
        <div class="cookie-text">
            <h3>🍪 Cookies e Privacidade</h3>
            <p>
                Usamos cookies essenciais para o funcionamento do jogo e cookies de terceiros (Google AdSense) 
                para exibir anúncios personalizados. 
                <a href="/privacy-policy.html" target="_blank">Ler Política de Privacidade</a>
            </p>
        </div>
        <div class="cookie-buttons">
            <button class="cookie-btn cookie-btn-accept" onclick="CookieConsent.acceptAll()">
                ✅ Aceitar Todos
            </button>
            <button class="cookie-btn cookie-btn-reject" onclick="CookieConsent.rejectAll()">
                ❌ Rejeitar Não-Essenciais
            </button>
            <button class="cookie-btn cookie-btn-settings" onclick="CookieConsent.showSettings()">
                ⚙️ Configurar
            </button>
        </div>
    </div>
</div>

<div id="cookie-settings-modal">
    <div class="cookie-settings-content">
        <h2>⚙️ Configurações de Cookies</h2>
        <p style="margin-bottom: 20px;">Escolha quais tipos de cookies você aceita:</p>
        
        <div class="cookie-category">
            <h4>
                <span>🔒 Cookies Essenciais</span>
                <div class="cookie-toggle">
                    <input type="checkbox" id="cookie-essential" checked disabled>
                    <label for="cookie-essential"></label>
                </div>
            </h4>
            <p><strong>Sempre ativos</strong> - Necessários para o funcionamento básico do jogo.</p>
            <p><small>Exemplos: Nome de jogador, recorde, progresso</small></p>
        </div>
        
        <div class="cookie-category">
            <h4>
                <span>📊 Cookies Funcionais</span>
                <div class="cookie-toggle">
                    <input type="checkbox" id="cookie-functional" checked>
                    <label for="cookie-functional"></label>
                </div>
            </h4>
            <p>Melhoram sua experiência de jogo.</p>
            <p><small>Exemplos: Contador de partidas, preferências</small></p>
        </div>
        
        <div class="cookie-category">
            <h4>
                <span>🎯 Cookies de Publicidade</span>
                <div class="cookie-toggle">
                    <input type="checkbox" id="cookie-advertising">
                    <label for="cookie-advertising"></label>
                </div>
            </h4>
            <p>Permitem exibir anúncios personalizados (Google AdSense).</p>
            <p><small>Terceiros: Google, DoubleClick</small></p>
        </div>
        
        <div style="margin-top: 30px; display: flex; gap: 10px; flex-wrap: wrap;">
            <button class="cookie-btn cookie-btn-accept" onclick="CookieConsent.saveSettings()" style="flex: 1;">
                ✅ Salvar Preferências
            </button>
            <button class="cookie-btn cookie-btn-settings" onclick="CookieConsent.closeSettings()">
                Cancelar
            </button>
        </div>
        
        <p style="margin-top: 20px; font-size: 0.85em; color: #666;">
            <strong>Nota:</strong> Rejeitar cookies de publicidade pode resultar em anúncios menos relevantes, 
            mas não afetará sua privacidade. Você pode alterar essas configurações a qualquer momento.
        </p>
    </div>
</div>
`;

// JavaScript do Cookie Consent
const CookieConsent = {
    // Configurações
    cookieName: 'starrush_cookie_consent',
    cookieExpiry: 365, // dias
    
    // Estado
    consent: {
        essential: true, // Sempre true
        functional: false,
        advertising: false,
        timestamp: null
    },
    
    // Inicializar
    init() {
        // Injetar CSS
        document.head.insertAdjacentHTML('beforeend', cookieBannerCSS);
        
        // Injetar HTML
        document.body.insertAdjacentHTML('beforeend', cookieBannerHTML);
        
        // Verificar consentimento existente
        const saved = this.loadConsent();
        
        if (saved) {
            this.consent = saved;
            this.applyConsent();
        } else {
            // Mostrar banner após 1 segundo
            setTimeout(() => {
                document.getElementById('cookie-consent-banner').classList.add('show');
            }, 1000);
        }
        
        // Log
        console.log('🍪 Cookie Consent carregado');
    },
    
    // Aceitar todos
    acceptAll() {
        this.consent = {
            essential: true,
            functional: true,
            advertising: true,
            timestamp: new Date().toISOString()
        };
        
        this.saveConsent();
        this.applyConsent();
        this.hideBanner();
        
        console.log('✅ Todos os cookies aceitos');
        this.showToast('✅ Cookies aceitos! Obrigado.', 'success');
    },
    
    // Rejeitar não-essenciais
    rejectAll() {
        this.consent = {
            essential: true,
            functional: false,
            advertising: false,
            timestamp: new Date().toISOString()
        };
        
        this.saveConsent();
        this.applyConsent();
        this.hideBanner();
        
        console.log('❌ Cookies não-essenciais rejeitados');
        this.showToast('✅ Preferências salvas. Apenas cookies essenciais.', 'info');
    },
    
    // Mostrar configurações
    showSettings() {
        document.getElementById('cookie-settings-modal').classList.add('show');
        
        // Atualizar checkboxes
        document.getElementById('cookie-functional').checked = this.consent.functional;
        document.getElementById('cookie-advertising').checked = this.consent.advertising;
    },
    
    // Fechar configurações
    closeSettings() {
        document.getElementById('cookie-settings-modal').classList.remove('show');
    },
    
    // Salvar configurações personalizadas
    saveSettings() {
        this.consent = {
            essential: true,
            functional: document.getElementById('cookie-functional').checked,
            advertising: document.getElementById('cookie-advertising').checked,
            timestamp: new Date().toISOString()
        };
        
        this.saveConsent();
        this.applyConsent();
        this.closeSettings();
        this.hideBanner();
        
        console.log('⚙️ Configurações salvas:', this.consent);
        this.showToast('✅ Configurações de cookies salvas!', 'success');
    },
    
    // Esconder banner
    hideBanner() {
        const banner = document.getElementById('cookie-consent-banner');
        banner.classList.remove('show');
        setTimeout(() => {
            banner.style.display = 'none';
        }, 300);
    },
    
    // Salvar no localStorage
    saveConsent() {
        localStorage.setItem(this.cookieName, JSON.stringify(this.consent));
    },
    
    // Carregar do localStorage
    loadConsent() {
        const saved = localStorage.getItem(this.cookieName);
        if (!saved) return null;
        
        try {
            const data = JSON.parse(saved);
            // Verificar se expirou (1 ano)
            const timestamp = new Date(data.timestamp);
            const now = new Date();
            const daysDiff = (now - timestamp) / (1000 * 60 * 60 * 24);
            
            if (daysDiff > this.cookieExpiry) {
                localStorage.removeItem(this.cookieName);
                return null;
            }
            
            return data;
        } catch (e) {
            return null;
        }
    },
    
    // Aplicar consentimento
    applyConsent() {
        // Cookies funcionais
        if (!this.consent.functional) {
            // Remove cookies funcionais se rejeitados
            localStorage.removeItem('games_played');
        }
        
        // Cookies de publicidade (Google AdSense)
        if (this.consent.advertising) {
            console.log('🎯 AdSense autorizado');
            // AdSense já está carregado no HTML principal
            // Aqui você poderia adicionar código para notificar o Google
        } else {
            console.log('🚫 AdSense bloqueado pelo usuário');
            // Você pode ocultar anúncios ou mostrar mensagem
        }
        
        console.log('Consentimento aplicado:', this.consent);
    },
    
    // Toast notification
    showToast(message, type = 'info') {
        // Usa a função showToast do jogo se disponível
        if (typeof showToast === 'function') {
            showToast(message, type);
        } else {
            console.log(message);
        }
    },
    
    // Verificar se tipo de cookie está permitido
    isAllowed(type) {
        return this.consent[type] === true;
    },
    
    // Resetar (para testes)
    reset() {
        localStorage.removeItem(this.cookieName);
        location.reload();
    }
};

// Inicializar quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => CookieConsent.init());
} else {
    CookieConsent.init();
}

// Exportar para uso global
window.CookieConsent = CookieConsent;
