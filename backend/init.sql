-- データベース初期化スクリプト

-- カウンターテーブル
CREATE TABLE IF NOT EXISTS counters (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- カウンター履歴テーブル
CREATE TABLE IF NOT EXISTS counter_history (
    id SERIAL PRIMARY KEY,
    counter_id INTEGER REFERENCES counters(id) ON DELETE CASCADE,
    count INTEGER NOT NULL,
    action VARCHAR(20) NOT NULL, -- 'increment' or 'decrement'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_counter_history_counter_id ON counter_history(counter_id);
CREATE INDEX IF NOT EXISTS idx_counter_history_created_at ON counter_history(created_at);

-- サンプルデータ挿入
INSERT INTO counters (name, count) VALUES 
    ('メインカウンター', 5),
    ('サブカウンター', 12)
ON CONFLICT DO NOTHING;