import React from 'react';

const getStatusColor = (status) => {
  switch (status) {
    case 'Executado':
      return '#4F7043'; // Pistache
    case 'Em Execução':
      return '#DA5513'; // Laranja San Paolo
    case 'Aberto':
    default:
      return '#265D7C'; // Ao Leite
  }
};

const formatDate = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} às ${hours}:${minutes}`;
};

export default function ProtocolTimeline({ history = [] }) {
  if (!history || history.length === 0) {
    return (
      <div className="timeline-empty" style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
        <p style={{ fontSize: '0.9rem', fontStyle: 'italic' }}>Nenhum histórico registrado para este chamado.</p>
      </div>
    );
  }

  // Sort history oldest first
  const sortedHistory = [...history].sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="timeline-container">
      <h3 style={{
        fontSize: '1.1rem',
        color: 'var(--cafezinho)',
        fontFamily: 'var(--font-serif)',
        marginBottom: '1.25rem',
        borderBottom: '1px solid rgba(86, 51, 27, 0.08)',
        paddingBottom: '0.5rem'
      }}>
        Histórico de Progresso
      </h3>
      <div className="timeline-track">
        {sortedHistory.map((item, index) => (
          <div key={index} className="timeline-item">
            <div className="timeline-dot-wrapper">
              <span 
                className="timeline-dot" 
                style={{ backgroundColor: getStatusColor(item.statusTo) }}
              />
            </div>
            <div className="timeline-content">
              <p className="timeline-action">{item.action}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.15rem' }}>
                <span className="timeline-date">{formatDate(item.date)}</span>
                {item.author && (
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600', fontStyle: 'italic' }}>
                    Por: {item.author}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
