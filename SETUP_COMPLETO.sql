-- ================================================================
-- STARRUSH - CONFIGURAÇÃO AUTOMÁTICA SUPABASE
-- ================================================================
-- INSTRUÇÕES: 
-- 1. Copie TUDO (Ctrl+A, Ctrl+C)
-- 2. Cole no Supabase SQL Editor
-- 3. Clique em "RUN"
-- 4. Pronto! ✅
-- ================================================================

-- Limpa tabelas existentes (se houver)
DROP TABLE IF EXISTS daily_challenges CASCADE;
DROP TABLE IF EXISTS rankings CASCADE;
DROP TABLE IF EXISTS players CASCADE;

-- Remove funções antigas (se houver)
DROP FUNCTION IF EXISTS get_total_stars() CASCADE;
DROP FUNCTION IF EXISTS get_total_players() CASCADE;
DROP FUNCTION IF EXISTS get_today_players() CASCADE;
DROP FUNCTION IF EXISTS update_player_stats() CASCADE;
DROP FUNCTION IF EXISTS cleanup_old_challenges() CASCADE;

-- Remove views antigas (se houver)
DROP VIEW IF EXISTS ranking_top_100 CASCADE;
DROP VIEW IF EXISTS daily_leaderboard CASCADE;

-- ================================================================
-- CRIAÇÃO DAS TABELAS
-- ================================================================

-- Tabela principal: Rankings
CREATE TABLE rankings (
    id BIGSERIAL PRIMARY KEY,
    player_id TEXT NOT NULL,
    player_name TEXT NOT NULL,
    score INTEGER NOT NULL CHECK (score >= 0),
    stars_collected INTEGER DEFAULT 0 CHECK (stars_collected >= 0),
    max_combo INTEGER DEFAULT 1 CHECK (max_combo >= 1),
    country TEXT DEFAULT 'BR',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela: Desafios Diários
CREATE TABLE daily_challenges (
    id BIGSERIAL PRIMARY KEY,
    challenge_date DATE NOT NULL DEFAULT CURRENT_DATE,
    player_id TEXT NOT NULL,
    player_name TEXT NOT NULL,
    score INTEGER NOT NULL CHECK (score >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(challenge_date, player_id)
);

-- Tabela: Perfis de Jogadores
CREATE TABLE players (
    id BIGSERIAL PRIMARY KEY,
    player_id TEXT UNIQUE NOT NULL,
    player_name TEXT NOT NULL,
    total_games INTEGER DEFAULT 0,
    total_stars INTEGER DEFAULT 0,
    highest_score INTEGER DEFAULT 0,
    highest_combo INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_played_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- ÍNDICES (PERFORMANCE)
-- ================================================================

-- Rankings
CREATE INDEX idx_rankings_score ON rankings(score DESC);
CREATE INDEX idx_rankings_player_id ON rankings(player_id);
CREATE INDEX idx_rankings_created_at ON rankings(created_at DESC);
CREATE INDEX idx_rankings_country ON rankings(country);

-- Daily Challenges
CREATE INDEX idx_daily_date_score ON daily_challenges(challenge_date, score DESC);
CREATE INDEX idx_daily_player ON daily_challenges(player_id);
CREATE INDEX idx_daily_date ON daily_challenges(challenge_date DESC);

-- Players
CREATE INDEX idx_players_id ON players(player_id);
CREATE INDEX idx_players_score ON players(highest_score DESC);
CREATE INDEX idx_players_last_played ON players(last_played_at DESC);

-- ================================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================================

-- Ativa RLS em todas as tabelas
ALTER TABLE rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Políticas: Rankings (todos podem ler e inserir)
CREATE POLICY "Rankings - Leitura pública"
    ON rankings FOR SELECT
    USING (true);

CREATE POLICY "Rankings - Inserção pública"
    ON rankings FOR INSERT
    WITH CHECK (true);

-- Políticas: Desafios Diários
CREATE POLICY "Daily - Leitura pública"
    ON daily_challenges FOR SELECT
    USING (true);

CREATE POLICY "Daily - Inserção pública"
    ON daily_challenges FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Daily - Atualização própria"
    ON daily_challenges FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Políticas: Jogadores
CREATE POLICY "Players - Leitura pública"
    ON players FOR SELECT
    USING (true);

CREATE POLICY "Players - Inserção pública"
    ON players FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Players - Atualização pública"
    ON players FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- ================================================================
-- FUNÇÕES AUXILIARES
-- ================================================================

-- Função: Total de estrelas coletadas
CREATE OR REPLACE FUNCTION get_total_stars()
RETURNS BIGINT
LANGUAGE sql
STABLE
AS $$
    SELECT COALESCE(SUM(stars_collected), 0)::BIGINT
    FROM rankings;
$$;

-- Função: Total de jogadores únicos
CREATE OR REPLACE FUNCTION get_total_players()
RETURNS BIGINT
LANGUAGE sql
STABLE
AS $$
    SELECT COUNT(DISTINCT player_id)::BIGINT
    FROM rankings;
$$;

-- Função: Jogadores que jogaram hoje
CREATE OR REPLACE FUNCTION get_today_players()
RETURNS BIGINT
LANGUAGE sql
STABLE
AS $$
    SELECT COUNT(DISTINCT player_id)::BIGINT
    FROM rankings
    WHERE created_at >= CURRENT_DATE;
$$;

-- Função: Atualiza perfil do jogador automaticamente
CREATE OR REPLACE FUNCTION update_player_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO players (
        player_id, 
        player_name, 
        total_games, 
        total_stars, 
        highest_score, 
        highest_combo, 
        last_played_at
    )
    VALUES (
        NEW.player_id, 
        NEW.player_name, 
        1, 
        NEW.stars_collected, 
        NEW.score, 
        NEW.max_combo, 
        NOW()
    )
    ON CONFLICT (player_id) DO UPDATE
    SET 
        total_games = players.total_games + 1,
        total_stars = players.total_stars + NEW.stars_collected,
        highest_score = GREATEST(players.highest_score, NEW.score),
        highest_combo = GREATEST(players.highest_combo, NEW.max_combo),
        last_played_at = NOW(),
        player_name = NEW.player_name;
    
    RETURN NEW;
END;
$$;

-- Função: Limpa desafios antigos (30+ dias)
CREATE OR REPLACE FUNCTION cleanup_old_challenges()
RETURNS void
LANGUAGE sql
AS $$
    DELETE FROM daily_challenges
    WHERE challenge_date < CURRENT_DATE - INTERVAL '30 days';
$$;

-- ================================================================
-- TRIGGERS
-- ================================================================

-- Trigger: Atualiza perfil ao inserir ranking
DROP TRIGGER IF EXISTS trigger_update_player_stats ON rankings;
CREATE TRIGGER trigger_update_player_stats
AFTER INSERT ON rankings
FOR EACH ROW
EXECUTE FUNCTION update_player_stats();

-- ================================================================
-- VIEWS (CACHE DE DADOS)
-- ================================================================

-- View: Top 100 Ranking Global
CREATE OR REPLACE VIEW ranking_top_100 AS
SELECT 
    player_name,
    score,
    stars_collected,
    max_combo,
    country,
    created_at,
    ROW_NUMBER() OVER (ORDER BY score DESC) as rank
FROM rankings
ORDER BY score DESC
LIMIT 100;

-- View: Leaderboard do Desafio do Dia
CREATE OR REPLACE VIEW daily_leaderboard AS
SELECT 
    challenge_date,
    player_name,
    score,
    created_at,
    ROW_NUMBER() OVER (PARTITION BY challenge_date ORDER BY score DESC) as rank
FROM daily_challenges
WHERE challenge_date = CURRENT_DATE
ORDER BY score DESC;

-- ================================================================
-- DADOS DE TESTE (OPCIONAL - PODE REMOVER)
-- ================================================================

-- Insere alguns dados de exemplo para testar
INSERT INTO rankings (player_id, player_name, score, stars_collected, max_combo, country) VALUES
('test_001', 'Jogador 1', 1000, 100, 10, 'BR'),
('test_002', 'Jogador 2', 850, 85, 8, 'BR'),
('test_003', 'Jogador 3', 720, 72, 7, 'BR'),
('test_004', 'Jogador 4', 650, 65, 6, 'BR'),
('test_005', 'Jogador 5', 500, 50, 5, 'BR');

-- Insere desafio do dia de teste
INSERT INTO daily_challenges (challenge_date, player_id, player_name, score) VALUES
(CURRENT_DATE, 'test_001', 'Jogador 1', 500),
(CURRENT_DATE, 'test_002', 'Jogador 2', 450),
(CURRENT_DATE, 'test_003', 'Jogador 3', 400);

-- ================================================================
-- VERIFICAÇÃO FINAL
-- ================================================================

-- Testa as funções
DO $$
DECLARE
    total_players BIGINT;
    total_stars BIGINT;
BEGIN
    total_players := get_total_players();
    total_stars := get_total_stars();
    
    RAISE NOTICE '✅ CONFIGURAÇÃO CONCLUÍDA!';
    RAISE NOTICE '📊 Total de jogadores: %', total_players;
    RAISE NOTICE '⭐ Total de estrelas: %', total_stars;
    RAISE NOTICE '';
    RAISE NOTICE '🎮 Tabelas criadas:';
    RAISE NOTICE '   ✓ rankings';
    RAISE NOTICE '   ✓ daily_challenges';
    RAISE NOTICE '   ✓ players';
    RAISE NOTICE '';
    RAISE NOTICE '🔧 Funções criadas:';
    RAISE NOTICE '   ✓ get_total_players()';
    RAISE NOTICE '   ✓ get_total_stars()';
    RAISE NOTICE '   ✓ get_today_players()';
    RAISE NOTICE '   ✓ update_player_stats()';
    RAISE NOTICE '   ✓ cleanup_old_challenges()';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Views criadas:';
    RAISE NOTICE '   ✓ ranking_top_100';
    RAISE NOTICE '   ✓ daily_leaderboard';
    RAISE NOTICE '';
    RAISE NOTICE '🔐 RLS ativado em todas as tabelas';
    RAISE NOTICE '📈 Índices criados para performance';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 TUDO PRONTO! Agora cole suas credenciais no index.html';
END $$;

-- ================================================================
-- FIM DA CONFIGURAÇÃO
-- ================================================================
-- Próximo passo: Copie URL e KEY do Supabase para o index.html
-- Settings → API → Project URL e Anon Key
-- ================================================================
