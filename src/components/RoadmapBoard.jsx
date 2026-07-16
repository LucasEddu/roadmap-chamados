import React, { useState } from 'react';
import ProtocolCard from './ProtocolCard';
import { Search, Filter, Plus, Calendar, Layers } from 'lucide-react';

export default function RoadmapBoard({ protocols, onEdit, onDelete, onMoveStatus, onOpenAddModal }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [systemFilter, setSystemFilter] = useState('');

  // Extract unique systems for the dropdown filter
  const uniqueSystems = [...new Set(protocols.map(p => p.systemName).filter(Boolean))];

  // Apply filters
  const filteredProtocols = protocols.filter(protocol => {
    const matchesSearch = 
      protocol.systemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      protocol.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (protocol.protocolNumber && protocol.protocolNumber.includes(searchTerm)) ||
      (protocol.responsible && protocol.responsible.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesPriority = priorityFilter ? protocol.priority === priorityFilter : true;
    const matchesSystem = systemFilter ? protocol.systemName === systemFilter : true;

    return matchesSearch && matchesPriority && matchesSystem;
  });

  // Filter columns
  const getColumnProtocols = (status) => {
    return filteredProtocols.filter(p => p.status === status);
  };

  const columns = [
    { id: 'Aberto', title: 'Aberto', color: 'var(--ao-leite)' },
    { id: 'Em Execução', title: 'Em Execução', color: 'var(--laranja-sp)' },
    { id: 'Executado', title: 'Executado', color: 'var(--pistache)' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Board Controls */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem',
        backgroundColor: '#fff',
        padding: '1.25rem 2rem',
        borderRadius: '20px',
        border: '1px solid rgba(86, 51, 27, 0.08)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        {/* Search & Filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', flex: 1, maxWidth: '850px' }}>
          {/* Search bar */}
          <div style={{ position: 'relative', flex: '1 1 250px' }}>
            <Search size={18} style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)'
            }} />
            <input
              type="text"
              placeholder="Buscar sistema, protocolo, chamado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 1rem 0.65rem 2.8rem',
                borderRadius: '50px',
                border: '1px solid rgba(86, 51, 27, 0.2)',
                fontFamily: 'var(--font-sans)',
                outline: 'none',
                fontSize: '0.9rem'
              }}
            />
          </div>

          {/* System Filter */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <select
              value={systemFilter}
              onChange={(e) => setSystemFilter(e.target.value)}
              style={{
                padding: '0.65rem 2rem 0.65rem 1.2rem',
                borderRadius: '50px',
                border: '1px solid rgba(86, 51, 27, 0.2)',
                fontFamily: 'var(--font-sans)',
                outline: 'none',
                fontSize: '0.9rem',
                backgroundColor: '#fff',
                appearance: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="">Todos os Sistemas</option>
              {uniqueSystems.map(sys => (
                <option key={sys} value={sys}>{sys}</option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div style={{ position: 'relative' }}>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              style={{
                padding: '0.65rem 2rem 0.65rem 1.2rem',
                borderRadius: '50px',
                border: '1px solid rgba(86, 51, 27, 0.2)',
                fontFamily: 'var(--font-sans)',
                outline: 'none',
                fontSize: '0.9rem',
                backgroundColor: '#fff',
                appearance: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="">Todas as Prioridades</option>
              <option value="Baixa">Prioridade Baixa</option>
              <option value="Média">Prioridade Média</option>
              <option value="Alta">Prioridade Alta</option>
            </select>
          </div>
        </div>

        {/* Add Button */}
        <button 
          onClick={onOpenAddModal}
          className="btn btn-primary"
          style={{ height: 'fit-content' }}
        >
          <Plus size={18} /> Novo Chamado
        </button>
      </div>

      {/* Board Columns Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.5rem',
        alignItems: 'start'
      }}>
        {columns.map(col => {
          const colProtocols = getColumnProtocols(col.id);
          return (
            <div 
              key={col.id}
              className="roadmap-column"
              style={{
                backgroundColor: 'var(--ninho)',
                borderRadius: '24px',
                padding: '1.25rem',
                border: '1px solid rgba(86, 51, 27, 0.06)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                minHeight: '600px'
              }}
            >
              {/* Column Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: '0.75rem',
                borderBottom: `3px solid ${col.color}`
              }}>
                <h3 style={{
                  fontSize: '1.3rem',
                  color: 'var(--cafezinho)',
                  fontFamily: 'var(--font-serif)',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: col.color,
                    display: 'inline-block'
                  }}></span>
                  {col.title}
                </h3>
                <span style={{
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  backgroundColor: 'rgba(86, 51, 27, 0.08)',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '10px',
                  color: 'var(--cafezinho)'
                }}>
                  {colProtocols.length}
                </span>
              </div>

              {/* Column Card List */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                maxHeight: '70vh',
                overflowY: 'auto',
                paddingRight: '4px'
              }}>
                {colProtocols.length > 0 ? (
                  colProtocols.map(protocol => (
                    <ProtocolCard
                      key={protocol.id}
                      protocol={protocol}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onMoveStatus={onMoveStatus}
                    />
                  ))
                ) : (
                  <div style={{
                    textAlign: 'center',
                    padding: '3rem 1rem',
                    color: 'var(--text-muted)',
                    fontSize: '0.9rem',
                    fontStyle: 'italic',
                    border: '1px dashed rgba(86, 51, 27, 0.15)',
                    borderRadius: '16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.4)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}>
                    <Layers size={24} style={{ opacity: 0.5 }} />
                    <span>Nenhum chamado</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
