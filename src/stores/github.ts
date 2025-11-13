import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import { useAuthStore } from './auth'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export interface GitHubRepo {
  id: number
  name: string
  full_name: string
  description: string
  html_url: string
  default_branch: string
}

export interface GitHubBranch {
  name: string
  commit: {
    sha: string
    url: string
  }
  protected: boolean
}

export interface GitHubPullRequest {
  number: number
  title: string
  state: 'open' | 'closed'
  html_url: string
  created_at: string
  updated_at: string
  user: {
    login: string
    avatar_url: string
  }
  head: {
    ref: string
    sha: string
  }
  base: {
    ref: string
    sha: string
  }
}

export interface GitHubCommit {
  sha: string
  commit: {
    message: string
    author: {
      name: string
      email: string
      date: string
    }
  }
  html_url: string
}

export const useGitHubStore = defineStore('github', () => {
  const authStore = useAuthStore()
  
  const repositories = ref<GitHubRepo[]>([])
  const branches = ref<GitHubBranch[]>([])
  const pullRequests = ref<GitHubPullRequest[]>([])
  const commits = ref<GitHubCommit[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const config = computed(() => ({
    headers: {
      Authorization: `Bearer ${authStore.token}`
    }
  }))

  // Actions
  async function fetchRepositories(owner: string) {
    loading.value = true
    error.value = null
    try {
      const response = await axios.get(
        `${API_URL}/api/github/repos/${owner}`,
        config.value
      )
      repositories.value = response.data
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al cargar repositorios'
      console.error('Error fetching repositories:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchBranches(owner: string, repo: string) {
    loading.value = true
    error.value = null
    try {
      const response = await axios.get(
        `${API_URL}/api/github/repos/${owner}/${repo}/branches`,
        config.value
      )
      branches.value = response.data
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al cargar ramas'
      console.error('Error fetching branches:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchPullRequests(owner: string, repo: string, state = 'open') {
    loading.value = true
    error.value = null
    try {
      const response = await axios.get(
        `${API_URL}/api/github/repos/${owner}/${repo}/pulls?state=${state}`,
        config.value
      )
      pullRequests.value = response.data
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al cargar pull requests'
      console.error('Error fetching pull requests:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchCommits(owner: string, repo: string, branch?: string) {
    loading.value = true
    error.value = null
    try {
      const url = branch 
        ? `${API_URL}/api/github/repos/${owner}/${repo}/commits?branch=${branch}`
        : `${API_URL}/api/github/repos/${owner}/${repo}/commits`
      
      const response = await axios.get(url, config.value)
      commits.value = response.data
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al cargar commits'
      console.error('Error fetching commits:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createBranch(taskId: string, baseBranch: string = 'main', branchName?: string) {
    loading.value = true
    error.value = null
    try {
      const response = await axios.post(
        `${API_URL}/api/github/tasks/${taskId}/create-branch`,
        { baseBranch, branchName },
        config.value
      )
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al crear rama'
      console.error('Error creating branch:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteBranch(owner: string, repo: string, branchName: string) {
    loading.value = true
    error.value = null
    try {
      const response = await axios.delete(
        `${API_URL}/api/github/repos/${owner}/${repo}/branches/${branchName}`,
        config.value
      )
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Error al eliminar rama'
      console.error('Error deleting branch:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createPullRequest(taskId: string, title: string, description: string) {
    loading.value = true
    error.value = null
    try {
      const response = await axios.post(
        `${API_URL}/api/github/tasks/${taskId}/create-pr`,
        { title, description },
        config.value
      )
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al crear pull request'
      console.error('Error creating pull request:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function setupWebhook(boardId: string) {
    loading.value = true
    error.value = null
    try {
      const response = await axios.post(
        `${API_URL}/api/github/boards/${boardId}/setup-webhook`,
        {},
        config.value
      )
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al configurar webhook'
      console.error('Error setting up webhook:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  function $reset() {
    repositories.value = []
    branches.value = []
    pullRequests.value = []
    commits.value = []
    loading.value = false
    error.value = null
  }

  return {
    // State
    repositories,
    branches,
    pullRequests,
    commits,
    loading,
    error,
    
    // Actions
    fetchRepositories,
    fetchBranches,
    fetchPullRequests,
    fetchCommits,
    createBranch,
    deleteBranch,
    createPullRequest,
    setupWebhook,
    $reset
  }
})
