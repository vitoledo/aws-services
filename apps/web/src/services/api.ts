const API_URL = import.meta.env.VITE_API_URL

export interface RegisterData {
  name: string
  email: string
  cpf: string
  password: string
  photo?: File
}

export interface LoginData {
  email: string
  password: string
}

export interface User {
  name: string
  email: string
  cpf: string
  photo: string | null
}

export const api = {
  async register(data: RegisterData): Promise<User> {
    const formData = new FormData()
    formData.append('name', data.name)
    formData.append('email', data.email)
    formData.append('cpf', data.cpf)
    formData.append('password', data.password)

    if (data.photo) {
      formData.append('photo', data.photo)
    }

    const response = await fetch(`${API_URL}/user/register`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Erro ao criar conta')
    }

    return response.json()
  },

  async login(data: LoginData): Promise<string> {
    const response = await fetch(`${API_URL}/user/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Erro ao fazer login')
    }

    return response.text()
  },

  async getUser(token: string): Promise<User> {
    const response = await fetch(`${API_URL}/user`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Erro ao buscar dados do usuário')
    }

    return response.json()
  },

  async updateUser(token: string, data: { name?: string; photo?: File }): Promise<User> {
    const formData = new FormData()

    if (data.name) {
      formData.append('name', data.name)
    }

    if (data.photo) {
      formData.append('photo', data.photo)
    }

    const response = await fetch(`${API_URL}/user/update`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Erro ao atualizar usuário')
    }

    return response.json()
  },
}
