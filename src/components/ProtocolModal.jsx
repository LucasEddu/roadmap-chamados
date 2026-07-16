import React, { useState, useEffect } from 'react';
import { X, CheckSquare, Plus, Trash2 } from 'lucide-react';
import ProtocolTimeline from './ProtocolTimeline';

export default function ProtocolModal({ isOpen, onClose, onSave, editingProtocol }) {
  const [systemName, setSystemName] = useState('');
  const [protocolNumber, setProtocolNumber] = useState('');
  const [description, setDescription] = useState('');
  const [responsible, setResponsible] = useState('');
  const [priority, setPriority] = useState('Média');
  const [status, setStatus] = useState('Aberto');
  const [reminderDate, setReminderDate] = useState('');
  const [checklist, setChecklist] = useState([]);
  const [newStepText, setNewStepText] = useState('');
  const [type, setType] = useState('Onboarding');

  useEffect(() => {
    if (editingProtocol) {
      setSystemName(editingProtocol.systemName || '');
      setProtocolNumber(editingProtocol.protocolNumber || '');
      setDescription(editingProtocol.description || '');
      setResponsible(editingProtocol.responsible || '');
      setPriority(editingProtocol.priority || 'Média');
      setStatus(editingProtocol.status || 'Aberto');
      setReminderDate(editingProtocol.reminderDate ? editingProtocol.reminderDate.substring(0, 10) : '');
      setChecklist(editingProtocol.checklist || []);
      setNewStepText('');
      setType(editingProtocol.type || 'Onboarding');
    } else {
      setSystemName('');
      setProtocolNumber('');
      setDescription('');
      setResponsible('');
      setPriority('Média');
      setStatus('Aberto');
      setReminderDate('');
      setChecklist([]);
      setNewStepText('');
      setType('Onboarding');
    }
  }, [editingProtocol, isOpen]);

  if (!isOpen) return null;

  const handleAddStep = () => {
    if (newStepText.trim()) {
      setChecklist([...checklist, { text: newStepText.trim(), completed: false }]);
      setNewStepText('');
    }
  };

  const handleToggleStep = (index) => {
    setChecklist(checklist.map((item, idx) => 
      idx === index ? { ...item, completed: !item.completed } : item
    ));
  };

  const handleRemoveStep = (index) => {
    setChecklist(checklist.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!systemName || !description) {
      alert('Por favor, preencha os campos obrigatórios.');
      return;
    }
    
    onSave({
      id: editingProtocol ? editingProtocol.id : Date.now().toString(),
      systemName,
      protocolNumber,
      description,
      responsible,
      priority,
      status,
      type,
      reminderDate: reminderDate ? new Date(reminderDate + 'T12:00:00').toISOString() : null,
      checklist,
      openedDate: editingProtocol ? editingProtocol.openedDate : new Date().toISOString()
    });
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(86, 51, 27, 0.4)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '24px',
        width: '100%',
        maxWidth: editingProtocol ? '850px' : '540px',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid rgba(86, 51, 27, 0.1)',
        overflow: 'hidden',
        transition: 'max-width 0.3s ease'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.5rem 2rem',
          borderBottom: '1px solid rgba(86, 51, 27, 0.08)'
        }}>
          <h2 style={{
            fontSize: '1.6rem',
            color: 'var(--cafezinho)',
            fontFamily: 'var(--font-serif)'
          }}>
            {editingProtocol ? 'Editar Chamado' : 'Novo Protocolo'}
          </h2>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)'
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className={editingProtocol ? "modal-grid" : ""}>
            <div className={editingProtocol ? "modal-form-side" : ""} style={!editingProtocol ? { padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' } : {}}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--cafezinho)' }}>
                  Nome do Sistema *
                </label>
                <input 
                  type="text" 
                  value={systemName} 
                  onChange={(e) => setSystemName(e.target.value)}
                  placeholder="Ex: ERP Athenas, CRM Pulse"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    border: '1px solid rgba(86, 51, 27, 0.2)',
                    fontFamily: 'var(--font-sans)',
                    outline: 'none'
                  }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--cafezinho)' }}>
                    Número do Protocolo
                  </label>
                  <input 
                    type="text" 
                    value={protocolNumber} 
                    onChange={(e) => setProtocolNumber(e.target.value)}
                    placeholder="Ex: 48593"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '12px',
                      border: '1px solid rgba(86, 51, 27, 0.2)',
                      fontFamily: 'var(--font-sans)',
                      outline: 'none'
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--cafezinho)' }}>
                    Responsável
                  </label>
                  <input 
                    type="text" 
                    value={responsible} 
                    onChange={(e) => setResponsible(e.target.value)}
                    placeholder="Ex: Lucas Moura"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '12px',
                      border: '1px solid rgba(86, 51, 27, 0.2)',
                      fontFamily: 'var(--font-sans)',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--cafezinho)' }}>
                  Descrição do Chamado *
                </label>
                <textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva claramente o objetivo deste chamado / onboarding"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    border: '1px solid rgba(86, 51, 27, 0.2)',
                    fontFamily: 'var(--font-sans)',
                    outline: 'none',
                    resize: 'none'
                  }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '120px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--cafezinho)' }}>
                    Tipo de Chamado
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '12px',
                      border: '1px solid rgba(86, 51, 27, 0.2)',
                      fontFamily: 'var(--font-sans)',
                      outline: 'none',
                      backgroundColor: '#fff'
                    }}
                  >
                    <option value="Onboarding">Onboarding</option>
                    <option value="Atendimento">Atendimento</option>
                  </select>
                </div>
                <div style={{ flex: 1, minWidth: '120px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--cafezinho)' }}>
                    Prioridade
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '12px',
                      border: '1px solid rgba(86, 51, 27, 0.2)',
                      fontFamily: 'var(--font-sans)',
                      outline: 'none',
                      backgroundColor: '#fff'
                    }}
                  >
                    <option value="Baixa">Baixa</option>
                    <option value="Média">Média</option>
                    <option value="Alta">Alta</option>
                  </select>
                </div>
                <div style={{ flex: 1, minWidth: '120px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--cafezinho)' }}>
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '12px',
                      border: '1px solid rgba(86, 51, 27, 0.2)',
                      fontFamily: 'var(--font-sans)',
                      outline: 'none',
                      backgroundColor: '#fff'
                    }}
                  >
                    <option value="Aberto">Aberto</option>
                    <option value="Em Execução">Em Execução</option>
                    <option value="Executado">Executado</option>
                  </select>
                </div>
                <div style={{ flex: 1.2, minWidth: '160px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--cafezinho)' }}>
                    Data de Alerta (Lembrete)
                  </label>
                  <input 
                    type="date"
                    value={reminderDate}
                    onChange={(e) => setReminderDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '12px',
                      border: '1px solid rgba(86, 51, 27, 0.2)',
                      fontFamily: 'var(--font-sans)',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Checklist Segment */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--cafezinho)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <CheckSquare size={14} /> Etapas de Conclusão (Checklist)
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input 
                    type="text"
                    placeholder="Adicionar nova etapa de implantação..."
                    value={newStepText}
                    onChange={(e) => setNewStepText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddStep(); } }}
                    style={{
                      flex: 1,
                      padding: '0.65rem 1rem',
                      borderRadius: '12px',
                      border: '1px solid rgba(86, 51, 27, 0.2)',
                      fontFamily: 'var(--font-sans)',
                      outline: 'none',
                      fontSize: '0.9rem'
                    }}
                  />
                  <button 
                    type="button"
                    onClick={handleAddStep}
                    className="btn btn-primary"
                    style={{ borderRadius: '12px', padding: '0.65rem 1.25rem' }}
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '0.4rem', 
                  maxHeight: '120px', 
                  overflowY: 'auto', 
                  paddingRight: '4px',
                  border: checklist.length > 0 ? '1px solid rgba(86, 51, 27, 0.1)' : 'none',
                  borderRadius: '12px',
                  padding: checklist.length > 0 ? '0.5rem' : '0'
                }}>
                  {checklist.map((step, idx) => (
                    <div key={idx} className="checklist-item">
                      <input 
                        type="checkbox"
                        checked={step.completed}
                        onChange={() => handleToggleStep(idx)}
                        style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                      />
                      <span style={{ 
                        flex: 1, 
                        fontSize: '0.85rem', 
                        textDecoration: step.completed ? 'line-through' : 'none',
                        color: step.completed ? 'var(--text-muted)' : 'var(--cafezinho)'
                      }}>
                        {step.text}
                      </span>
                      <button 
                        type="button"
                        onClick={() => handleRemoveStep(idx)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#DA0D17',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          padding: '0.2rem'
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Buttons */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '1rem',
                marginTop: '0.5rem',
                borderTop: '1px solid rgba(86, 51, 27, 0.08)',
                paddingTop: '1.25rem'
              }}>
                <button 
                  type="button" 
                  onClick={onClose} 
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                >
                  Salvar
                </button>
              </div>
            </div>
            
            {editingProtocol && (
              <div className="modal-timeline-side">
                <ProtocolTimeline history={editingProtocol.history} />
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
