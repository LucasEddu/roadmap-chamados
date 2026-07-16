import React, { useState, useEffect } from 'react';
import RoadmapBoard from './components/RoadmapBoard';
import ProtocolModal from './components/ProtocolModal';
import { db } from './firebase';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDoc 
} from 'firebase/firestore';

const INITIAL_PROTOCOLS = [
  {
    id: '1',
    systemName: 'ERP Athenas',
    protocolNumber: '10492',
    description: 'Integração do fluxo de vendas diárias e fechamento de caixa com o sistema de custos/CMV.',
    responsible: 'Lucas Moura',
    priority: 'Alta',
    status: 'Aberto',
    openedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    reminderDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // Ontem (Alerta ativo)
    checklist: [
      { text: 'Homologar endpoints de venda', completed: true },
      { text: 'Conectar banco de custos', completed: false }
    ],
    history: [
      {
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        action: 'Chamado criado',
        statusFrom: null,
        statusTo: 'Aberto',
        author: 'Sistema'
      }
    ]
  },
  {
    id: '2',
    systemName: 'CRM Pulse',
    protocolNumber: '38291',
    description: 'Sincronização de base de clientes cadastrados no painel das gelaterias para campanhas de fidelidade.',
    responsible: 'Juliana Lima',
    priority: 'Média',
    status: 'Em Execução',
    type: 'Atendimento',
    openedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    checklist: [
      { text: 'Configurar Webhook do painel', completed: true },
      { text: 'Testar payload de cadastro', completed: true }
    ],
    history: [
      {
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        action: 'Chamado criado',
        statusFrom: null,
        statusTo: 'Aberto',
        author: 'Sistema'
      },
      {
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        action: "Movido de 'Aberto' para 'Em Execução'",
        statusFrom: 'Aberto',
        statusTo: 'Em Execução',
        author: 'Juliana Lima'
      }
    ]
  }
];

export default function App() {
  const [protocols, setProtocols] = useState([]);
  const [volatileNotes, setVolatileNotes] = useState(null);
  const [saveStatus, setSaveStatus] = useState('Salvo');
  const [operator, setOperator] = useState('');
  const [showOperatorModal, setShowOperatorModal] = useState(false);
  const [notesLoaded, setNotesLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('Onboarding');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProtocol, setEditingProtocol] = useState(null);

  // Initial loading
  useEffect(() => {
    // 1. Operator login verify
    const savedOperator = localStorage.getItem('sp_operator');
    if (!savedOperator) {
      setShowOperatorModal(true);
    } else {
      setOperator(savedOperator);
    }

    // 2. Load Protocols & Notes (Firebase Firestore or Local Contingency)
    if (db) {
      const unsubscribe = onSnapshot(collection(db, 'protocols'), (snapshot) => {
        const data = [];
        snapshot.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() });
        });
        if (data.length === 0) {
          INITIAL_PROTOCOLS.forEach(async (p) => {
            await setDoc(doc(db, 'protocols', p.id), p);
          });
          setProtocols(INITIAL_PROTOCOLS);
        } else {
          setProtocols(data);
        }
      }, (error) => {
        console.warn("Erro ao ouvir snapshot do Firestore, usando LocalStorage:", error);
        loadLocalFallback();
      });

      getDoc(doc(db, 'notes', 'volatile')).then((snap) => {
        if (snap.exists()) {
          setVolatileNotes(snap.data().content || '');
        } else {
          setVolatileNotes('');
        }
        setNotesLoaded(true);
      }).catch((err) => {
        console.warn("Erro ao buscar notas no Firestore, usando LocalStorage:", err);
        setVolatileNotes(localStorage.getItem('sp_volatile_notes') || '');
        setNotesLoaded(true);
      });

      return () => unsubscribe();
    } else {
      loadLocalFallback();
    }
  }, []);

  const loadLocalFallback = () => {
    const saved = localStorage.getItem('sp_roadmap_protocols');
    setProtocols(saved ? JSON.parse(saved) : INITIAL_PROTOCOLS);
    setVolatileNotes(localStorage.getItem('sp_volatile_notes') || '');
    setNotesLoaded(true);
  };

  // Debounced auto-save for Volatile Notes
  useEffect(() => {
    if (volatileNotes === null || !notesLoaded) return;

    setSaveStatus('Salvando...');
    const timer = setTimeout(async () => {
      try {
        if (db) {
          await setDoc(doc(db, 'notes', 'volatile'), { content: volatileNotes });
        } else {
          localStorage.setItem('sp_volatile_notes', volatileNotes);
        }
        setSaveStatus('Salvo na nuvem' + (db ? '' : ' (offline)'));
      } catch (error) {
        console.error("Erro ao salvar notas:", error);
        setSaveStatus('Erro ao salvar');
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [volatileNotes, notesLoaded]);

  // Sync state helpers
  const saveProtocolState = async (updated) => {
    if (db) {
      try {
        await setDoc(doc(db, 'protocols', updated.id), updated);
      } catch (err) {
        console.error("Erro no Firestore write, atualizando localmente:", err);
        updateLocalProtocols(updated);
      }
    } else {
      updateLocalProtocols(updated);
    }
  };

  const updateLocalProtocols = (updated) => {
    setProtocols(prev => {
      const exists = prev.some(p => p.id === updated.id);
      const nextList = exists ? prev.map(p => p.id === updated.id ? updated : p) : [updated, ...prev];
      localStorage.setItem('sp_roadmap_protocols', JSON.stringify(nextList));
      return nextList;
    });
  };

  const deleteProtocolState = async (id) => {
    if (db) {
      try {
        await deleteDoc(doc(db, 'protocols', id));
      } catch (err) {
        console.error("Erro no Firestore delete, atualizando localmente:", err);
        deleteLocalProtocol(id);
      }
    } else {
      deleteLocalProtocol(id);
    }
  };

  const deleteLocalProtocol = (id) => {
    setProtocols(prev => {
      const nextList = prev.filter(p => p.id !== id);
      localStorage.setItem('sp_roadmap_protocols', JSON.stringify(nextList));
      return nextList;
    });
  };

  // Handlers
  const handleSaveProtocol = async (protocolData) => {
    const now = new Date().toISOString();
    let updated;

    if (editingProtocol) {
      const history = editingProtocol.history ? [...editingProtocol.history] : [];
      
      if (editingProtocol.status !== protocolData.status) {
        history.push({
          date: now,
          action: `Status alterado de ${editingProtocol.status} para ${protocolData.status}`,
          statusFrom: editingProtocol.status,
          statusTo: protocolData.status,
          author: operator
        });
      }
      
      if (editingProtocol.responsible !== protocolData.responsible) {
        const from = editingProtocol.responsible || 'Sem responsável';
        const to = protocolData.responsible || 'Sem responsável';
        history.push({
          date: now,
          action: `Responsável alterado de ${from} para ${to}`,
          statusFrom: null,
          statusTo: protocolData.status,
          author: operator
        });
      }
      
      updated = {
        ...protocolData,
        history
      };
    } else {
      updated = {
        ...protocolData,
        history: [
          {
            date: now,
            action: 'Chamado criado',
            statusFrom: null,
            statusTo: protocolData.status,
            author: operator
          }
        ]
      };
    }

    await saveProtocolState(updated);
    setEditingProtocol(null);
  };

  const handleMoveStatus = async (id, newStatus) => {
    const now = new Date().toISOString();
    const item = protocols.find(p => p.id === id);
    if (!item) return;

    const history = item.history ? [...item.history] : [];
    history.push({
      date: now,
      action: `Movido de '${item.status}' para '${newStatus}'`,
      statusFrom: item.status,
      statusTo: newStatus,
      author: operator
    });

    const updated = {
      ...item,
      status: newStatus,
      history
    };

    await saveProtocolState(updated);
  };

  const handleEditProtocol = (protocol) => {
    setEditingProtocol(protocol);
    setIsModalOpen(true);
  };

  const handleDeleteProtocol = async (id) => {
    if (window.confirm('Tem certeza que deseja remover este chamado?')) {
      await deleteProtocolState(id);
    }
  };

  const handleOpenAddModal = () => {
    setEditingProtocol(null);
    setIsModalOpen(true);
  };

  // Helper for Left Column Widget
  const getTodayReminders = () => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return protocols.filter(p => {
      if (p.status === 'Executado' || !p.reminderDate) return false;
      return new Date(p.reminderDate) <= today;
    });
  };

  const reminders = getTodayReminders();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header Section */}
      <header style={{
        backgroundColor: 'var(--red-velvet)',
        color: '#fff',
        padding: '1.25rem 0',
        boxShadow: 'var(--shadow-md)',
        borderBottom: '4px solid var(--ninho)'
      }}>
        <div className="container" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <svg className="mustache-icon" viewBox="0 0 100 50" style={{ fill: '#fff', width: '55px', height: 'auto' }}>
              <path d="M50,45 C35,45 28,30 15,30 C5,30 2,40 2,40 C2,40 10,25 22,25 C35,25 43,38 50,38 C57,38 65,25 78,25 C90,25 98,40 98,40 C98,40 95,30 85,30 C72,30 65,45 50,45 Z" />
            </svg>
            <div>
              <h1 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.5rem',
                letterSpacing: '0.05em',
                lineHeight: '1.2'
              }}>
                SAN PAOLO
              </h1>
              <p style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.7rem',
                letterSpacing: '0.15em',
                opacity: 0.9,
                fontWeight: 600
              }}>
                GELATO E CAFÉ — TI COCKPIT & ROADMAP
              </p>
            </div>
          </div>
          
          <div style={{
            fontSize: '0.9rem',
            fontWeight: 500,
            opacity: 0.9,
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            padding: '0.5rem 1rem',
            borderRadius: '50px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span>Operador: <strong>{operator || 'Não identificado'}</strong></span>
            {operator && (
              <button 
                onClick={() => {
                  localStorage.removeItem('sp_operator');
                  setShowOperatorModal(true);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  textDecoration: 'underline',
                  padding: 0
                }}
              >
                (Alterar)
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container" style={{ flex: 1, padding: '2.5rem 2rem' }}>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'start' }}>
          
          {/* Coluna Esquerda: Foco do Dia (1/3) */}
          <div style={{ flex: '1 1 320px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Widget Lembretes */}
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '24px',
              padding: '1.5rem',
              border: '1px solid rgba(86, 51, 27, 0.1)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <h2 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.3rem',
                color: 'var(--cafezinho)',
                marginBottom: '1rem',
                borderBottom: '2px solid var(--color-red-velvet)',
                paddingBottom: '0.4rem'
              }}>
                Foco do Dia (Lembretes)
              </h2>
              {reminders.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {reminders.map(p => (
                    <div key={p.id} style={{
                      padding: '0.8rem 1rem',
                      borderRadius: '12px',
                      borderLeft: '4px solid var(--color-red-velvet)',
                      backgroundColor: 'rgba(218, 13, 23, 0.04)',
                      fontSize: '0.9rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div style={{ flex: 1, paddingRight: '0.5rem' }}>
                        <div style={{ fontWeight: '700', color: 'var(--cafezinho)' }}>{p.systemName}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Prot: {p.protocolNumber || 'Sem Prot.'}</div>
                      </div>
                      <button
                        onClick={() => handleEditProtocol(p)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--color-red-velvet)',
                          fontSize: '0.8rem',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        Ver
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontStyle: 'italic', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem 0' }}>
                  Sem alertas ou pendências agendadas para hoje.
                </p>
              )}
            </div>

            {/* Widget Bloco de Notas */}
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '24px',
              padding: '1.5rem',
              border: '1px solid rgba(86, 51, 27, 0.1)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <h2 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.3rem',
                color: 'var(--cafezinho)',
                marginBottom: '0.25rem'
              }}>
                Bloco de Notas
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                Anotações persistidas automaticamente.
              </p>
              <div className="notes-container">
                <textarea
                  className="notes-textarea"
                  placeholder="Ramais, IPs, recados rápidos..."
                  value={volatileNotes || ''}
                  onChange={(e) => setVolatileNotes(e.target.value)}
                  disabled={!notesLoaded}
                />
                <div className="notes-status">
                  {saveStatus}
                </div>
              </div>
            </div>
          </div>

          {/* Coluna Direita: Kanban Board (2/3) */}
          <div style={{ flex: '2 1 680px' }}>
            <div className="tabs-container">
              <button 
                className={`tab-btn ${activeTab === 'Onboarding' ? 'active' : ''}`}
                onClick={() => setActiveTab('Onboarding')}
              >
                Onboarding de Sistemas
              </button>
              <button 
                className={`tab-btn ${activeTab === 'Atendimento' ? 'active' : ''}`}
                onClick={() => setActiveTab('Atendimento')}
              >
                Protocolos de Atendimento
              </button>
            </div>
            <RoadmapBoard
              protocols={protocols.filter(p => (p.type || 'Onboarding') === activeTab)}
              onEdit={handleEditProtocol}
              onDelete={handleDeleteProtocol}
              onMoveStatus={handleMoveStatus}
              onOpenAddModal={handleOpenAddModal}
            />
          </div>
        </div>
      </main>

      {/* Protocol Creation/Edit Modal */}
      <ProtocolModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProtocol}
        editingProtocol={editingProtocol}
      />

      {/* Operator Welcome Modal */}
      {showOperatorModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(86, 51, 27, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 2000,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '24px',
            padding: '2.5rem',
            maxWidth: '420px',
            width: '100%',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid rgba(86, 51, 27, 0.1)',
            textAlign: 'center'
          }}>
            <svg className="mustache-icon" viewBox="0 0 100 50" style={{ width: '60px', marginBottom: '1rem' }}>
              <path d="M50,45 C35,45 28,30 15,30 C5,30 2,40 2,40 C2,40 10,25 22,25 C35,25 43,38 50,38 C57,38 65,25 78,25 C90,25 98,40 98,40 C98,40 95,30 85,30 C72,30 65,45 50,45 Z" />
            </svg>
            <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--cafezinho)', fontSize: '1.5rem', marginBottom: '0.75rem' }}>
              Central de TI San Paolo
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              Por favor, informe seu nome de operador de TI para iniciar a auditoria do painel.
            </p>
            <form onSubmit={(e) => {
              e.preventDefault();
              const name = e.target.operatorName.value.trim();
              if (name) {
                localStorage.setItem('sp_operator', name);
                setOperator(name);
                setShowOperatorModal(false);
              }
            }}>
              <input
                type="text"
                name="operatorName"
                placeholder="Seu nome (ex: Lucas Moura)"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  border: '1px solid rgba(86, 51, 27, 0.2)',
                  marginBottom: '1.25rem',
                  fontSize: '0.95rem',
                  outline: 'none',
                  textAlign: 'center'
                }}
              />
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                Acessar Painel
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{
        backgroundColor: 'var(--ninho)',
        borderTop: '1px solid rgba(86, 51, 27, 0.1)',
        padding: '1.5rem 0',
        marginTop: '3rem',
        fontSize: '0.85rem',
        color: 'var(--text-muted)',
        textAlign: 'center'
      }}>
        <div className="container">
          <p>© {new Date().getFullYear()} San Paolo Gelato e Café. Cockpit do Operador de TI.</p>
        </div>
      </footer>
    </div>
  );
}
