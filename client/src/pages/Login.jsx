import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { 
  ShieldCheck, 
  UserCheck, 
  Lock, 
  Mail, 
  User, 
  Phone, 
  KeyRound, 
  CheckCircle2, 
  ArrowLeft,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import CyberOrientalBackground from '../components/CyberOrientalBackground';

const BELT_OPTIONS = ['Branca', 'Azul', 'Roxa', 'Marrom', 'Preta'];

export default function Login() {
  const { login, register } = useAuth();
  
  // 'login' | 'register' | 'forgot'
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Login / Register state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('student');
  const [belt, setBelt] = useState('Branca');
  const [degrees, setDegrees] = useState(0);
  const [phone, setPhone] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');

  // Forgot Password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [stepForgot, setStepForgot] = useState(1); // 1: request code, 2: reset password

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'register') {
        await register({
          name,
          email,
          password,
          role,
          belt,
          degrees: parseInt(degrees, 10),
          phone,
          birthdate,
          weight: weight ? parseFloat(weight) : null,
          height: height ? parseFloat(height) : null,
          emergency_contact: emergencyContact,
        });
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err.message || 'Falha na autenticação');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail, demoPass) => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await login(demoEmail, demoPass);
    } catch (err) {
      setError(err.message || 'Falha ao acessar conta de demonstração');
    } finally {
      setLoading(false);
    }
  };

  // Forgot password request code
  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await api.post('/auth/forgot-password', { email: forgotEmail });
      setGeneratedCode(res.code);
      setRecoveryCode(res.code); // Pre-fill for instant seamless recovery
      setSuccess(`Código de segurança gerado para ${res.userName || 'sua conta'}!`);
      setStepForgot(2);
    } catch (err) {
      setError(err.message || 'Erro ao buscar e-mail cadastrado');
    } finally {
      setLoading(false);
    }
  };

  // Reset password submit
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('As senhas digitadas não coincidem.');
      return;
    }

    if (newPassword.length < 6) {
      setError('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', {
        email: forgotEmail,
        code: recoveryCode,
        newPassword
      });

      setSuccess(res.message);
      // Pre-fill login
      setEmail(forgotEmail);
      setPassword(newPassword);

      setTimeout(() => {
        setMode('login');
        setStepForgot(1);
        setGeneratedCode('');
        setRecoveryCode('');
        setNewPassword('');
        setConfirmPassword('');
      }, 2500);
    } catch (err) {
      setError(err.message || 'Código inválido ou expirado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060608] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background Animated Floating Bolinhas & Cyber Oriental Matrix */}
      <CyberOrientalBackground />

      <div className="w-full max-w-md z-10">
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500/20 via-black to-red-950/40 border border-amber-500/60 mb-3 shadow-[0_0_25px_rgba(245,158,11,0.35)] relative group animate-float overflow-hidden">
            <img 
              src="/kimono-preview.jpg" 
              alt="Kimono 3D Arte Suave" 
              className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
            />
            <span className="absolute bottom-1 right-1 text-[8px] font-black px-1 rounded bg-black/80 border border-amber-500/60 text-amber-400 font-mono shadow">
              柔術
            </span>
          </div>
          <h1 className="text-3xl font-black uppercase tracking-wider bg-gradient-to-r from-amber-300 via-amber-100 to-amber-400 bg-clip-text text-transparent">
            Arte Suave
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5 flex items-center justify-center gap-1.5 font-medium">
            <span>Cyber Dojo</span>
            <span className="text-zinc-600">•</span>
            <span className="text-amber-400/90 font-mono">押忍 BJJ PLATFORM</span>
          </p>
        </div>

        {/* Demo Accounts Quick-Access */}
        <div className="mb-5 p-3.5 rounded-xl bg-zinc-950/90 border border-amber-500/35 shadow-lg cyber-card">
          <div className="text-xs font-bold text-zinc-300 mb-2 flex items-center gap-1.5 uppercase tracking-wide">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>Acesso Rápido com 1 Clique:</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('professor@artesuave.com', 'senha123')}
              className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-bold transition shadow-xs hover:shadow-[0_0_10px_rgba(245,158,11,0.3)]"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              Mestre Carlos (Prof)
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('aluno@artesuave.com', 'senha123')}
              className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-red-950/60 hover:bg-red-900/60 border border-red-700/50 text-red-300 text-xs font-bold transition shadow-xs hover:shadow-[0_0_10px_rgba(239,68,68,0.3)]"
            >
              <UserCheck className="w-3.5 h-3.5 text-red-400" />
              Gabriel Rocha (Aluno)
            </button>
          </div>
        </div>

        {/* Main Card with Tabs */}
        <div className="bg-zinc-950 border border-amber-500/30 rounded-2xl shadow-2xl backdrop-blur-sm overflow-hidden cyber-glow-gold">
          {/* Top Tabs */}
          <div className="grid grid-cols-3 border-b border-zinc-800 bg-black/80 text-xs font-bold">
            <button
              onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
              className={`py-3 text-center transition ${
                mode === 'login'
                  ? 'text-amber-400 border-b-2 border-amber-500 bg-zinc-950'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); setSuccess(''); }}
              className={`py-3 text-center transition ${
                mode === 'register'
                  ? 'text-amber-400 border-b-2 border-amber-500 bg-zinc-950'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Cadastrar
            </button>
            <button
              onClick={() => { setMode('forgot'); setError(''); setSuccess(''); }}
              className={`py-3 text-center transition flex items-center justify-center gap-1 ${
                mode === 'forgot'
                  ? 'text-amber-400 border-b-2 border-amber-500 bg-zinc-950'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <KeyRound className="w-3 h-3" />
              Esqueci a Senha
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-950/60 border border-red-800 text-red-300 text-xs">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                {success}
              </div>
            )}

            {/* TAB: FORGOT PASSWORD */}
            {mode === 'forgot' ? (
              <div className="space-y-4">
                <div className="text-center mb-2">
                  <h3 className="text-base font-bold text-white flex items-center justify-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-amber-400" />
                    Recuperação de Acesso
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    {stepForgot === 1 
                      ? 'Informe seu e-mail cadastrado para gerar seu código de redefinição.'
                      : 'Digite o código de verificação e escolha sua nova senha.'}
                  </p>
                </div>

                {stepForgot === 1 ? (
                  <form onSubmit={handleRequestCode} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Seu E-mail Cadastrado
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                        <input
                          type="email"
                          required
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          placeholder="aluno@artesuave.com"
                          className="w-full pl-9 pr-3 py-2 bg-black border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md transition disabled:opacity-50"
                    >
                      {loading ? 'Buscando...' : 'Gerar Código de Recuperação'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleResetPassword} className="space-y-3.5">
                    {generatedCode && (
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center">
                        <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                          Código de Verificação Gerado:
                        </span>
                        <span className="text-xl font-black text-amber-400 tracking-widest mt-0.5 block">
                          {generatedCode}
                        </span>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Código de Verificação (6 dígitos)
                      </label>
                      <input
                        type="text"
                        required
                        value={recoveryCode}
                        onChange={(e) => setRecoveryCode(e.target.value)}
                        placeholder="Ex: 123456"
                        className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-sm text-white text-center font-mono font-bold tracking-wider focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Nova Senha
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                        <input
                          type="password"
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Mínimo 6 caracteres"
                          className="w-full pl-9 pr-3 py-2 bg-black border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Confirmar Nova Senha
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                        <input
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Digite novamente"
                          className="w-full pl-9 pr-3 py-2 bg-black border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setStepForgot(1)}
                        className="w-1/3 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-zinc-300 font-semibold text-xs transition"
                      >
                        Voltar
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-2/3 py-2 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md transition disabled:opacity-50"
                      >
                        {loading ? 'Salvando...' : 'Salvar Nova Senha'}
                      </button>
                    </div>
                  </form>
                )}

                <div className="pt-3 border-t border-zinc-800 text-center">
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                    className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center justify-center gap-1 mx-auto"
                  >
                    <ArrowLeft className="w-3 h-3" /> Voltar para o Login
                  </button>
                </div>
              </div>
            ) : (
              /* TAB: LOGIN & REGISTER */
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'register' && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Nome Completo
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Ex: Royce Gracie"
                          className="w-full pl-9 pr-3 py-2 bg-black border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1">
                          Tipo de Conta
                        </label>
                        <select
                          value={role}
                          onChange={(e) => setRole(e.target.value)}
                          className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
                        >
                          <option value="student">Aluno</option>
                          <option value="professor">Professor / Mestre</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1">
                          Faixa Atual
                        </label>
                        <select
                          value={belt}
                          onChange={(e) => setBelt(e.target.value)}
                          className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
                        >
                          {BELT_OPTIONS.map((b) => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1">
                          Graus na Faixa (0 a 4)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="4"
                          value={degrees}
                          onChange={(e) => setDegrees(e.target.value)}
                          className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1">
                          Peso Atual (kg)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          placeholder="Ex: 77.5"
                          className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1">
                          Altura (cm)
                        </label>
                        <input
                          type="number"
                          value={height}
                          onChange={(e) => setHeight(e.target.value)}
                          placeholder="Ex: 178"
                          className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1">
                          Telefone / WhatsApp
                        </label>
                        <input
                          type="text"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="(11) 99999-9999"
                          className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    E-mail
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seuemail@exemplo.com"
                      className="w-full pl-9 pr-3 py-2 bg-black border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-zinc-300">
                      Senha
                    </label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => { setMode('forgot'); setError(''); setSuccess(''); }}
                        className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold transition"
                      >
                        Esqueceu a senha?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 bg-black border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-md transition disabled:opacity-50 mt-2"
                >
                  {loading ? 'Processando...' : mode === 'register' ? 'Concluir Cadastro no Tatame' : 'Entrar no Sistema'}
                </button>
              </form>
            )}

            {mode !== 'forgot' && (
              <div className="mt-6 text-center border-t border-zinc-800 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === 'register' ? 'login' : 'register');
                    setError('');
                    setSuccess('');
                  }}
                  className="text-xs text-amber-400 hover:text-amber-300 font-medium"
                >
                  {mode === 'register'
                    ? 'Já tem uma conta? Fazer login'
                    : 'Novo aluno ou professor? Cadastre-se aqui'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
