const PLACEHOLDER_CARDS = Array.from({ length: 8 }, (_, i) => i + 1)

function App() {
  return (
    <>
      <header className="top-banner">
        <p>Lorem ipsum dolor sit amet — filler banner text</p>
      </header>

      <main className="content">
        <h1 className="title">Expenso</h1>

        <ul className="card-list">
          {PLACEHOLDER_CARDS.map((n) => (
            <li key={n} className="card">
              Option {n}
            </li>
          ))}
        </ul>
      </main>
    </>
  )
}

export default App
