import { useState, FormEvent, ChangeEvent, useEffect } from 'react'
import './App.css'
import { api, User } from './services/api'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [token, setToken] = useState('')
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [userData, setUserData] = useState<User | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editPhotoPreview, setEditPhotoPreview] = useState<string | null>(null)

  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    if (savedToken) {
      setLoading(true)
      api
        .getUser(savedToken)
        .then((user) => {
          setUserData(user)
          setToken(savedToken)
          setIsAuthenticated(true)
        })
        .catch(() => {
          localStorage.removeItem('token')
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [])

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      const token = await api.login({ email, password })
      setToken(token)
      localStorage.setItem('token', token)

      const user = await api.getUser(token)
      setUserData(user)
      setIsAuthenticated(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setPhotoPreview(null)
    }
  }

  const handleEditPhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setEditPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setEditPhotoPreview(null)
    }
  }

  const handleUpdate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const photoFile = formData.get('photo') as File

    const updateData: { name?: string; photo?: File } = {}
    
    if (name && name !== userData?.name) {
      updateData.name = name
    }
    
    if (photoFile && photoFile.size > 0) {
      updateData.photo = photoFile
    }

    if (Object.keys(updateData).length === 0) {
      setError('Nenhuma alteração foi feita')
      setLoading(false)
      return
    }

    try {
      await api.updateUser(token, updateData)
      const updatedUser = await api.getUser(token)
      setUserData(updatedUser)
      setIsEditing(false)
      setEditPhotoPreview(null)
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar dados')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const cpf = formData.get('cpf') as string
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string
    const photoFile = formData.get('photo') as File

    if (password !== confirmPassword) {
      setError('As senhas não coincidem')
      setLoading(false)
      return
    }

    try {
      await api.register({
        name,
        email,
        cpf,
        password,
        photo: photoFile.size > 0 ? photoFile : undefined,
      })
      setIsLogin(true)
      setError('')
      setPhotoPreview(null)
      alert('Conta criada com sucesso! Faça login para continuar.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      {!isAuthenticated ? (
        <div className="auth-container">
          <h1>{isLogin ? 'Login' : 'Criar Conta'}</h1>
          
          {error && <div className="error-message">{error}</div>}

          {isLogin ? (
            <form className="auth-form" onSubmit={handleLogin}>
              <input
                type="email"
                name="email"
                placeholder="Email"
                required
                disabled={loading}
              />
              <input
                type="password"
                name="password"
                placeholder="Senha"
                required
                disabled={loading}
              />
              <button type="submit" disabled={loading}>
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleRegister}>
              <div className="photo-upload">
                <label htmlFor="photo" className="photo-label">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="photo-preview"
                    />
                  ) : (
                    <div className="photo-placeholder">
                      <span>Adicionar foto</span>
                    </div>
                  )}
                </label>
                <input
                  type="file"
                  id="photo"
                  name="photo"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  disabled={loading}
                  className="photo-input"
                />
              </div>

              <input
                type="text"
                name="name"
                placeholder="Nome completo"
                required
                disabled={loading}
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                required
                disabled={loading}
              />
              <input
                type="text"
                name="cpf"
                placeholder="CPF (apenas números)"
                required
                minLength={11}
                maxLength={11}
                disabled={loading}
              />
              <input
                type="password"
                name="password"
                placeholder="Senha (mínimo 6 caracteres)"
                required
                minLength={6}
                maxLength={20}
                disabled={loading}
              />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirmar senha"
                required
                disabled={loading}
              />
              <button type="submit" disabled={loading}>
                {loading ? 'Criando...' : 'Criar Conta'}
              </button>
            </form>
          )}

          <p className="toggle-auth">
            {isLogin ? 'Não tem uma conta? ' : 'Já tem uma conta? '}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin)
                setError('')
                setPhotoPreview(null)
              }}
              className="link-button"
              disabled={loading}
            >
              {isLogin ? 'Criar conta' : 'Fazer login'}
            </button>
          </p>
        </div>
      ) : (
        <div className="card-container">
          <div className="card-header">
            <h1>Cartão de Acesso</h1>
            {!isEditing && (
              <button
                className="edit-button"
                onClick={() => setIsEditing(true)}
                disabled={loading}
              >
                Editar
              </button>
            )}
          </div>

          {error && <div className="error-message">{error}</div>}

          {userData && !isEditing && (
            <div className="card-content">
              {userData.photo && (
                <div className="card-photo">
                  <img
                    src={userData.photo}
                    alt={userData.name}
                  />
                </div>
              )}

              <div className="card-info">
                <div className="info-item">
                  <span className="info-label">Nome:</span>
                  <span className="info-value">{userData.name}</span>
                </div>

                <div className="info-item">
                  <span className="info-label">Email:</span>
                  <span className="info-value">{userData.email}</span>
                </div>

                <div className="info-item">
                  <span className="info-label">CPF:</span>
                  <span className="info-value">{userData.cpf}</span>
                </div>
              </div>
            </div>
          )}

          {userData && isEditing && (
            <form className="edit-form" onSubmit={handleUpdate}>
              <div className="photo-upload">
                <label htmlFor="editPhoto" className="photo-label">
                  {editPhotoPreview ? (
                    <img
                      src={editPhotoPreview}
                      alt="Preview"
                      className="photo-preview"
                    />
                  ) : userData.photo ? (
                    <img
                      src={userData.photo}
                      alt={userData.name}
                      className="photo-preview"
                    />
                  ) : (
                    <div className="photo-placeholder">
                      <span>Adicionar foto</span>
                    </div>
                  )}
                </label>
                <input
                  type="file"
                  id="editPhoto"
                  name="photo"
                  accept="image/*"
                  onChange={handleEditPhotoChange}
                  disabled={loading}
                  className="photo-input"
                />
              </div>

              <div className="edit-field">
                <label className="edit-label">Nome:</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={userData.name}
                  disabled={loading}
                  className="edit-input"
                />
              </div>

              <div className="edit-buttons">
                <button type="submit" disabled={loading} className="save-button">
                  {loading ? 'Salvando...' : 'Salvar'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false)
                    setEditPhotoPreview(null)
                    setError('')
                  }}
                  disabled={loading}
                  className="cancel-button"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          <button
            className="logout-button"
            onClick={() => {
              setIsAuthenticated(false)
              setToken('')
              setUserData(null)
              setIsEditing(false)
              setEditPhotoPreview(null)
              localStorage.removeItem('token')
            }}
          >
            Sair
          </button>
        </div>
      )}
    </div>
  )
}

export default App
