import React from 'react';
import { Calendar, Tag, User, ArrowRight, ArrowLeft, Trash2, Edit, CheckSquare } from 'lucide-react';

export default function ProtocolCard({ protocol, onEdit, onDelete, onMoveStatus }) {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Alta':
        return '#DA0D17'; // Red Velvet
      case 'Média':
        return '#DA5513'; // Laranja San Paolo
      case 'Baixa':
      default:
        return '#265D7C'; // Ao Leite
    }
  };

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

  // SLA Calculation helper
  const getSLAText = () => {
    const start = new Date(protocol.openedDate);
    let end = new Date();
    if (protocol.status === 'Executado' && protocol.history) {
      const finishedEvent = [...protocol.history]
        .reverse()
        .find(h => h.statusTo === 'Executado');
      if (finishedEvent) {
        end = new Date(finishedEvent.date);
      }
    }
    const diffMs = end - start;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) {
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHrs <= 0) {
        return 'Hoje';
      }
      return `${diffHrs}h`;
    }
    return `${diffDays}d`;
  };

  // Check if reminderDate is active/overdue
  const isOverdue = 
    protocol.status !== 'Executado' && 
    protocol.reminderDate && 
    new Date(protocol.reminderDate) <= new Date();

  // Checklist calculations
  const checklist = protocol.checklist || [];
  const totalSteps = checklist.length;
  const completedSteps = checklist.filter(c => c.completed).length;
  const progressPercent = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  return (
    <div className={`protocol-card ${isOverdue ? 'card-alert' : ''}`} style={{
      backgroundColor: '#fff',
      borderRadius: '16px',
      padding: '1.25rem',
      border: '1px solid rgba(86, 51, 27, 0.1)',
      boxShadow: 'var(--shadow-sm)',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      position: 'relative',
      transition: 'var(--transition)',
      cursor: 'default'
    }}>
      {/* Top Section: System Name & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '1.2rem',
          fontWeight: '700',
          color: 'var(--cafezinho)'
        }}>
          {protocol.systemName}
        </span>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button 
            onClick={() => onEdit(protocol)} 
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '0.2rem',
              borderRadius: '4px',
              transition: 'var(--transition)'
            }}
            title="Editar chamado"
          >
            <Edit size={16} />
          </button>
          <button 
            onClick={() => onDelete(protocol.id)} 
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'rgba(218, 13, 23, 0.7)',
              padding: '0.2rem',
              borderRadius: '4px',
              transition: 'var(--transition)'
            }}
            title="Excluir chamado"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Protocol Identifier */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{
          fontSize: '0.85rem',
          fontWeight: '700',
          color: getStatusColor(protocol.status),
          background: `${getStatusColor(protocol.status)}10`,
          padding: '0.35rem 0.7rem',
          borderRadius: '50px',
          fontFamily: 'var(--font-sans)',
          letterSpacing: '0.05em'
        }}>
          Prot: {protocol.protocolNumber || 'Sem Protocolo'}
        </div>
        {protocol.reminderDate && (
          <div style={{
            fontSize: '0.8rem',
            color: isOverdue ? 'var(--color-red-velvet)' : 'var(--text-muted)',
            fontWeight: '600',
            backgroundColor: isOverdue ? 'rgba(218, 13, 23, 0.1)' : 'rgba(86, 51, 27, 0.05)',
            padding: '0.35rem 0.7rem',
            borderRadius: '50px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}>
            <Calendar size={12} />
            <span>Alerta: {new Date(protocol.reminderDate).toLocaleDateString('pt-BR')}</span>
          </div>
        )}
      </div>

      {/* Description */}
      <p style={{
        fontSize: '0.92rem',
        lineHeight: '1.5',
        color: 'var(--text-muted)',
        whiteSpace: 'pre-wrap',
        fontFamily: 'var(--font-sans)'
      }}>
        {protocol.description}
      </p>

      {/* Checklist Progress Bar */}
      {totalSteps > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <CheckSquare size={13} />
              {completedSteps}/{totalSteps} etapas concluídas
            </span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <div className="progress-container">
            <div 
              className="progress-bar-fill" 
              style={{ 
                width: `${progressPercent}%`, 
                backgroundColor: getStatusColor(protocol.status) 
              }} 
            />
          </div>
        </div>
      )}

      {/* Meta Info */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.8rem',
        fontSize: '0.8rem',
        color: '#6e5c54',
        borderTop: '1px solid rgba(86, 51, 27, 0.06)',
        paddingTop: '0.8rem',
        marginTop: 'auto'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <User size={13} />
          <span>{protocol.responsible || 'Sem responsável'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }} title="Tempo decorrido / SLA de conclusão">
          <span>⏱️ {getSLAText()}</span>
        </div>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.3rem',
          marginLeft: 'auto',
          fontWeight: '600',
          color: getPriorityColor(protocol.priority)
        }}>
          <Tag size={13} />
          <span>{protocol.priority}</span>
        </div>
      </div>

      {/* Navigation Actions between Kanban Statuses */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        borderTop: '1px solid rgba(86, 51, 27, 0.06)',
        paddingTop: '0.8rem',
        alignItems: 'center'
      }}>
        {protocol.status !== 'Aberto' ? (
          <button
            onClick={() => onMoveStatus(protocol.id, protocol.status === 'Executado' ? 'Em Execução' : 'Aberto')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontSize: '0.8rem',
              fontWeight: '600'
            }}
          >
            <ArrowLeft size={14} /> Voltar
          </button>
        ) : <div />}

        {protocol.status !== 'Executado' ? (
          <button
            onClick={() => onMoveStatus(protocol.id, protocol.status === 'Aberto' ? 'Em Execução' : 'Executado')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontSize: '0.8rem',
              fontWeight: '600',
              marginLeft: 'auto'
            }}
          >
            Avançar <ArrowRight size={14} />
          </button>
        ) : <div />}
      </div>
    </div>
  );
}
