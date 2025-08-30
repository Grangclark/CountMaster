import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function App() {
  const [counters, setCounters] = useState([]);
  const [history, setHistory] = useState([]);
  const [newCounterName, setNewCounterName] = useState('');
  const [activeTab, setActiveTab] = useState('counters');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // カウンターをロード
  const loadCounters = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/counters`);
      setCounters(response.data);
      setError('');
    } catch (err) {
      console.error('カウンター読み込みエラー:', err);
      setError('カウンターの読み込みに失敗しました');
    }
  };

  // 履歴をロード
  const loadHistory = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/history`);
      setHistory(response.data);
    } catch (err) {
      console.error('履歴読み込みエラー:', err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadCounters(), loadHistory()]);
      setLoading(false);
    };
    loadData();
  }, []);

  // 新しいカウンターを作成
  const createCounter = async (e) => {
    e.preventDefault();
    if (!newCounterName.trim()) {
      setError('カウンター名を入力してください');
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/api/counters`, {
        name: newCounterName.trim()
      });
      setNewCounterName('');
      setError('');
      await loadCounters();
    } catch (err) {
      console.error('カウンター作成エラー:', err);
      setError('カウンターの作成に失敗しました');
    }
  };

  // カウンターを更新
  const updateCounter = async (id, newCount) => {
    try {
      await axios.put(`${API_BASE_URL}/api/counters/${id}`, {
        count: newCount
      });
      await Promise.all([loadCounters(), loadHistory()]);
    } catch (err) {
      console.error('カウンター更新エラー:', err);
      setError('カウンターの更新に失敗しました');
    }
  };

  // カウンターを削除
  const deleteCounter = async (id) => {
    if (!window.confirm('このカウンターを削除しますか？')) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/api/counters/${id}`);
      await Promise.all([loadCounters(), loadHistory()]);
    } catch (err) {
      console.error('カウンター削除エラー:', err);
      setError('カウンターの削除に失敗しました');
    }
  };

  // 時刻フォーマット
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="app">
        <div className="container">
          <div className="loading">読み込み中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="container">
        <div className="header">
          <h1>🔢 カウンターアプリ</h1>
          <p>複数のカウンターを管理して履歴を保存できます</p>
        </div>

        {error && <div className="error">{error}</div>}

        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'counters' ? 'active' : ''}`}
            onClick={() => setActiveTab('counters')}
          >
            カウンター管理
          </button>
          <button 
            className={`tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            履歴
          </button>
        </div>

        {activeTab === 'counters' && (
          <>
            {/* 新しいカウンター作成フォーム */}
            <form className="counter-form" onSubmit={createCounter}>
              <div className="form-group">
                <input
                  type="text"
                  value={newCounterName}
                  onChange={(e) => setNewCounterName(e.target.value)}
                  placeholder="新しいカウンター名を入力"
                  maxLength="100"
                />
                <button type="submit" className="btn btn-primary">
                  ➕ カウンター追加
                </button>
              </div>
            </form>

            {/* カウンターリスト */}
            {counters.length === 0 ? (
              <div className="loading">
                カウンターがありません。上のフォームから作成してください。
              </div>
            ) : (
              <div className="counters-grid">
                {counters.map((counter) => (
                  <div key={counter.id} className="counter-card">
                    <div className="counter-header">
                      <div className="counter-name">{counter.name}</div>
                      <button
                        className="btn btn-delete"
                        onClick={() => deleteCounter(counter.id)}
                        title="カウンターを削除"
                      >
                        🗑️
                      </button>
                    </div>
                    
                    <div className="counter-value">
                      {counter.count.toLocaleString()}
                    </div>
                    
                    <div className="counter-controls">
                      <button
                        className="btn btn-decrement"
                        onClick={() => updateCounter(counter.id, counter.count - 1)}
                        title="1減らす"
                      >
                        -1
                      </button>
                      <button
                        className="btn btn-increment"
                        onClick={() => updateCounter(counter.id, counter.count + 1)}
                        title="1増やす"
                      >
                        +1
                      </button>
                    </div>
                    
                    <div className="counter-controls" style={{ marginTop: '10px' }}>
                      <button
                        className="btn btn-decrement"
                        onClick={() => updateCounter(counter.id, counter.count - 10)}
                        title="10減らす"
                      >
                        -10
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={() => updateCounter(counter.id, 0)}
                        title="リセット"
                      >
                        リセット
                      </button>
                      <button
                        className="btn btn-increment"
                        onClick={() => updateCounter(counter.id, counter.count + 10)}
                        title="10増やす"
                      >
                        +10
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'history' && (
          <div className="history-section">
            <div className="history-header">
              <h3>📊 操作履歴</h3>
              <button 
                className="btn btn-secondary"
                onClick={loadHistory}
                title="履歴を更新"
              >
                🔄 更新
              </button>
            </div>
            
            {history.length === 0 ? (
              <div className="loading">履歴がありません</div>
            ) : (
              <div className="history-list">
                {history.map((item, index) => (
                  <div key={`${item.id}-${index}`} className="history-item">
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '5px'
                    }}>
                      <strong>{item.counter_name}</strong>
                      <span className={`history-action ${item.action}`}>
                        {item.action === 'increment' ? '📈 増加' : '📉 減少'}
                      </span>
                    </div>
                    <div className="history-meta">
                      <span>値: {item.count.toLocaleString()}</span>
                      <span>{formatDateTime(item.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;