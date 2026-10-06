import React, { useState, useRef } from 'react';
import Modal from './Modal';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { Camera, Upload, Trash2, Check, X, AlertCircle } from 'lucide-react';

export default function AvatarUploadModal({ isOpen, onClose, onUpdated }) {
  const { user, refreshUser } = useAuth();
  const fileInputRef = useRef(null);

  const [preview, setPreview] = useState(user?.avatar || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Handle file selection from local disk
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setSuccess('');

    if (!file.type.startsWith('image/')) {
      setError('Por favor selecione um arquivo de imagem válido (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('A imagem deve ter no máximo 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Save new avatar
  const handleSave = async () => {
    if (!preview) {
      handleRemove();
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.put('/auth/avatar', { avatar: preview });
      await refreshUser();
      if (onUpdated) onUpdated(preview);
      setSuccess('Foto de perfil salva com sucesso!');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      setError(err.message || 'Erro ao atualizar foto de perfil');
    } finally {
      setLoading(false);
    }
  };

  // Remove avatar completely
  const handleRemove = async () => {
    if (!window.confirm('Tem certeza que deseja remover sua foto de perfil?')) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.delete('/auth/avatar');
      await refreshUser();
      setPreview(null);
      if (onUpdated) onUpdated(null);
      setSuccess('Foto de perfil removida com sucesso!');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      setError(err.message || 'Erro ao remover foto de perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Foto de Perfil do Tatame"
      maxWidth="max-w-md"
    >
      <div className="space-y-5">
        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Avatar Preview */}
        <div className="flex flex-col items-center justify-center pt-2">
          <div className="relative group">
            {preview ? (
              <img
                src={preview}
                alt="Foto de perfil"
                className="w-32 h-32 rounded-full object-cover ring-4 ring-amber-500/60 shadow-xl"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-slate-800 ring-4 ring-slate-700 flex items-center justify-center text-slate-400 text-4xl font-black">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
            )}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-bold gap-1 cursor-pointer"
            >
              <Camera className="w-6 h-6 text-amber-400" />
              <span>Trocar foto</span>
            </button>
          </div>

          <p className="text-xs text-slate-400 mt-3 text-center">
            {preview ? 'Foto selecionada' : 'Nenhuma foto definida (avatar padrão)'}
          </p>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs border border-slate-700 transition"
          >
            <Upload className="w-4 h-4 text-amber-400" />
            <span>Escolher foto do computador / celular</span>
          </button>

          {preview && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 font-semibold text-xs border border-red-800/50 transition disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
              <span>Remover foto de perfil</span>
            </button>
          )}
        </div>

        {/* Save & Cancel */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md transition disabled:opacity-50"
          >
            {loading ? (
              <span>Salvando...</span>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Salvar Foto</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
