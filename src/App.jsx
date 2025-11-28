import React, { useEffect, useState, useCallback } from 'react'
import './App.css'

function formatDateDaysAgo(days) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatDateDMY(dateString) {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

export default function App() {
  const [repos, setRepos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const fetchRepos = useCallback(async (pageToLoad = 1) => {
    if (!hasMore && pageToLoad !== 1) return
    setLoading(true)
    setError(null)
    try {
      const since = formatDateDaysAgo(10)
      const per_page = 30
      const url = `https://api.github.com/search/repositories?q=created:>${since}&sort=stars&order=desc&page=${pageToLoad}&per_page=${per_page}`
      const res = await fetch(url, { headers: { Accept: 'application/vnd.github.v3+json' } })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(`GitHub API error: ${res.status} ${res.statusText} - ${text}`)
      }
      const data = await res.json()
      const items = data.items || []
      // For pagination we replace the list with the page's items
      setRepos(items)
      setHasMore(items.length === per_page)
    } catch (err) {
      setError(err.message || String(err))
    } finally {
      setLoading(false)
    }
  }, [hasMore])

  useEffect(() => {
    fetchRepos(1)
    setPage(1)
    setHasMore(true)
  }, [])

  // Pagination: handlers to change page
  const goToPage = async (newPage) => {
    if (newPage < 1) return
    if (!hasMore && newPage > page) return
    setPage(newPage)
    await fetchRepos(newPage)
    // Scroll back to top after loading the new page
    if (typeof window !== 'undefined' && window.scrollTo) {
      try {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } catch (e) {
        // fallback for older browsers
        window.scrollTo(0, 0)
      }
    }
  }

  const handlePrev = () => goToPage(page - 1)
  const handleNext = () => goToPage(page + 1)

  const formatNumber = n => {
    if (n >= 1_000_000) return `${(n/1_000_000).toFixed(1)}M`
    if (n >= 1000) return `${(n/1000).toFixed(1)}k`
    return String(n)
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Github Trending Repos</h1>
      </header>
      <main className="main">
        {error && (
          <div className="card error-card">
            <strong>Error:</strong> {error}
          </div>
        )}

        {repos.length === 0 && !loading && !error && (
          <div className="card empty">No repositories found.</div>
        )}

        <section className="list">
          {repos.map(repo => (
            <article className="card" key={repo.id}>
              <img className="avatar" src={repo.owner.avatar_url} alt={repo.owner.login} />
              <div className="repo-info">
                <div className="repo-top">
                  <a className="repo-name" href={repo.html_url} target="_blank" rel="noreferrer">
                    {repo.full_name}
                  </a>
                  <div className="star-badge">⭐ {formatNumber(repo.stargazers_count)}</div>
                </div>
                <p className="repo-desc">{repo.description || 'No description'}</p>
                  <div className="repo-date">
                    <span>Published: {formatDateDMY(repo.created_at)}</span>
                  </div>
                <div className="repo-footer">
                  <div className="owner">
                    <img className="small-avatar" src={repo.owner.avatar_url} alt={repo.owner.login} />
                    <span className="owner-name">{repo.owner.login}</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>

        <div className="pagination">
          <button className="page-button" onClick={handlePrev} disabled={page === 1 || loading}>
            ← Prev
          </button>
          <span className="page-info">Page {page}</span>
          <button className="page-button" onClick={handleNext} disabled={!hasMore || loading}>
            Next →
          </button>
        </div>

        {loading && (
          <div className="loading">Loading repositories...</div>
        )}

        {!hasMore && repos.length > 0 && (
          <div className="loading">No more results</div>
        )}
      </main>
    </div>
  )
}
