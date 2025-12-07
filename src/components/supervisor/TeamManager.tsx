import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/Button';
import { GlassCard } from '@/components/GlassCard';
import { Modal } from '@/components/Modal';
import { Plus, Edit2, Trash2, User, Shield, Eye, EyeOff } from 'lucide-react';

const colors = ['blue', 'purple', 'green', 'indigo', 'red', 'yellow', 'pink', 'cyan'];
const avatars = ['👨‍💼', '👩‍💼', '👨‍💻', '👩‍💻', '👨‍🔧', '👩‍🔧', '👨‍🎨', '👩‍🎨'];

const TeamManager = () => {
  const { userProfiles, updateProfile, deleteProfile } = useApp();
  const { addToast } = useToast();
  
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingUsername, setEditingUsername] = useState<string | null>(null);
  const [deleteUsername, setDeleteUsername] = useState<string | null>(null);
  const [showPin, setShowPin] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    color: 'blue',
    avatar: '👨‍💼',
    pin: '',
  });

  const handleEdit = (username: string) => {
    const profile = userProfiles[username];
    setFormData({
      name: profile.name,
      role: profile.role,
      color: profile.color,
      avatar: profile.avatar,
      pin: profile.pin || '',
    });
    setEditingUsername(username);
    setShowPin(false);
    setShowModal(true);
  };

  const handleAdd = () => {
    setFormData({
      name: '',
      role: '',
      color: 'blue',
      avatar: '👨‍💼',
      pin: '',
    });
    setEditingUsername(null);
    setShowPin(false);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.role.trim()) {
      addToast('Preencha todos os campos obrigatórios', 'error');
      return;
    }

    const username = editingUsername || formData.name.toLowerCase().replace(/\s/g, '');
    
    if (!editingUsername && userProfiles[username]) {
      addToast('Já existe um operador com este nome', 'error');
      return;
    }

    const profileData = {
      name: formData.name,
      role: formData.role,
      color: formData.color,
      avatar: formData.avatar,
      pin: formData.pin || undefined,
    };

    updateProfile(username, profileData);
    addToast(editingUsername ? 'Operador atualizado!' : 'Operador adicionado!', 'success');
    setShowModal(false);
  };

  const handleDelete = () => {
    if (!deleteUsername) return;
    
    if (Object.keys(userProfiles).length === 1) {
      addToast('Não é possível excluir o último operador', 'error');
      return;
    }

    deleteProfile(deleteUsername);
    addToast('Operador removido', 'success');
    setShowDeleteModal(false);
    setDeleteUsername(null);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestão de Equipe</h2>
          <p className="text-muted-foreground">Adicione e gerencie operadores</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4" />
          Novo Operador
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(userProfiles).map(([username, profile]) => (
          <GlassCard key={username} className={editingUsername === username ? 'ring-2 ring-primary' : ''}>
            <div className="flex items-start gap-4 mb-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl bg-${profile.color}-500/20`}>
                {profile.avatar}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold">{profile.name}</h3>
                <p className="text-sm text-muted-foreground">{profile.role}</p>
                {profile.pin && (
                  <span className="inline-flex items-center gap-1 text-xs text-primary mt-1">
                    <Shield className="w-3 h-3" /> PIN ativo
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1"
                onClick={() => handleEdit(username)}
              >
                <Edit2 className="w-4 h-4" />
                Editar
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  setDeleteUsername(username);
                  setShowDeleteModal(true);
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Edit/Add Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingUsername ? 'Editar Operador' : 'Novo Operador'}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Nome *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 rounded-xl bg-muted border border-border focus:ring-2 focus:ring-primary focus:outline-none"
              placeholder="Nome do operador"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Função/Cargo *</label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-4 py-2 rounded-xl bg-muted border border-border focus:ring-2 focus:ring-primary focus:outline-none"
              placeholder="Ex: Operador de Sistemas"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              PIN de Acesso
            </label>
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                value={formData.pin}
                onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
                className="w-full px-4 py-2 rounded-xl bg-muted border border-border focus:ring-2 focus:ring-primary focus:outline-none pr-12"
                placeholder="Deixe vazio para acesso sem PIN"
                maxLength={10}
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Se definido, o operador precisará digitar o PIN para acessar o sistema.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Cor do Perfil</label>
            <div className="grid grid-cols-8 gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-10 h-10 rounded-lg bg-${color}-500 ${
                    formData.color === color ? 'ring-2 ring-offset-2 ring-primary' : ''
                  }`}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Avatar</label>
            <div className="grid grid-cols-8 gap-2">
              {avatars.map((avatar) => (
                <button
                  key={avatar}
                  onClick={() => setFormData({ ...formData, avatar })}
                  className={`w-10 h-10 rounded-lg text-2xl flex items-center justify-center ${
                    formData.avatar === avatar ? 'bg-primary/20 ring-2 ring-primary' : 'bg-muted hover:bg-muted/70'
                  }`}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="ghost" onClick={() => setShowModal(false)} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleSave} className="flex-1">
              Salvar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirmar Exclusão"
        size="sm"
      >
        <div className="space-y-4">
          <p>Tem certeza que deseja remover este operador? Esta ação não pode ser desfeita.</p>
          {deleteUsername && (
            <div className="p-4 bg-danger/10 rounded-xl">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-danger" />
                <div>
                  <div className="font-medium">{userProfiles[deleteUsername].name}</div>
                  <div className="text-sm text-muted-foreground">{userProfiles[deleteUsername].role}</div>
                </div>
              </div>
            </div>
          )}
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)} className="flex-1">
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDelete} className="flex-1">
              Excluir
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TeamManager;
