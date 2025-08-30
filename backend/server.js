const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = 3001;

// データベース接続設定
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'counterdb',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
});

// ミドルウェア
app.use(cors());
app.use(express.json());

// データベース接続確認
pool.connect((err, client, release) => {
  if (err) {
    console.error('データベース接続エラー:', err);
  } else {
    console.log('データベースに正常に接続しました');
    release();
  }
});

// API ルート

// 全てのカウンターを取得
app.get('/api/counters', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM counters ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('カウンター取得エラー:', error);
    res.status(500).json({ error: 'カウンターの取得に失敗しました' });
  }
});

// 新しいカウンターを作成
app.post('/api/counters', async (req, res) => {
  const { name } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO counters (name, count) VALUES ($1, $2) RETURNING *',
      [name, 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('カウンター作成エラー:', error);
    res.status(500).json({ error: 'カウンターの作成に失敗しました' });
  }
});

// カウンターを更新
app.put('/api/counters/:id', async (req, res) => {
  const { id } = req.params;
  const { count } = req.body;
  try {
    const result = await pool.query(
      'UPDATE counters SET count = $1 WHERE id = $2 RETURNING *',
      [count, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'カウンターが見つかりません' });
    }

    // 履歴に記録
    await pool.query(
      'INSERT INTO counter_history (counter_id, count, action) VALUES ($1, $2, $3)',
      [id, count, count > result.rows[0].count ? 'increment' : 'decrement']
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('カウンター更新エラー:', error);
    res.status(500).json({ error: 'カウンターの更新に失敗しました' });
  }
});

// カウンターを削除
app.delete('/api/counters/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // 先に履歴を削除
    await pool.query('DELETE FROM counter_history WHERE counter_id = $1', [id]);
    
    // カウンターを削除
    const result = await pool.query('DELETE FROM counters WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'カウンターが見つかりません' });
    }

    res.json({ message: 'カウンターが削除されました' });
  } catch (error) {
    console.error('カウンター削除エラー:', error);
    res.status(500).json({ error: 'カウンターの削除に失敗しました' });
  }
});

// カウンターの履歴を取得
app.get('/api/counters/:id/history', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM counter_history WHERE counter_id = $1 ORDER BY created_at DESC LIMIT 50',
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('履歴取得エラー:', error);
    res.status(500).json({ error: '履歴の取得に失敗しました' });
  }
});

// 全体の履歴を取得
app.get('/api/history', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT ch.*, c.name as counter_name 
      FROM counter_history ch 
      JOIN counters c ON ch.counter_id = c.id 
      ORDER BY ch.created_at DESC 
      LIMIT 100
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('全体履歴取得エラー:', error);
    res.status(500).json({ error: '履歴の取得に失敗しました' });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`サーバーがポート ${port} で実行中です`);
});